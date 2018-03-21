const router = require('express').Router()
const controller = require('./controller/controller')
const { checkLoggedIn } = require('../../middlewares/core')

router.route('/').get(controller.index)

router.route('/:id').put(checkLoggedIn, controller.update)

module.exports = router
