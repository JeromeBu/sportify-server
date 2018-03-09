let server = require('../../../../index')
const User = require('../../user/model')
const factory = require('../../../utils/modelFactory')

const chai = require('chai')
const should = require('chai').should()
const chaiHttp = require('chai-http')

chai.use(chaiHttp)

<<<<<<< HEAD
describe('GET testing secured route users/:id', () => {
=======
describe('GET testing secured route users/:id', function() {
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
  beforeEach(done => {
    User.remove({}, err => {
      done()
    })
  })
<<<<<<< HEAD
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
=======
  // it("Check autentification before giving access", function(done) {
  //   factory.user({}, function(user) {
  //     chai
  //       .request(server)
  //       .get(`/api/users/${user._id}`)
  //       .set("Authorization", `Bearer ${user.token}`)
  //       .set("Content-Type", "application/json")
  //       .end(function(err, res) {
  //         // console.log(err)
  //         should.not.exist(err)
  //         res.should.have.status(200)
  //         res.should.be.a("object")
  //         res.body.should.have.property("account")
  //         res.body.account.should.have.property("description")
  //         done()
  //       })
  //   })
  // })
>>>>>>> 93c2e17d24fa64c94f86af76f55d80329d2193e0
})
