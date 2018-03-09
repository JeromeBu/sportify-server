<<<<<<< HEAD
const uid = require('uid2')
const User = require('../api/user/model')
//  options: email, token, password, emailCheckValid
// emailCheckToken, emailCheckCreatedAt, name, description
function createUser(options, callback) {
=======
var uid = require('uid2')
var User = require('../api/user/model')
//  options: email, token, password, emailCheckValid, emailCheckToken, emailCheckCreatedAt, name, description
function user(options, callback) {
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
  const promise = new Promise((resolve, reject) => {
    const password = options.password || 'password'
    const newUser = new User({
      email: options.email || 'emailCheck@testing.com',
      token: options.token || uid(32),
      emailCheck: {
        valid: options.emailCheckValid === false ? false : true,
        token: options.emailCheckToken || uid(20),
        createdAt: options.emailCheckCreatedAt || new Date()
      },
      passwordChange: {
        valid: options.passwordChangeValid === false ? false : true,
        token: options.passwordChangeToken || uid(20),
        createdAt: options.passwordChangeCreatedAt || new Date()
      },
      account: {
        firstName: options.firstName || 'Testing emailCheck'
      }
    })
<<<<<<< HEAD
    User.register(newUser, password, (err, user) => {
=======
    User.register(newUser, password, function(err, user) {
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
      if (err) {
        if (!callback) {
          reject('Could not create user : ' + err)
        } else {
<<<<<<< HEAD
          console.error(`Could not create user :  ${err}`)
        }
      } else if (!callback) {
        resolve(user)
      } else {
        callback(user)
=======
          console.error('Could not create user : ' + err)
        }
      } else {
        if (!callback) {
          resolve(user)
        } else {
          callback(user)
        }
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
      }
    })
  })
  return promise
}

module.exports = { user: createUser }
