const mongoose = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')

const UserSchema = new mongoose.Schema({
  shortId: Number, // shortId is useful when seeding data, it facilitates associations
  email: String,
  emailCheck: {
    valid: { type: Boolean, default: false },
    token: String,
    createdAt: Date
  },
  passwordChange: {
    valid: { type: Boolean, default: true },
    token: String,
    createdAt: Date
  },
  password: String,
  token: String,
  // Token ables to authentify with `passport-http-bearer`
  // Here`account` is for public information
  account: {
    firstName: {
      type: String,
      required: true
    },
    lastName: String,
    gender: {
      type: String,
      enum: ['Male', 'Female']
    },
    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session'
      }
    ],
    role: {
      type: String,
      enum: ['user', 'teacher'],
      required: true,
      default: 'user'
    },
    paidUntil: {
      type: Date,
      required: true,
      default: '01/01/1980'
    }
  }
})

UserSchema.plugin(passportLocalMongoose, {
  usernameField: 'email', // Authentification will use `email` instead of `username`
  session: false // no session in API
})

// Find a user with `email` and `password`
UserSchema.statics.authenticateLocal = function() {
<<<<<<< HEAD
  const _self = this
  return (req, email, password, cb) => {
    _self.findByUsername(email, true, (err, user) => {
      if (err) return cb(err)
      if (user) {
        return user.authenticate(password, cb)
      }
      return cb(null, false)
=======
  var _self = this
  return function(req, email, password, cb) {
    _self.findByUsername(email, true, function(err, user) {
      if (err) return cb(err)
      if (user) {
        return user.authenticate(password, cb)
      } else {
        return cb(null, false)
      }
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
    })
  }
}

// Used with `passport-http-bearer` finds user with `token`
UserSchema.statics.authenticateBearer = function() {
<<<<<<< HEAD
  const _self = this
  return (token, cb) => {
    if (!token) {
      cb(null, false)
    } else {
      _self.findOne({ token }, (err, user) => {
=======
  var _self = this
  return function(token, cb) {
    if (!token) {
      cb(null, false)
    } else {
      _self.findOne({ token: token }, function(err, user) {
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
        if (err) return cb(err)
        if (!user) return cb(null, false)
        return cb(null, user)
      })
    }
  }
}

module.exports = mongoose.model('User', UserSchema, 'users')
