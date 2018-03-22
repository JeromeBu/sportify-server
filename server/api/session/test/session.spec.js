const server = require('../../../../index')
const Session = require('../model')
const factory = require('../../../utils/modelFactory')
const chai = require('chai')
const should = require('chai').should()
const chaiHttp = require('chai-http')
const { emptyDb, emptyDbExceptUsers } = require('../../../utils/testUtils')

const log = console.log()

chai.use(chaiHttp)

describe('Sessions routes', () => {
  describe('GET /api/sessions', () => {
    beforeEach(done => {
      Session.remove({})
        .then(() => done())
        .catch(e => log(e))
    })

    it('should GET an array with one session without error', async () => {
      await factory.session({})
      chai
        .request(server)
        .get('/api/sessions')
        .end((err, res) => {
          should.not.exist(err)
          res.body.should.be.an('array')
          res.should.have.status(200)

          res.body.every(i =>
            i.should.to.have.all.keys(
              '__v',
              '_id',
              'activity',
              'capacity',
              'bookedBy',
              'duration',
              'peoplePresent',
              'startsAt',
              'teacher'
            )
          )
        })
    })
  })

  describe('PUT /api/sessions/:id', function() {
    before(async () => {
      await emptyDb()
      this.teacher = await factory.user({ role: 'teacher' })
      this.user = await factory.user({})
    })
    beforeEach(async () => {
      await emptyDbExceptUsers()
      this.session = await factory.session({ teacher: this.teacher })
    })
    it('Returns unauthorized if wrong token', done => {
      chai
        .request(server)
        .put(`/api/sessions/${this.session.id}`)
        .set('Authorization', 'Bearer wrongToken')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(401)
          res.should.be.a('object')
          res.body.should.have.property('error').that.includes('Unauthorized')
          done()
        })
    })
    it('Returns unauthorized if user login and user to update are different', done => {
      chai
        .request(server)
        .put(`/api/sessions/${this.session.id}`)
        .set('Authorization', `Bearer ${this.user.token}`)
        .set('Content-Type', 'application/json')
        .send({ userId: this.teacher.id })
        .end((err, res) => {
          res.should.have.status(401)
          res.should.be.a('object')
          res.body.should.have.property('error').that.includes('Unauthorized')
          done()
        })
    })
    it('update sessions with user and user with session', done => {
      chai
        .request(server)
        .put(`/api/sessions/${this.session.id}`)
        .set('Authorization', `Bearer ${this.user.token}`)
        .set('Content-Type', 'application/json')
        .send({ userId: this.user.id })
        .end((err, res) => {
          should.not.exist(err)
          res.should.have.status(201)
          res.body.should.be.an('object')
          res.body.should.have
            .property('message')
            .that.include('session and user updated with success')

          res.body.should.have.property('session')
          res.body.session.should.have
            .property('bookedBy')
            .which.is.an('array')
            .with.lengthOf(1)
          res.body.session.bookedBy[0].should.equal(this.user.id)

          res.body.should.have.property('user')
          res.body.user.should.have.property('account')
          res.body.user.account.should.have
            .property('sessions')
            .which.is.an('array')
            .with.lengthOf(1)
          res.body.user.account.sessions[0].should.equal(this.session.id)

          done()
        })
    })
  })
})
