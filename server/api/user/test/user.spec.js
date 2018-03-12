const server = require('../../../../index')
const User = require('../../user/model')
const factory = require('../../../utils/modelFactory')

const chai = require('chai')
const should = require('chai').should()
const chaiHttp = require('chai-http')

chai.use(chaiHttp)

describe('GET testing secured route users/:id', () => {
  beforeEach(done => {
    User.remove({}, () => {
      done()
    })
  })
  it('Check autentification before giving access', done => {
    factory.user({}, user => {
      chai
        .request(server)
        .get(`/api/users/${user.id}`)
        .set('Authorization', `Bearer ${user.token}`)
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          should.not.exist(err)
          res.should.have.status(200)
          res.should.be.a('object')
          res.body.should.have.property('account')
          res.body.account.should.have.property('firstName')
          done()
        })
    })
  })
  it("Raise an error if user Bearer doesn't match a user", done => {
    factory.user({}).then(user => {
      chai
        .request(server)
        .get(`/api/users/${user.id}`)
        .set('Authorization', 'Bearer wrong_token')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(401)
          res.should.be.a('object')
          res.body.should.have.property('error').that.include('Unauthorized')
          done()
        })
    })
  })
  it('Raise an error if no user find with this id', done => {
    factory.user({}).then(user => {
      chai
        .request(server)
        .get('/api/users/5aa15025d0b973cdf7bb5bac')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${user.token}`)
        .end((err, res) => {
          res.should.have.status(404)
          res.should.be.a('object')
          res.body.should.have.property('error').that.include('User not found')
          done()
        })
    })
  })
  it('Raise an error if param user id is not the right format', done => {
    factory.user({}).then(user => {
      chai
        .request(server)
        .get('/api/users/5aa15025973cdf7bb5bac')
        .set('Content-Type', 'application/json')
        .set('Authorization', `Bearer ${user.token}`)
        .end((err, res) => {
          res.should.have.status(503)
          res.should.be.a('object')
          res.body.should.have.property('error')
          done()
        })
    })
  })
})
