const uid = require('uid2')
const User = require('../api/user/model')
const Center = require('../api/center/model')
const Activity = require('../api/activity/model')
const Session = require('../api/session/model')
const {
  randomDate,
  randomFromTable,
  roundMinutes
} = require('./utilsFunctions')
const faker = require('faker')

const activities = [
  'Crossfit',
  'Yoga',
  'Zumba',
  'Rugby',
  'Danse',
  'Boxe',
  'Squash',
  'Body Pump',
  'Stretching',
  'Pilat',
  'RPM',
  'TRX',
  'Abdo-Fessiers'
]

const inTwoWeeks = new Date()
inTwoWeeks.setDate(inTwoWeeks.getDate() + 30)

//  options: email, shortId, token, password, emailCheckValid
// emailCheckToken, emailCheckCreatedAt, firstName, lastName,
// gender, paidUntil, role
function createUser(options = {}, callback) {
  const promise = new Promise((resolve, reject) => {
    const password = options.password || 'password'
    const newUser = new User({
      shortId: options.shortId,
      email: options.email || faker.internet.email(),
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
        firstName: options.firstName || faker.name.firstName(),
        lastName: options.lastName || faker.name.lastName(),
        gender:
          options.gender || ['Male', 'Female'][Math.floor(Math.random() * 2)],
        role: options.role || 'user',
        paidUntil: options.paidUntil || randomDate(new Date(), inTwoWeeks)
      }
    })
    User.register(newUser, password, (err, user) => {
      if (err) {
        if (!callback) {
          reject(new Error(`Could not create user : ${err}`))
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

function createCenter(options = {}) {
  const promise = new Promise((resolve, reject) => {
    const center = new Center({
      shortId: options.shortId,
      name: options.name || faker.company.companyName(),
      address: options.address || faker.address.streetAddress(),
      activities: options.activities || []
    })
    center.save(err => {
      if (err) {
        console.log(err)
        reject(new Error(`Could not create center : ${err}`))
      }
      resolve(center)
    })
  })
  return promise
}

function createActivity(options = {}) {
  const promise = new Promise(async (resolve, reject) => {
    const activity = new Activity({
      shortId: options.shortId,
      name: options.name || randomFromTable(activities),
      sessions: options.sessions || [],
      center: options.center || (await createCenter())
    })
    activity.save(err => {
      if (err) {
        console.log(`error when creating activity: ${err}`)
        reject(new Error(`Could not create activity : ${err}`))
      }
      resolve(activity)
    })
  })
  return promise
}

function createSession(options = {}) {
  const promise = new Promise(async (resolve, reject) => {
    const session = new Session({
      shortId: options.shortId,
      startsAt:
        options.startsAt ||
        roundMinutes(randomDate(new Date(), inTwoWeeks, 6, 22)),
      duration:
        options.duration || randomFromTable([45, 60, 90, 120, 150, 180]),
      capacity: options.capacity || Math.floor(6 + Math.random() * 15),
      activity: options.activity || (await createActivity()),
      teacher: options.teacher || (await createUser({ role: 'teacher' })),
      bookedBy: options.bookedBy || [],
      peoplePresent: options.peoplePresent || []
    })
    session.save(err => {
      if (err) {
        console.log(`error when creating session: ${err}`)
        reject(new Error(`Could not create session : ${err}`))
      }
      resolve(session)
    })
  })
  return promise
}

module.exports = {
  user: createUser,
  activity: createActivity,
  center: createCenter,
  session: createSession
}
