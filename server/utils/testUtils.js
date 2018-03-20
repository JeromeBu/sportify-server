const User = require('../api/user/model')
const Center = require('../api/center/model')
const Activity = require('../api/activity/model')
const Session = require('../api/session/model')

exports.emptyDb = async () => {
  await Center.remove({})
  await Activity.remove({})
  await Session.remove({})
  await User.remove({})
}

exports.emptyDbExceptUsers = async () => {
  await Center.remove({})
  await Activity.remove({})
  await Session.remove({})
}
