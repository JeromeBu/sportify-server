const server = require('../../../../index')
const User = require('../model')
const { emptyDb } = require('../../../utils/testUtils')
const factory = require('../../../utils/modelFactory')

const chai = require('chai')
const should = require('chai').should()
const chaiHttp = require('chai-http')

chai.use(chaiHttp)

describe.only('User routes', () => {
  describe('GET /api/users/:id', () => {
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
            res.body.should.have
              .property('error')
              .that.include('User not found')
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

  describe('PUT /api/users/:id', function() {
    before(async () => {
      await emptyDb()
      // create a user and some sessions and activities
      this.user = await factory.user({ email: 'lulu@mail.com' })
      const teacher = await factory.user({ role: 'teacher' })
      const center = await factory.center({})
      this.sessions = []
      this.favoriteActivities = []
      for (let i = 0; i < 3; i++) {
        const activity = await factory.activity({ center })
        const session = await factory.session({ center, teacher })
        this.sessions.push(session.id)
        this.favoriteActivities.push(activity.id)
      }
    })
    it('Returns unauthorized if wrong token', done => {
      chai
        .request(server)
        .put(`/api/users/${this.user.id}`)
        .set('Authorization', 'Bearer wrongToken')
        .set('Content-Type', 'application/json')
        .end((err, res) => {
          res.should.have.status(401)
          res.should.be.a('object')
          res.body.should.have.property('error').that.includes('Unauthorized')
          done()
        })
    })
    it('Returns error if userId is wrong format', done => {
      chai
        .request(server)
        .put(`/api/users/${this.user.id}error`)
        .set('Authorization', `Bearer ${this.user.token}`)
        .set('Content-Type', 'application/json')
        .send({ dataToAdd: { sessions: this.sessions } })
        .end((err, res) => {
          res.should.have.status(503)
          res.should.be.a('object')
          res.body.should.have.property('error')
          done()
        })
    })
    it('Returns error if user do not exist', done => {
      chai
        .request(server)
        .put('/api/users/5ab0ec1621e92041c84aa80f')
        .set('Authorization', `Bearer ${this.user.token}`)
        .set('Content-Type', 'application/json')
        .send({ dataToAdd: { sessions: this.sessions } })
        .end((err, res) => {
          res.should.have.status(404)
          res.should.be.a('object')
          res.body.should.have.property('error')
          done()
        })
    })
    it('Add Sessions to the user', done => {
      chai
        .request(server)
        .put(`/api/users/${this.user.id}`)
        .set('Authorization', `Bearer ${this.user.token}`)
        .set('Content-Type', 'application/json')
        .send({ dataToAdd: { sessions: this.sessions } })
        .end((err, res) => {
          should.not.exist(err)
          res.should.have.status(201)
          res.should.be.a('object')
          res.body.should.have
            .property('message')
            .that.include('user updated with success')
          res.body.should.have.property('account')
          res.body.account.should.have
            .property('sessions')
            .which.is.an('array')
            .and.has.lengthOf(3)
          done()
        })
    })
    it('Add favoriteActivities to the user', done => {
      chai
        .request(server)
        .put(`/api/users/${this.user.id}`)
        .set('Authorization', `Bearer ${this.user.token}`)
        .set('Content-Type', 'application/json')
        .send({ dataToAdd: { favoriteActivities: this.favoriteActivities } })
        .end((err, res) => {
          should.not.exist(err)
          res.should.have.status(201)
          res.should.be.a('object')
          res.body.should.have
            .property('message')
            .that.include('user updated with success')
          res.body.should.have.property('account')
          res.body.account.should.have
            .property('favoriteActivities')
            .which.is.an('array')
            .and.has.lengthOf(3)
          done()
        })
    })
    it('Remove sessions from the user', done => {
      chai
        .request(server)
        .put(`/api/users/${this.user.id}`)
        .set('Authorization', `Bearer ${this.user.token}`)
        .set('Content-Type', 'application/json')
        .send({
          dataToRemove: { sessions: [this.sessions[0], this.sessions[1]] }
        })
        .end((err, res) => {
          should.not.exist(err)
          res.should.have.status(201)
          res.should.be.a('object')
          res.body.should.have
            .property('message')
            .that.include('user updated with success')
          res.body.should.have.property('account')
          res.body.account.should.have
            .property('sessions')
            .which.is.an('array')
            .and.has.lengthOf(1)
          res.body.account.sessions[0].should.equal(this.sessions[2])
          done()
        })
    })
    it('Remove favoriteActivity from the user', done => {
      chai
        .request(server)
        .put(`/api/users/${this.user.id}`)
        .set('Authorization', `Bearer ${this.user.token}`)
        .set('Content-Type', 'application/json')
        .send({
          dataToRemove: {
            favoriteActivities: [
              this.favoriteActivities[1],
              this.favoriteActivities[2]
            ]
          }
        })
        .end((err, res) => {
          should.not.exist(err)
          res.should.have.status(201)
          res.should.be.a('object')
          res.body.should.have
            .property('message')
            .that.include('user updated with success')
          res.body.should.have.property('account')
          res.body.account.should.have
            .property('favoriteActivities')
            .which.is.an('array')
            .and.has.lengthOf(1)
          res.body.account.favoriteActivities[0].should.equal(
            this.favoriteActivities[0]
          )
          done()
        })
    })
  })
})
