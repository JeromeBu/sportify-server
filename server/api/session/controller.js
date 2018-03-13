const Session = require('./model')

exports.get = (req, res, next) => {
  Session.find({})
    .exec()
    .then(sessions => {
      if (!sessions) res.status(404).json({ error: 'Sessions not found' })
      res.json(sessions)
    })
    .catch(err => {
      res.status(503)
      return next(err.message)
    })
}
