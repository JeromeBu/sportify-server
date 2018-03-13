const router = require('express').Router()

router.use('/users', require('./user/routes.js'))
router.use('/sessions', require('./session/routes.js'))

module.exports = router
