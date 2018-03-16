const Activity = require('./model')
const mongoose = require('mongoose')
const Center = require('../center/model')
const Session = require('../session/model')
const chalk = require('chalk')

exports.index = (req, res, next) => {
  Activity.find({})
    .populate([
      {
        path: 'center',
        model: Center
      },
      {
        path: 'sessions',
        model: Session
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
        from: 'centers', // the model mongoose mets au pluriel cet enfoiré
        localField: 'center', // the nested object
        foreignField: '_id', // le match
        as: 'center_doc' // renvoie dans un object de center
      }
    },
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
    { $unwind: '$center_doc' }, // desconstruit l'array
    {
      $project: {
        name: 1,
        center_doc: { name: 1, address: 1 },
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
