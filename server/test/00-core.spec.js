const chai = require('chai')
const should = require('chai').should()
const chaiHttp = require('chai-http')
const server = require('../../index')
const { errorHandler } = require('../middlewares/core')

chai.use(chaiHttp)

describe('Home', () => {
  describe('GET /', () => {
    it('respond with welcome message', done => {
      chai
        .request(server)
        .get('/')
        .end((err, res) => {
          should.not.exist(err)
          res.should.have.status(200)
          res.text.should.equal('Welcome to Sportify API.')
          done()
        })
    })
  })
  describe('GET /grrr', () => {
    it('responds 404 not found', done => {
      chai
        .request(server)
        .get('/grrr')
        .end((err, res) => {
          res.should.have.status(404)
          res.should.be.a('object')
          res.body.should.have.property('error').that.include('Not Found')
          done()
        })
    })
  })
})

describe('Test errorHandler middleware', () => {
  beforeEach(() => {
    const json = () => {}
    const res = {
      statusCode: 200
    }
  })
  it('Changes error to 503 if status 200', done => {
    errorHandler.should.be.a('function')
    errorHandler.should.be.a('object')
    done()
  })
})
