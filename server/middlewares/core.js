const config = require('../../config')
const passport = require('passport')

const _errorHandler = (err, req, res) => {
  console.log('in errorHandler : ')
  let error = err
  if (res.statusCode === 200) res.status(503)
  console.error(error)
  if (config.ENV === 'production') error = 'An error occurred'
  res.json({ error })
}
exports.errorHandler = _errorHandler

exports.checkLoggedIn = (req, res, next) => {
  passport.authenticate('bearer', { session: false }, (err, user) => {
    // info is also available with err, and user
    if (err) {
      res.status(503)
      return _errorHandler(err.message)
    }
    if (!user) return res.status(401).json({ error: 'Unauthorized' })

    req.currentUser = user
    return next()
  })(req, res, next)
}
