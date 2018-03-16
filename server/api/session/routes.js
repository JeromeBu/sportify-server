const router = require('express').Router()
const controller = require('./controller')

router.route('/').get(controller.index)

router.route('/:id/book').put(controller.bookByUser)

module.exports = router
