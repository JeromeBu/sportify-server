const express = require('express')
const { checkLoggedIn } = require('../../middlewares/core')
const userController = require('../user/controller')

const router = express.Router()

// L'authentification est obligatoire pour ces routes
router
  .get('/:id', checkLoggedIn, userController.show)
  .post('/improved/:id', checkLoggedIn, userController.updateImproved)
  .post('/:id', checkLoggedIn, userController.update)

module.exports = router
