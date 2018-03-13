const server = require('../../../../index')
const Session = require('../model')
const factory = require('../../../utils/modelFactory')
const chai = require('chai')
const should = require('chai').should()
const chaiHttp = require('chai-http')

const log = console.log()

chai.use(chaiHttp)

describe.only('TESTING SESSIONS ROUTES', () => {
  beforeEach(done => {
    Session.remove({})
      .then(() => done())
      .catch(e => log(e))
  })

  it.only('should GET an array with one session without error', async done => {
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

        done()
      })
  })
})
