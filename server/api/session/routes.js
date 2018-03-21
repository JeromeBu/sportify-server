const router = require('express').Router()
const controller = require('./controller')

router.route('/').get(controller.index)

router.route('/:id').get(controller.getTeacherSessions)

router.route('/:id/book').put(controller.bookByUser)

router.route('/:id/present').put(controller.peoplePresent)

module.exports = router
