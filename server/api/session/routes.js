const router = require('express').Router()
const controller = require('./controller')
const { checkLoggedIn } = require('../../middlewares/core')

router.route('/').get(controller.index)

<<<<<<< HEAD
router.route('/:id').get(controller.getTeacherSessions)

router.route('/:id/book').put(controller.bookByUser)
=======
router.route('/:id').put(checkLoggedIn, controller.update)
>>>>>>> 8a4b34958663653a7b50544771bbd8100a6600d0

router.route('/:id/present').put(controller.peoplePresent)

module.exports = router
