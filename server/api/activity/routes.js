const router = require('express').Router()
const controller = require('./controller')

router.route('/').get(controller.index)

router.route('/:id').get(controller.show)

module.exports = router
