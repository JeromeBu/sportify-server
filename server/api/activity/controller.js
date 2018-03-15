const Activity = require('./model')
const mongoose = require('mongoose')
const Center = require('../center/model')
const chalk = require('chalk')

exports.index = (req, res, next) => {
  Activity.find({})
    .populate([
      {
        path: 'center',
        model: Center
      }
    ])
    .exec()
    .then(activities => {
      // console.log(chalk.green('ACTIVITIES'), activities)
      if (!activities) res.status(404).json({ error: 'Activities not found' })
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
        from: 'sessions', // the model
        localField: 'sessions', // the nested object
        foreignField: '_id', // le match
        as: 'sessions_docs' // renvoie dans un array sessions_docs
      }
    },
    {
      $match: {
        _id: mongoose.Types.ObjectId(id)
      }
    },
    {
      $project: {
        name: 1,
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
    }
  ])
    .then(activity => {
      console.log('activity', activity)
      if (!activity) res.status(404).json({ error: 'activity not found' })
      return res.json(activity)
    })
    .catch(err => {
      console.log(chalk.red('ERROR'), err)
      res.status(503)
      return next(err.message)
    })
}
