const Activity = require('./model')

exports.index = (req, res, next) => {
  Activity.find({})
    .exec()
    .then(activities => {
      if (!activities) res.status(404).json({ error: 'Activities not found' })
      res.json(activities)
    })
    .catch(err => {
      res.status(503)
      return next(err.message)
    })
}
