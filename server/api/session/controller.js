const Session = require('./model')
const User = require('../user/model')
const { addToUserDbQuery } = require('../user/controller/utils')

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
exports.update = (req, res, next) => {
  const { id } = req.params
  const { userId } = req.body
  if (req.currentUserId !== userId)
    return res.status(401).json({ error: 'Unauthorized' })
  Session.findByIdAndUpdate(
    { _id: id },
    { $push: { bookedBy: userId } },
    { new: true }
  )
    .then(session => {
      const dataToAdd = { sessions: [id] }
      addToUserDbQuery(userId, dataToAdd, res, next)
        .then(user =>
          res.status(201).json({
            message: 'session and user updated with success',
            session,
            user: { id: user.id, account: user.account }
          })
        )
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
