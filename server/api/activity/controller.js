const Activity = require('./model')
const Center = require('../center/model')
const Session = require('../session/model')
const User = require('../user/model')

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
      if (!activities) res.status(404).json({ error: 'Activities not found' })
      res.json(activities)
    })
    .catch(err => {
      console.log('ERROR', err)
      res.status(503)
      return next(err.message)
    })
}
