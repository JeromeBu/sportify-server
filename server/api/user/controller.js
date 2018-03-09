const User = require('./model')

exports.initial_get_user = (req, res, next) => {
  const { currentUser } = req // value available when user logged (middlware)
  User.findById(req.params.id)
    .select('account')
    // .populate("account")
    .exec()
    .then(user => {
      if (!user) {
        res.status(404)
        return next('User not found')
      }
      return res.json({
        _id: user.id,
        account: user.account
      })
    })
    .catch(err => {
      res.status(400)
      return next(err.message)
    })
}
