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
      // c'est le populate version aggregate
      $lookup: {
        from: 'centers', // the model mongoose mets au pluriel cet enfoiré
        localField: 'center', // the nested object
        foreignField: '_id', // le match
        as: 'center' // renvoie dans un object de center
      }
    },
    {
      // c'est le populate version aggregate
      $lookup: {
        from: 'sessions', // the model
        localField: 'sessions', // the nested object
        foreignField: '_id', // le match
        as: 'sessions' // renvoie dans un array sessions
      }
    },
    {
      $match: {
        _id: mongoose.Types.ObjectId(id)
      }
    },
    {
      $unwind: '$center'
    }, // desconstruit l'array
    {
      $project: {
        name: 1,
        image: 1,
        center: {
          name: 1,
          address: 1
        },
        // on filtre le nouvelle array sessions
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
    .then(activities => {
      const activity = activities[0]
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
