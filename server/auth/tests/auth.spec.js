const chai = require('chai')
const should = require('chai').should()
const chaiHttp = require('chai-http')
const server = require('../../../index')
const User = require('../../api/user/model')
const factory = require('../../utils/modelFactory')
const {
  createTestUsers,
  noEmailGiven,
  noTokenGiven,
  emailNotInDb,
  wrongToken,
  linkUsed,
  tokenOutdated,
  notValidEmail,
  authorizeAccess
} = require('./authFunc.test')

chai.use(chaiHttp)

describe('Authentication and password recovery', () => {
  describe('Authentication', () => {
    beforeEach(done => {
      User.remove({}, () => {
        done()
      })
    })

    describe('POST /auth/sign_up', () => {
      it('Not POST a user without password field', done => {
        const user = {
          firstName: 'firstName: No password given',
          email: 'test@mail.com'
        }
        chai
          .request(server)
          .post('/auth/sign_up')
          .send(user)
          .end((err, res) => {
            // should.not.exist(err);
            res.should.have.status(400)
            res.body.should.be.a('object')
            res.body.should.have.property('error')
            res.body.error.should.include('No password was given')
            // res.body.errors.password.should.have.property("kind").eql("required");
            done()
          })
      })
      it('Not POST a user without email field', done => {
        const user = {
          firstName: 'firstName: No email given',
          password: 'password'
        }
        chai
          .request(server)
          .post('/auth/sign_up')
          .send(user)
          .end((err, res) => {
            // should.not.exist(err);
            res.should.have.status(400)
            res.body.should.be.a('object')
            res.body.should.have.property('error')
            res.body.error.should.include('No username was given') // TODO: change username with email
            done()
          })
      })
      it('Not POST a user if email is already taken', done => {
        factory
          .user({
            firstName: 'firstName: email is already taken',
            email: 'alreadyTaken@mail.com',
            emailCheckValid: true
          })
          .then(validUser => {
            const newUser = {
              email: validUser.email,
              password: 'password'
            }
            chai
              .request(server)
              .post('/auth/sign_up')
              .send(newUser)
              .end((err, res) => {
                // should.not.exist(err);
                res.should.have.status(400)
                res.body.should.be.a('object')
                res.body.should.have.property('error')
                res.body.error.should.include('username is already registered')
                done()
              })
          })
      })
      it('POST a user', done => {
        const user = {
          firstName: 'firstName: POST a user',
          email: 'passing@mail.com',
          password: 'password'
        }
        chai
          .request(server)
          .post('/auth/sign_up')
          .send(user)
          .end((err, res) => {
            should.not.exist(err)
            res.should.have.status(200)
            res.body.should.be.a('object')
            res.body.should.have
              .property('message')
              .eql('User successfully signed up')
            res.body.user.should.have.property('token')
            res.body.user.should.have.property('account')
            done()
          })
      })
    })

    describe('POST /auth/log_in', () => {
      it('Returns user infos and token', done => {
        const password = 'superpassword'
        factory.user({ emailCheckValid: true, password }, validUser => {
          const request = {
            email: validUser.email,
            password
          }
          chai
            .request(server)
            .post('/auth/log_in')
            .send(request)
            .end((err, res) => {
              should.not.exist(err)
              res.should.have.status(200)
              res.body.should.have
                .property('message')
                .that.include('Login successful')
              res.body.should.have.property('user')
              res.body.user.should.have.property('token')
              done()
            })
        })
      })
      it('Returns Unauthorized when wrong password', done => {
        const password = 'superpassword'
        factory.user({ emailCheckValid: true, password }, validUser => {
          const request = {
            email: validUser.email,
            password: 'wrongpassword'
          }
          chai
            .request(server)
            .post('/auth/log_in')
            .send(request)
            .end((err, res) => {
              res.should.have.status(401)
              res.body.should.have
                .property('error')
                .that.include('Unauthorized')
              done()
            })
        })
      })
      it('Returns Unauthorized when no user find with email', done => {
        const request = {
          email: 'wrong@mail.com',
          password: 'superpassword'
        }
        chai
          .request(server)
          .post('/auth/log_in')
          .send(request)
          .end((err, res) => {
            res.should.have.status(401)
            res.body.should.have.property('error').that.include('Unauthorized')
            done()
          })
      })
      it('Asks to confirm email if not validated', done => {
        const password = 'superpassword'
        factory.user({ emailCheckValid: false, password }, user => {
          const request = {
            email: user.email,
            password
          }
          chai
            .request(server)
            .post('/auth/log_in')
            .send(request)
            .end((err, res) => {
              res.should.have.status(206)
              res.body.should.have
                .property('message')
                .that.include('confirm email')
              done()
            })
        })
      })
    })

    describe('GET /auth/email_check', () => {
      it('Confirms email', done => {
        factory.user({ emailCheckValid: false }, user => {
          chai
            .request(server)
            .get(
              `/auth/email_check?token=${user.emailCheck.token}&email=${
                user.email
              }`
            )
            .end((err, res) => {
              should.not.exist(err)
              res.should.have.status(200)
              res.should.be.a('object')
              res.body.should.have
                .property('message')
                .that.include('Your email has been verified with success')
              done()
            })
        })
      })
      it('Responds an error when called without token', done => {
        chai
          .request(server)
          .get('/auth/email_check')
          .end((err, res) => {
            res.should.have.status(400)
            res.should.be.a('object')
            res.text.should.include('No token specified')
            done()
          })
      })
      it('Responds an error when called with invalid token', done => {
        chai
          .request(server)
          .get('/auth/email_check?token=unexistingToken&email=email@mail.com')
          .end((err, res) => {
            res.should.have.status(400)
            res.should.be.a('object')
            res.text.should.include('Wrong credentials')
            done()
          })
      })
      it('Responds already valid when called on already valid user', done => {
        factory.user({ emailCheckValid: true }, validUser => {
          chai
            .request(server)
            .get(
              `/auth/email_check?token=${validUser.emailCheck.token}&email=${
                validUser.email
              }`
            )
            .end((err, res) => {
              res.should.have.status(206)
              res.should.be.a('object')
              res.body.should.have
                .property('message')
                .that.include('You have already confirmed your email')
              done()
            })
        })
      })
    })
  })

  describe('Recovery of password', () => {
    describe('POST /auth/forgotten_password', () => {
      beforeEach(done => {
        User.remove({}, () => {
          done()
        })
      })
      it('Returns a message if unknowm email', done => {
        const body = { email: 'wrong@mail.com' }
        chai
          .request(server)
          .post('/auth/forgotten_password')
          .send(body)
          .end((err, res) => {
            // should.not.exist(err);
            res.should.have.status(400)
            res.should.be.a('object')
            res.body.should.have
              .property('error')
              .that.include(
                "We don't have a user with this email in our dataBase"
              )
            done()
          })
      })
      it('Returns a message if no email provided', done => {
        const body = {}
        chai
          .request(server)
          .post('/auth/forgotten_password')
          .send(body)
          .end((err, res) => {
            res.should.have.status(400)
            res.should.be.a('object')
            res.body.should.have
              .property('error')
              .that.include('No email specified')
            done()
          })
      })
      it('Returns a message if email is not confirmed', done => {
        factory.user({ emailCheckValid: false }, user => {
          const body = {
            email: user.email
          }
          chai
            .request(server)
            .post('/auth/forgotten_password')
            .send(body)
            .end((err, res) => {
              res.should.have.status(400)
              res.should.be.a('object')
              res.body.should.have
                .property('error')
                .that.include('Your email is not confirmed')
              done()
            })
        })
      })
      it('Sends an email to redefine password', done => {
        factory.user({ emailCheckValid: true }, validUser => {
          const body = {
            email: validUser.email
          }
          chai
            .request(server)
            .post('/auth/forgotten_password')
            .send(body)
            .end((err, res) => {
              should.not.exist(err)
              res.should.have.status(200)
              res.should.be.a('object')
              res.body.should.have
                .property('message')
                .that.include(
                  'An email has been send with a link to change your password'
                )
              done()
            })
        })
      })
    })

    describe('GET /auth/reset_password', () => {
      const options = {
        validEmailUser: null,
        notValidEmailUser: null,
        outDatedTokenUser: null,
        alreadyUsedLinkUser: null
      }
      const httpVerb = 'get'
      // IIFE
      before(createTestUsers(options))
      it('Raise error if no email given', done => {
        noEmailGiven(done, httpVerb)
      })
      it('Raise error if no token given', done => {
        noTokenGiven(done, httpVerb)
      })
      it('Raise error if email is not in database', done => {
        emailNotInDb(done, httpVerb)
      })
      it("Raise error if token doen't match users changing password token", done => {
        wrongToken(done, httpVerb, validEmailUser)
      })
      it('Raise error if the change password link has already been used', done => {
        linkUsed(done, httpVerb, alreadyUsedLinkUser)
      })
      it('Raise error if user.passwordChange.token is outdated', done => {
        tokenOutdated(done, httpVerb, outDatedTokenUser)
      })
      it('Raise error if user has not validated email', done => {
        notValidEmail(done, httpVerb, notValidEmailUser)
      })
      it('Authorize Reset password page when user is OK ', done => {
        authorizeAccess(done, httpVerb, validEmailUser)
      })
    })

    describe('POST /auth/reset_password', () => {
      const options = {
        validEmailUser: null,
        notValidEmailUser: null,
        outDatedTokenUser: null,
        alreadyUsedLinkUser: null
      }
      const httpVerb = 'post'
      before(createTestUsers(options))
      it('Raise error if no email given', done => {
        noEmailGiven(done, httpVerb)
      })
      it('Raise error if no token given', done => {
        noTokenGiven(done, httpVerb)
      })
      it('Raise error if email is not in database', done => {
        emailNotInDb(done, httpVerb)
      })
      it("Raise error if token doen't match users changing password token", done => {
        wrongToken(done, httpVerb, validEmailUser)
      })
      it('Raise error if the change password link has already been used', done => {
        linkUsed(done, httpVerb, alreadyUsedLinkUser)
      })
      it('Raise error if user.passwordChange.token is outdated', done => {
        tokenOutdated(done, httpVerb, outDatedTokenUser)
      })
      it('Raise error if user has not validated email', done => {
        notValidEmail(done, httpVerb, notValidEmailUser)
      })
      it('Raise error if no password given', done => {
        const body = {}
        chai
          .request(server)
          .post(
            `/auth/reset_password?email=${validEmailUser.email}&token=${
              validEmailUser.passwordChange.token
            }`
          )
          .send(body)
          .end((err, res) => {
            res.should.have.status(400)
            res.should.be.a('object')
            res.body.should.have
              .property('error')
              .that.include('No password provided')
            done()
          })
      })
      it("Raise error if confirmation doesn't match password", done => {
        const body = {
          newPassword: 'newpassword',
          newPasswordConfirmation: 'somethingElse'
        }
        chai
          .request(server)
          .post(
            `/auth/reset_password?email=${validEmailUser.email}&token=${
              validEmailUser.passwordChange.token
            }`
          )
          .send(body)
          .end((err, res) => {
            res.should.have.status(400)
            res.should.be.a('object')
            res.body.should.have
              .property('error')
              .that.include('Password and confirmation are different')
            done()
          })
      })
      it('Changes the password', done => {
        const body = {
          newPassword: 'brandNewPassword',
          newPasswordConfirmation: 'brandNewPassword'
        }
        chai
          .request(server)
          .post(
            `/auth/reset_password?email=${validEmailUser.email}&token=${
              validEmailUser.passwordChange.token
            }`
          )
          .send(body)
          .end((err, res) => {
            should.not.exist(err)
            res.should.be.a('object')
            res.body.should.have
              .property('message')
              .that.include('Password reset successfully')
            done()
          })
      })
    })
  })
})
