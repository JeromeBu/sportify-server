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
})
