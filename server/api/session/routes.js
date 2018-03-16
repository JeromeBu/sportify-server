const router = require('express').Router()
const controller = require('./controller')
const { checkLoggedIn } = require('../../middlewares/core')

router.route('/').get(controller.index)

router.route('/:id/book').put(checkLoggedIn, controller.bookByUser)

module.exports = router
