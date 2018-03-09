<<<<<<< HEAD
const mongoose = require('mongoose')
const express = require('express')
const morgan = require('morgan') // in order to log requests
const helmet = require('helmet') // protection package
const compression = require('compression') // compress server responses in GZIP
const bodyParser = require('body-parser') // to parse POST requests
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const cors = require('cors') // to authorize request to the API from another domaine
const HTTPBearerStrategy = require('passport-http-bearer').Strategy
const config = require('../config')
const User = require('../server/api/user/model')
const { errorHandler } = require('../server/middlewares/core')

const app = express()

mongoose.connect(config.MONGODB_URI, err => {
  if (err) console.error('Could not connect to mongodb.')
})

// we don't want it in test mode as it interfers with terminal display of test results
=======
var config = require('../config')

var mongoose = require('mongoose')
mongoose.connect(config.MONGODB_URI, function(err) {
  if (err) console.error('Could not connect to mongodb.')
})

var express = require('express')
var app = express()

var morgan = require('morgan') // in order to log requests
//we don't want it in test mode as it interfers with terminal display of test results
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
if (config.ENV !== 'test') {
  app.use(morgan('dev'))
}

<<<<<<< HEAD
app.use(helmet())
app.use(compression())
=======
var helmet = require('helmet') // protection package
app.use(helmet())

var compression = require('compression') // compress server responses in GZIP
app.use(compression())

var bodyParser = require('body-parser') // to parse POST requests
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
app.use(bodyParser.json())
app.use('/api', cors())
app.use('/auth', cors())

<<<<<<< HEAD
app.use(passport.initialize())
// Local for login + password
=======
var User = require('../server/api/user/model')

var passport = require('passport')
app.use(passport.initialize()) // TODO test

const { errorHandler } = require('../server/middlewares/core')
// Local for login + password
var LocalStrategy = require('passport-local').Strategy
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passReqToCallback: true,
      session: false
    },
    User.authenticateLocal()
  )
)

<<<<<<< HEAD
// Method `authenticateBearer` from model User
passport.use(new HTTPBearerStrategy(User.authenticateBearer()))

app.get('/', (req, res) => {
  res.send('Welcome to Sportify API.')
})

// Routes:
=======
// authorization bearer
const HTTPBearerStrategy = require('passport-http-bearer').Strategy
passport.use(new HTTPBearerStrategy(User.authenticateBearer())) // La méthode `authenticateBearer` a été déclarée dans le model User

app.get('/', function(req, res) {
  res.send('Welcome to the Airbnb API.')
})

const cors = require('cors') // to authorize request to the API from another domaine
app.use('/api', cors())

>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
app.use('/auth', require('./auth/routes'))
app.use('/api', require('./api/api'))

// Error 404 for all verbs (GET, POST, etc.) when page not found.
<<<<<<< HEAD
app.all('*', (req, res) => {
=======
app.all('*', function(req, res) {
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
  res.status(404).json({ status: 404, error: 'Not Found' })
})

// Error handling middleware: called with next(err_msg) within a route
app.use(errorHandler)

function mongooseDisconnect() {
  mongoose.connection.close()
}

module.exports = { app, mongooseDisconnect }
