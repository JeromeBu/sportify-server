const uid = require('uid2')
const User = require('../api/user/model')
//  options: email, token, password, emailCheckValid
// emailCheckToken, emailCheckCreatedAt, name, description
function createUser(options, callback) {
  const promise = new Promise((resolve, reject) => {
    const password = options.password || 'password'
    const newUser = new User({
      email: options.email || 'emailCheck@testing.com',
      token: options.token || uid(32),
      emailCheck: {
        valid: !(options.emailCheckValid === false),
        token: options.emailCheckToken || uid(20),
        createdAt: options.emailCheckCreatedAt || new Date()
      },
      passwordChange: {
        valid: !(options.passwordChangeValid === false),
        token: options.passwordChangeToken || uid(20),
        createdAt: options.passwordChangeCreatedAt || new Date()
      },
      account: {
        firstName: options.firstName || 'My first name',
        lastName: options.firstName || 'My last name'
      }
    })
    User.register(newUser, password, (err, user) => {
      if (err) {
        if (!callback) {
          reject(Error(`Could not create user : ${err}`))
        } else {
          console.error(`Could not create user :  ${err}`)
        }
      } else if (!callback) {
        resolve(user)
      } else {
        callback(user)
      }
    })
  })
  return promise
}

module.exports = { user: createUser }
