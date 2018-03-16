const User = require('./model')
const Activity = require('../activity/model')
const Center = require('../center/model')

exports.show = (req, res, next) => {
  // const { currentUser } = req   value available when user logged (middlware)
  User.findById(req.params.id)
    .select('account')
    .populate({
      path: 'account.sessions',
      populate: [
        {
          path: 'activity',
          model: Activity,
          populate: { path: 'center', model: Center }
        },
        { path: 'teacher', model: User, select: 'account' }
      ]
    })
    .exec()
    .then(user => {
      if (!user) return res.status(404).json({ error: 'User not found' })
      return res.json({
        _id: user.id,
        account: user.account
      })
    })
    .catch(err => {
      console.log('error when getting user')
      res.status(503)
      return next(err.message)
    })
}

exports.update = (req, res, next) => {
  const { account } = req.body
  account.role = 'user'
  User.findById(req.params.id)
    .exec()
    .then(user => {
      user.account = account
      user.save(err => {
        if (err) {
          res.status(400)
          return next(err)
        }
        return res.status(204).json({ message: 'User updated' })
      })
    })
    .catch(err => {
      res.status(503)
      return next(err.message)
    })
}
