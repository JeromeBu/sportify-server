const Center = require('../center/model')
const Activity = require('./model')
const mongoose = require('mongoose')
const chalk = require('chalk')

exports.index = (req, res, next) => {
  const today = new Date()
  const long = isNaN(req.query.long) ? 0 : parseFloat(req.query.long)
  const lat = isNaN(req.query.lat) ? 0 : parseFloat(req.query.lat)

  Center.aggregate([
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [long, lat]
        },
        distanceField: 'distance',
        spherical: true
      }
    },
    {
      $lookup: {
        from: 'activities', // the model
        localField: 'activities', // the nested object
        foreignField: '_id', // le match
        as: 'activities_docs' // renvoie dans un array sessions_docs
      }
    },
    { $unwind: '$activities_docs' },
    { $unwind: '$activities_docs.sessions' },
    {
      $lookup: {
        from: 'sessions', // the model
        localField: 'activities_docs.sessions', // the nested object
        foreignField: '_id', // le match
        as: 'sessions_docs' // renvoie dans un array sessions_docs
      }
    },
    {
      $match: { 'sessions_docs.startsAt': { $gte: today } } // on ne veut que des sessions actuelles
    },
    { $sort: { 'sessions_docs.startsAt': 1 } },
    { $unwind: '$sessions_docs' },
    {
      $project: {
        _id: '$activities_docs._id',
        name: '$activities_docs.name',
        image: '$activities_docs.image',
        distance: '$distance',
        center: '$name',
        sessions: '$sessions_docs.startsAt'
      }
    },
    {
      $group: {
        _id: '$_id',
        name: { $first: '$name' },
        image: { $first: '$image' },
        distance: { $first: '$distance' },
        center: { $first: '$center' },
        sessions: { $first: '$sessions' }
      }
    }
  ])
    .then(activities => {
      console.log(chalk.green('ACTIVITIES'), activities)
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
    {
      $match: { 'sessions_docs.startsAt': { $gte: today } } // on ne veut que des sessions actuelles
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
      // on a besoin de populate l'activity
      $lookup: {
        from: 'activities',
        localField: 'sessions_docs.activity',
        foreignField: '_id',
        as: 'sessions_docs.activity'
      }
    },
    { $unwind: '$sessions_docs.activity' },
    {
      // on a besoin de populate le center d'activity
      $lookup: {
        from: 'centers',
        localField: 'sessions_docs.activity.center',
        foreignField: '_id',
        as: 'sessions_docs.activity.center'
      }
    },
    { $unwind: '$sessions_docs.activity.center' },
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
            bookedBy: '$sessions_docs.bookedBy',
            capacity: '$sessions_docs.capacity',
            duration: '$sessions_docs.duration',
            peoplePresent: '$sessions_docs.peoplePresent',
            startsAt: '$sessions_docs.startsAt',
            activity: {
              name: '$sessions_docs.activity.name',
              center: { name: '$sessions_docs.activity.center.name' }
            },
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
      // envoyer ce que l'on souhaite
      $project: {
        name: 1,
        image: 1,
        center: {
          name: 1,
          address: 1
        },
        sessions: 1
      }
    }
  ])
    .then(body => {
      const activity = body[0]
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
