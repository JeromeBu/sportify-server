const express = require('express')
const { checkLoggedIn } = require('../../middlewares/core')
const userController = require('../user/controller')

const router = express.Router()

// L'authentification est obligatoire pour cette route
router.get('/:id', checkLoggedIn, userController.initial_get_user)

module.exports = router
