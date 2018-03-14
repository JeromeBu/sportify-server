const Activity = require('./model')
const Center = require('../center/model')

exports.index = (req, res, next) => {
  Activity.find({})
    .populate({
      path: 'center',
      model: Center
    })
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
