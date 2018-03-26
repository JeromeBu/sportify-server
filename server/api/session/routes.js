const router = require('express').Router()
const controller = require('./controller')
// const { checkLoggedIn } = require('../../middlewares/core')

router.route('/').get(controller.index)

router
  .route('/:id')
  .get(controller.getTeacherSessions)
  .put(controller.bookSession)

router.route('/:id/present').put(controller.peoplePresent)

module.exports = router
