const User = require('../model')
// const { pluck } = require('../../../utils/utilsFunctions') // pour débug
const {
  addToBookedBy,
  removeFromBookedBy
} = require('../../session/controller/utils')

const addToUser = async (userId, dataToAdd, res, next) => {
  let updatedUser = null
  try {
    updatedUser = await addToUserDbQuery(userId, dataToAdd)
  } catch (error) {
    res.status(503)
    return next(error.message)
  }
  if (!updatedUser)
    return res.status(404).json({
      error: 'no User found with that id'
    })

  const key = Object.keys(dataToAdd)[0]
  let updatedSessions = []
  if (key === 'sessions') {
    try {
      updatedSessions = await addUserToSessions(userId, dataToAdd, res, next)
    } catch (error) {
      res.status(503)
      return next(error.message)
    }
  }
  return res.status(201).json({
    message: 'user updated with success',
    user: { account: updatedUser.account },
    updatedSessions
  })
}

const removeFromUser = async (userId, dataToRemove, res, next) => {
  let updatedUser = null
  try {
    updatedUser = await removeFromUserDbQuery(userId, dataToRemove)
  } catch (error) {
    res.status(503)
    return next(error.message)
  }
  if (!updatedUser)
    return res.status(404).json({
      error: 'no User found with that id'
    })
  const key = Object.keys(dataToRemove)[0]
  let updatedSessions = []
  if (key === 'sessions') {
    try {
      updatedSessions = await removeUserFromSessions(
        userId,
        dataToRemove,
        res,
        next
      )
    } catch (error) {
      res.status(503)
      return next(error.message)
    }
  }
  return res.status(201).json({
    message: 'user updated with success',
    user: { account: updatedUser.account },
    updatedSessions
  })
}

const replaceFavoritesInUser = async (userId, dataToReplace, res, next) => {
  console.log('In replace favorites')
  try {
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        'account.favoriteActivities': dataToReplace.favoriteActivities
      },
      { new: true }
    )
    if (!updatedUser)
      return res.status(404).json({
        error: 'no User found with that id'
      })
    return res.status(201).json({
      message: 'user updated with success',
      user: { account: updatedUser.account }
    })
  } catch (error) {
    res.status(503)
    return next(error.message)
  }
}

async function addUserToSessions(userId, dataToAdd, res, next) {
  // dataToAdd = { sessions: [id_des_sessions]}
  const afterAddSessions = []
  for (let i = 0; i < dataToAdd.sessions.length; i++) {
    const sessionId = dataToAdd.sessions[i]
    try {
      afterAddSessions.push(await addToBookedBy(sessionId, userId))
    } catch (error) {
      res.status(503)
      return next(error.message)
    }
  }
  return afterAddSessions
}

async function removeUserFromSessions(userId, dataToRemove, res, next) {
  // dataToRemove = { sessions: [id_des_sessions]}
  const afterRemoveSessions = []
  for (let i = 0; i < dataToRemove.sessions.length; i++) {
    const sessionId = dataToRemove.sessions[i]
    try {
      afterRemoveSessions.push(await removeFromBookedBy(sessionId, userId))
    } catch (error) {
      res.status(503)
      return next(error.message)
    }
  }
  return afterRemoveSessions
}

async function addToUserDbQuery(userId, data) {
  const key = Object.keys(data)[0]
  const dataToAdd = data[key]
  return User.findByIdAndUpdate(
    { _id: userId },
    { $push: { [`account.${key}`]: { $each: dataToAdd } } },
    { new: true }
  )
}

async function removeFromUserDbQuery(userId, data) {
  const key = Object.keys(data)[0]
  const dataToRemove = data[key]
  return User.findByIdAndUpdate(
    { _id: userId },
    { $pullAll: { [`account.${key}`]: dataToRemove } },
    { new: true }
  )
}

module.exports = {
  addToUser,
  removeFromUser,
  addToUserDbQuery,
  replaceFavoritesInUser
}
