const Session = require('./model')
const User = require('../user/model')

exports.index = (req, res, next) => {
  Session.find({})
    .exec()
    .then(sessions => {
      if (!sessions) res.status(404).json({ error: 'Sessions not found' })
      return res.json(sessions)
    })
    .catch(err => {
      res.status(503)
      return next(err.message)
    })
}

// update array "bookedBy" from session and array "sessions" from user
exports.bookByUser = (req, res, next) => {
  const { id } = req.params
  const { userId } = req.body

  Session.findByIdAndUpdate(
    { _id: id },
    { $push: { bookedBy: userId } },
    { new: true }
  )
    .then(session => {
      User.findByIdAndUpdate(
        { _id: userId },
        { $push: { 'account.sessions': id } },
        { new: true }
      )
        .then(user => res.json({ session, user }))
        .catch(err => {
          res.status(503)
          return next(err.message)
        })
    })
    .catch(err => {
      res.status(503)
      return next(err.message)
    })
}
