const router = require('express').Router()

router.use('/users', require('./user/routes.js'))
router.use('/sessions', require('./session/routes.js'))
router.use('/activities', require('./activity/routes.js'))

module.exports = router
