const express = require('express')
const { checkLoggedIn } = require('../../middlewares/core')
const userController = require('../user/controller')

const router = express.Router()

// L'authentification est obligatoire pour cette route
<<<<<<< HEAD
router.get('/:id', checkLoggedIn, userController.userShow)
router.post('/:id', checkLoggedIn, userController.userUpdate)
=======
router.get('/:id', checkLoggedIn, userController.show)
>>>>>>> 7b11d8d9dc136a9e5b7ec3b4bf1c434dc5af017f

module.exports = router
