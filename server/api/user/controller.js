<<<<<<< HEAD
const User = require('./model')
=======
const config = require('../../../config')
const User = require('./model')
const uid2 = require('uid2')
const passport = require('passport')
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
})
const confirmEmail = require('../../emails/confirmationEmail')
const forgetPasswordEmail = require('../../emails/forgetPasswordEmail')
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0

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
