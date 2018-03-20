const User = require('../model')

exports.handlePromise = function(promise, res, next) {
  promise
    .then(user => {
      res.status(201).json({
        message: 'user updated with success',
        account: user.account
      })
    })
    .catch(err => {
      res.status(503)
      return next(err.message)
    })
}

exports.addToUser = async function(userId, data) {
  const name = Object.keys(data)[0]
  const dataToAdd = data[name]
  return User.findByIdAndUpdate(
    { _id: userId },
    { $push: { [`account.${name}`]: { $each: dataToAdd } } },
    { new: true }
  )
}

exports.removeFromUser = async function(userId, data) {
  const name = Object.keys(data)[0]
  const dataToRemove = data[name]
  return User.findByIdAndUpdate(
    { _id: userId },
    { $pullAll: { [`account.${name}`]: dataToRemove } },
    { new: true }
  )
}
