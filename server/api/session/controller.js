const Session = require('./model')
const chalk = require('chalk')
const { addToUserDbQuery } = require('../user/controller/utils')

const log = console.log

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

// update array "bookedBy" from session and array "sessions" from user
exports.bookSession = (req, res, next) => {
  const { id } = req.params
  const { userId } = req.body

  // if (req.currentUserId !== userId) {
  //   return res.status(401).json({ error: 'Unauthorized' })
  // }

  Session.findById({ _id: id }).then(session => {
    // mongoose method to compare id string and id object
    const isExist = session.bookedBy.some(usersBooked =>
      usersBooked.equals(userId)
    )

    if (isExist) {
      res.status(404).json({
        message: 'you can not booked the same session'
      })
    } else {
      log(chalk.red('userID is already in bookedBy'))
      session.bookedBy.push(userId)
      session.save().then(newSession => {
        const dataToAdd = { sessions: [id] }
        addToUserDbQuery(userId, dataToAdd, res, next)
          .then(user =>
            res.status(201).json({
              message: 'session and user updated with success',
              newSession,
              user: { id: user.id, account: user.account }
            })
          )
          .catch(err => {
            res.status(503)
            return next(err.message)
          })
      })
    }
  })
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
