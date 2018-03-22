const Session = require('../model')
const { addToUserDbQuery } = require('../../user/controller/utils')
const { addToBookedBy } = require('./utils')

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
exports.update = async (req, res, next) => {
  const { id } = req.params
  const { userId } = req.body
  if (req.currentUserId !== userId)
    return res.status(401).json({ error: 'Unauthorized' })
  try {
    const session = await addToBookedBy(id, userId)
    const dataToAdd = { sessions: [id] }
    try {
      const user = await addToUserDbQuery(userId, dataToAdd, res, next)
      res.status(201).json({
        message: 'session and user updated with success',
        session,
        user: { id: user.id, account: user.account }
      })
    } catch (err) {
      res.status(503)
      return next(err.message)
    }
  } catch (error) {
    res.status(503)
    return next(error.message)
  }
}

exports.peoplePresent = (req, res, next) => {
  const { id } = req.params
  const { userId } = req.body

  Session.findByIdAndUpdate(
    { _id: id },
    { $push: { peoplePresent: userId }, $pull: { bookedBy: userId } },
    { new: true }
  )
    .then(session => {
      res.json({ session })
    })
    .catch(err => {
      res.status(503)
      return next(err.message)
    })
}

exports.getTeacherSessions = (req, res, next) => {
  const { id } = req.params
  console.log('id', id)

  Session.findById({ _id: id })
    .populate({
      path: 'activity',
      select: 'image name',
      populate: [
        {
          path: 'center',
          select: 'address name'
        }
      ]
    })
    .populate({
      path: 'bookedBy',
      select: 'account.firstName account.lastName'
    })
    .populate({
      path: 'peoplePresent',
      select: 'account.firstName account.lastName'
    })
    .then(session => {
      if (!session) return res.status(404).json({ error: 'Session not found' })
      return res.json(session)
    })
    .catch(err => {
      res.status(503)
      return next(err.message)
    })
}
