const config = require('../../config')
const mongoose = require('mongoose')
const User = require('../api/user/model')
const Center = require('../api/center/model')
const Activity = require('../api/activity/model')
const Session = require('../api/session/model')
const chalk = require('chalk')
const factory = require('./modelFactory')
const { randomFromTable } = require('./utilsFunctions')

const models = [User, Center, Activity, Session]

mongoose.connect(config.MONGODB_URI, err => {
  if (err) console.error('Could not connect to mongodb.')
})

models.map(model => model.remove({}).exec())

const users = []
const centers = []
const teachers = []
const activities = []
const sessions = []

const centersName = [
  'Belleville - Ménilmontant',
  "Place D'Italie",
  'Denfert - Alésia'
]

const seed = async () => {
  console.log('Creating users...\n')
  let i = null
  for (i = 1; i < 8; i += 1) {
    users.push(await factory.user({ shortId: i }))
    console.log(`Short Id : ${users[i - 1].shortId} - ${users[i - 1].email}`)
  }

  console.log('\nCreating teachers...\n')
  const initial = i
  for (i; i <= 11; i += 1) {
    teachers.push(await factory.user({ shortId: i, role: 'teacher' }))
    console.log(
      `Short Id : ${teachers[i - initial].shortId} - ${
        teachers[i - initial].email
      }`
    )
  }

  console.log('\nCreating specific users...\n')
  await factory.user({
    shortId: 30,
    email: 'tessier@gmail.com',
    password: '123456'
  })

  users.push(
    await factory.user({
      shortId: 25,
      email: 'jerome@mail.com',
      password: 'azer'
    })
  )
  console.log(
    `Short Id : ${users[initial - 1].shortId} - ${
      users[initial - 1].email
    } - Password: ${users[initial - 1].password}`
  )

  console.log('\nCreating centers...\n')
  for (let j = 1; j <= 3; j += 1) {
    centers.push(await factory.center({ shortId: j, name: centersName[j - 1] }))
    console.log(`Short Id : ${centers[j - 1].shortId} - ${centers[j - 1].name}`)
  }

  console.log('\nCreating activities...\n')
  for (let j = 1; j <= centers.length; j += 1) {
    const center = centers[j - 1]
    const numActiv = 5
    for (let k = 1; k <= numActiv; k += 1) {
      activities.push(await factory.activity({ shortId: j * 10 + k, center }))
      console.log(
        `Short Id : ${activities[(j - 1) * numActiv + (k - 1)].shortId} - ${
          activities[(j - 1) * numActiv + (k - 1)].name
        }`
      )
    }
    const min = j * 10
    const max = (j + 1) * 10
    await Activity.find({ shortId: { $gt: min, $lt: max } }).exec(
      (err, activ) => {
        center.activities = activ
        center.save(err => {
          if (err) console.log('error on save of center:', err)
        })
      }
    )
  }

  console.log('\nCreating sessions...')
  for (let l = 1; l <= activities.length; l += 1) {
    const activity = activities[l - 1]
    const numSession = 6
    for (let k = 1; k <= numSession; k++) {
      sessions.push(
        await factory.session({
          shortId: l * 10 + k,
          activity,
          teacher: randomFromTable(teachers)
        })
      )
      console.log(
        `Short Id : ${sessions[(l - 1) * numSession + k - 1].shortId} - ${
          sessions[(l - 1) * numSession + k - 1].startsAt
        }`
      )
    }

    const min = l * 10
    const max = (l + 1) * 10
    await Session.find({ shortId: { $gt: min, $lt: max } }).exec(
      (err, sess) => {
        activity.sessions = sess
        activity.save(e => {
          if (e) console.log('error on save of activity:', e)
        })
      }
    )
  }

  await User.findOne({ shortId: 25 })
    .exec()
    .then(async user => {
      console.log('in find one user : ', user.email)
      await Session.find({ shortId: { $in: [11, 21, 31] } })
        .exec()
        .then(async ses => {
          console.log('in find Sessions : ', ses)
          user.account.sessions = ses
          await user.save()
        })
    })

  console.log(
    `\n \nCreated ${users.length} users, ${teachers.length} teachers, ${
      centers.length
    } centers, ${activities.length} activities, ${sessions.length} sessions`
  )
  mongoose.connection.close(() => {
    console.log('\n \n close connection')
  })
}

seed()
