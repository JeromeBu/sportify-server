const User = require('../model')

const addToUser = (userId, dataToAdd, res, next) => {
  handlePromise(addToUserDbQuery(userId, dataToAdd), res, next)
}
const removeFromUser = (userId, dataToRemove, res, next) => {
  handlePromise(removeFromUserDbQuery(userId, dataToRemove), res, next)
}
function handlePromise(promise, res, next) {
  promise
    .then(user => {
      if (!user)
        return res.status(404).json({
          error: 'no User found with that id'
        })
      return res.status(201).json({
        message: 'user updated with success',
        account: user.account
      })
    })
    .catch(err => {
      res.status(503)
      return next(err.message)
    })
}

async function addToUserDbQuery(userId, data) {
  const name = Object.keys(data)[0]
  const dataToAdd = data[name]
  return User.findByIdAndUpdate(
    { _id: userId },
    { $push: { [`account.${name}`]: { $each: dataToAdd } } },
    { new: true }
  )
}

async function removeFromUserDbQuery(userId, data) {
  const name = Object.keys(data)[0]
  const dataToRemove = data[name]
  return User.findByIdAndUpdate(
    { _id: userId },
    { $pullAll: { [`account.${name}`]: dataToRemove } },
    { new: true }
  )
}

module.exports = { addToUser, removeFromUser, addToUserDbQuery }
