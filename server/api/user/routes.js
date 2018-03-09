const config = require('../../../config')
const express = require('express')
<<<<<<< HEAD
const { checkLoggedIn } = require('../../middlewares/core')
const userController = require('../user/controller')

const router = express.Router()

// L'authentification est obligatoire pour cette route
router.get('/:id', checkLoggedIn, userController.initial_get_user)
=======
const router = express.Router()
const { handleResetPasswordErrors } = require('../../middlewares/user')
const { checkLoggedIn } = require('../../middlewares/core')
const user_controller = require('../user/controller')

// L'authentification est obligatoire pour cette route
router.get('/:id', checkLoggedIn, user_controller.initial_get_user)
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0

module.exports = router
