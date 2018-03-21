const Session = require('../model')

async function addToBookedBy(sessionId, userId) {
  return Session.findByIdAndUpdate(
    { _id: sessionId },
    { $push: { bookedBy: userId } },
    { new: true }
  )
}

async function removeFromBookedBy(sessionId, userId) {
  return Session.findByIdAndUpdate(
    { _id: sessionId },
    { $pullAll: { bookedBy: [userId] } },
    { new: true }
  )
}

module.exports = { addToBookedBy, removeFromBookedBy }
