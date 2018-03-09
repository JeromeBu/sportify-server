<<<<<<< HEAD
const config = require('../../config')
const passport = require('passport')

const _errorHandler = (err, req, res) => {
  let error = err
  if (res.statusCode === 200) res.status(503)
  console.error(error)
  if (config.ENV === 'production') error = 'An error occurred'
  res.json({ error })
}
exports.errorHandler = _errorHandler

exports.checkLoggedIn = (req, res, next) => {
  passport.authenticate('bearer', { session: false }, (err, user, info) => {
=======
const passport = require('passport')

const _errorHandler = function(err, req, res) {
  if (res.statusCode === 200) res.status(400)
  console.error(err)

  if (config.ENV === 'production') err = 'An error occurred'
  res.json({ error: err })
}
exports.errorHandler = _errorHandler

exports.checkLoggedIn = function(req, res, next) {
  passport.authenticate('bearer', { session: false }, function(
    err,
    user,
    info
  ) {
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
    if (err) {
      res.status(503)
      return _errorHandler(err.message)
    }
<<<<<<< HEAD
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

=======
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
    req.currentUser = user
    next()
  })(req, res, next)
}
