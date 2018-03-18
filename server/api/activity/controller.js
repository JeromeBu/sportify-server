const Activity = require('./model')
const mongoose = require('mongoose')
const chalk = require('chalk')

exports.index = (req, res, next) => {
  const today = new Date()

  Activity.aggregate([
    // Filter first
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [2.36051359999999, 48.8737157] },
        distanceField: 'distance',
        spherical: true
      }
    },
    // Then join
    {
      $lookup: {
        from: 'sessions', // the model
        localField: 'sessions', // the nested object
        foreignField: '_id', // le match
        as: 'sessions_docs' // renvoie dans un array sessions_docs
      }
    },
    {
      $lookup: {
        from: 'centers', // the model
        localField: 'center', // the nested object
        foreignField: '_id', // le match
        as: 'centers_docs' // renvoie dans un array sessions_docs
      }
    },
    {
      $project: {
        name: 1,
        image: 1,
        distance: 1,
        centers_docs: 1,
        // on filtre le nouvelle array sessions_docs
        sessions_docs: {
          $filter: {
            input: '$sessions_docs',
            as: 'date', // kind of element of an iteration
            cond: {
              $gte: ['$$date.startsAt', today.toISOString()]
            }
          }
        }
      }
    },
    { $unwind: '$sessions_docs' },
    { $unwind: '$centers_docs' },
    { $sort: { 'sessions_docs.startsAt': 1 } },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        image: { $first: '$image' },
        distance: { $first: '$distance' },
        center: { $first: '$centers_docs.name' },
        sessions: { $first: '$sessions_docs.startsAt' }
      }
    }
  ])
    .then(activities => {
      // console.log(chalk.green('ACTIVITIES'), activities)
      if (!activities)
        return res.status(404).json({
          error: 'Activities not found'
        })
      return res.json(activities)
    })
    .catch(err => {
      console.log(chalk.red('ERROR'), err)
      res.status(503)
      return next(err.message)
    })
}

exports.show = (req, res, next) => {
  const { id } = req.params
  // send only sessions that are for the current day or above
  const today = new Date()

  Activity.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(id)
      }
    },
    {
      // c'est le populate version aggregate
      $lookup: {
        from: 'sessions', // référence au model
        localField: 'sessions', // l'attribut côté Activity
        foreignField: '_id', // l'attribut côté sessions
        as: 'sessions_docs' // renvoie dans un array sessions_docs
      }
    },
    {
      $unwind: '$sessions_docs' // on déconstruit l'array sessions_docs
    },
    { $sort: { 'sessions_docs.startsAt': 1 } }, // pour sortir les dates dans l'odre croissant
    {
      // on a besoin de populate le teacher
      $lookup: {
        from: 'users',
        localField: 'sessions_docs.teacher',
        foreignField: '_id',
        as: 'sessions_docs.teacher'
      }
    },
    { $unwind: '$sessions_docs.teacher' }, // de déconstruire l'array pour prendre ce que l'on veut
    {
      $group: {
        // il faut ensuite tout regrouper
        _id: '$_id', // obligatoire
        name: { $first: '$name' }, // first retourne le premier doc de chaque group
        center: { $first: '$center' },
        image: { $first: '$image' },
        sessions: {
          $push: {
            _id: '$sessions_docs._id',
            activity: '$sessions_docs.activity',
            bookedBy: '$sessions_docs.bookedBy',
            capacity: '$sessions_docs.capacity',
            duration: '$sessions_docs.duration',
            peoplePresent: '$sessions_docs.peoplePresent',
            startsAt: '$sessions_docs.startsAt',
            teacher: {
              _id: '$sessions_docs.teacher._id',
              firstName: '$sessions_docs.teacher.account.firstName',
              lastName: '$sessions_docs.teacher.account.lastName'
            }
          }
        }
      }
    },
    {
      $lookup: {
        // besoin de populate pour prendre le name et l'address
        from: 'centers',
        localField: 'center',
        foreignField: '_id',
        as: 'center'
      }
    },
    { $unwind: '$center' },
    {
      //   // envoyer ce que l'on souhaite
      $project: {
        name: 1,
        image: 1,
        center: {
          name: 1,
          address: 1
        },
        // on filtre le nouvel array sessions pour n'avoir que les sessions à actuelles
        sessions: {
          $filter: {
            input: '$sessions',
            as: 'date', // kind of element of an iteration
            cond: {
              $gte: ['$$date.startsAt', today.toISOString()]
            }
          }
        }
      }
    }
  ])
    .then(body => {
      const activity = body[0]
      console.log('activity : ', activity)
      console.log('session exemple :', activity.sessions.activity)
      console.log('teacher exemple :', activity.sessions.teacher)
      if (!activity)
        return res.status(404).json({ error: 'activity not found' })
      return res.json(activity)
    })
    .catch(err => {
      console.log(chalk.red('ERROR'), err)
      res.status(503)
      return next(err.message)
    })
}

// { month: { $month: "$date" }, day: { $dayOfMonth: "$date" }, year: { $year: "$date" } }
