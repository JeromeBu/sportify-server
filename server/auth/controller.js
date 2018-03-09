const uid2 = require('uid2')
const passport = require('passport')
const mailgun = require('mailgun-js')({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
})
const config = require('../../config')
const User = require('../api/user/model')
const confirmEmail = require('../emails/confirmationEmail')
const forgetPasswordEmail = require('../emails/forgetPasswordEmail')

<<<<<<< HEAD
exports.sign_up = (req, res) => {
  const { email, firstName, lastName, role, gender, password } = req.body
  User.register(
    new User({
      email,
      token: uid2(32),
=======
exports.sign_up = function(req, res) {
  const { email, firstName, lastName, role, gender, password } = req.body

  User.register(
    new User({
      email: email,
      token: uid2(32), // Token created with uid2. Will be used for Bear strategy. Should be regenerated when password is changed.
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
      emailCheck: {
        token: uid2(20),
        createdAt: new Date()
      },
      account: {
        firstName,
        lastName,
        role,
        gender
      }
    }),
<<<<<<< HEAD
    password, // password has to be the second parameter transmitted
    (err, user) => {
      if (err) {
        res.status(503)
        return res.json({ error: err.message })
      }
      // sending mails only in production ENV
      if (config.ENV === 'production') {
        const url = req.headers.host
        mailgun.messages().send(confirmEmail(url, user), (error, body) => {
          console.error('Mail Error', error)
          console.log('Mail Body', body)
        })
      }
      return res.json({
        message: 'User successfully signed up',
        user: {
          _id: user.id,
          token: user.token,
          account: user.account
        }
      })
=======
    password, // Le mot de passe doit être obligatoirement le deuxième paramètre transmis à `register` afin d'être crypté
    function(err, user) {
      if (err) {
        if (config.ENV !== 'test') {
          console.error(err)
        }
        // TODO test
        res.status(400).json({ error: err.message })
      } else {
        // sending mails only in production ENV
        if (config.ENV === 'production') {
          const url = req.headers.host
          mailgun
            .messages()
            .send(confirmEmail(url, user), function(error, body) {
              console.error('Mail Error', error)
              console.log('Mail Body', body)
              res.json({
                message: 'User successfully signed up',
                user: {
                  _id: user._id,
                  token: user.token,
                  account: user.account
                }
              })
            })
        } else {
          res.json({
            message: 'User successfully signed up',
            user: {
              _id: user._id,
              token: user.token,
              account: user.account
            }
          })
        }
      }
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
    }
  )
}

<<<<<<< HEAD
exports.log_in = (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
=======
exports.log_in = function(req, res, next) {
  passport.authenticate('local', { session: false }, function(err, user, info) {
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
    if (err) {
      res.status(400)
      return next(err.message)
    }
    if (!user) return res.status(401).json({ error: 'Unauthorized' })
    if (!user.emailCheck.valid)
      return res.status(206).json({ message: 'Please confirm email first' })
<<<<<<< HEAD
    return res.json({
      message: 'Login successful',
      user: {
        _id: user.id,
=======
    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
        token: user.token,
        account: user.account
      }
    })
  })(req, res, next)
}

<<<<<<< HEAD
exports.forgotten_password = (req, res, next) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'No email specified' })
  return User.findOne({ email }, (err, user) => {
=======
exports.forgotten_password = function(req, res, next) {
  var email = req.body.email
  if (!email) return res.status(400).json({ error: 'No email specified' })
  User.findOne({ email: email }, function(err, user) {
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
    if (err) {
      res.status(400)
      return next(err.message)
    }
<<<<<<< HEAD
    if (!user) {
      return res.status(400).json({
        error: "We don't have a user with this email in our dataBase"
      })
    }
=======
    if (!user)
      return res.status(400).json({
        error: "We don't have a user with this email in our dataBase"
      })
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
    if (!user.emailCheck.valid)
      return res.status(400).json({ error: 'Your email is not confirmed' })
    user.passwordChange = {
      token: uid2(20),
      createdAt: new Date(),
      valid: true
    }
<<<<<<< HEAD
    return user.save(error => {
      if (err) {
        res.status(503)
        return next(err.message)
      }
      if (config.ENV === 'production') {
        const url = req.headers.host
        mailgun.messages().send(forgetPasswordEmail(url, user), (Err, body) => {
          console.error('Mail Error', Err)
          console.log('Mail Body', body)
        })
      }
      return res.json({
=======
    user.save(function(error) {
      if (error) {
        console.log(
          'Error when saving user with passwordChange infos : ',
          error
        )
        return res
          .status(400)
          .json({ error: 'Error when setting recovering infos in user ' })
      }
      if (config.ENV === 'production') {
        const url = req.headers.host
        mailgun
          .messages()
          .send(forgetPasswordEmail(url, user), function(error, body) {
            console.error('Mail Error', error)
            console.log('Mail Body', body)
          })
      }
      res.json({
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
        message: 'An email has been send with a link to change your password'
      })
    })
  })
}

<<<<<<< HEAD
exports.email_check = (req, res, next) => {
  const { email, token } = req.query
  if (!token) return res.status(400).send('No token specified')
  return User.findOne({ 'emailCheck.token': token, email }, (err, user) => {
    if (err) {
      res.status(503)
      return next(err.message)
    }
=======
exports.email_check = function(req, res) {
  const { email, token } = req.query
  if (!token) return res.status(400).send('No token specified')
  User.findOne({ 'emailCheck.token': token, email: email }, (err, user) => {
    if (err) return res.status(400).send(err)
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
    if (!user) return res.status(400).send('Wrong credentials')
    if (user.emailCheck.valid)
      return res
        .status(206)
        .json({ message: 'You have already confirmed your email' })
<<<<<<< HEAD
    const yesterday = new Date()
=======
    var yesterday = new Date()
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
    yesterday.setDate(yesterday.getDate() - 1)
    if (user.emailCheck.createdAt < yesterday)
      return res.status(400).json({
        message:
          'This link is outdated (older than 24h), please try to sign up again'
      })
    user.emailCheck.valid = true
<<<<<<< HEAD
    return user.save(error => {
      if (error) {
        res.status(503)
        return next(error.message)
      }
      return res.json({ message: 'Your email has been verified with success' })
=======
    user.save(function(err) {
      if (err) return res.send(err)
      res.json({ message: 'Your email has been verified with success' })
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
    })
  })
}

<<<<<<< HEAD
exports.reset_password_GET = (req, res) => {
  res.json({ message: 'Ready to recieve new password' })
}

exports.reset_password_POST = (req, res, next) => {
=======
exports.reset_password_GET = function(req, res) {
  res.json({ message: 'Ready to recieve new password' })
}

exports.reset_password_POST = function(req, res, next) {
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
  const { newPassword, newPasswordConfirmation } = req.body
  if (!newPassword)
    return res.status(400).json({ error: 'No password provided' })
  if (newPassword !== newPasswordConfirmation)
    return res
      .status(400)
      .json({ error: 'Password and confirmation are different' })
<<<<<<< HEAD
  const { user } = req
  return user.setPassword(newPassword, () => {
    user.passwordChange.valid = false
    user.save(error => {
      if (error) {
        res.status(503)
        return next(error.message)
      }
      return res.status(200).json({ message: 'Password reset successfully' })
    })
=======
  const user = req.user
  user.setPassword(newPassword, function() {
    user.passwordChange.valid = false
    user.save(function(error) {
      if (error) {
        res.status(500)
        return next(error.message)
      }
    })
    res.status(200).json({ message: 'Password reset successfully' })
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
  })
}
