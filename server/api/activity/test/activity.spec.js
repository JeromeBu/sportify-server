const server = require('../../../../index')
const Activity = require('../model')
const Center = require('../../center/model')
const factory = require('../../../utils/modelFactory')
const chai = require('chai')
const should = require('chai').should()
const chaiHttp = require('chai-http')

const log = console.log()

chai.use(chaiHttp)

describe('TESTING ACTIVITIES ROUTES', () => {
  beforeEach(done => {
    Center.remove({}, () => Activity.remove({}, () => done()))
  })

  it('should GET an array with one activity without error', done => {
    factory
      .activity({})
      .then(() => {
        chai
          .request(server)
          .get('/api/activities')
          .end((err, res) => {
            should.not.exist(err)
            res.body.should.be.an('array')
            res.should.have.status(200)

            res.body.every(i =>
              i.should.to.have.all.keys(
                '__v',
                '_id',
                'name',
                'image',
                'sessions',
                'center'
              )
            )

            done()
          })
      })
      .catch(e => console.log(e))
  })

  it('should GET one activity  without error', done => {
    factory
      .activity({})
      .then(activity => {
        chai
          .request(server)
          .get(`/api/activities/${activity._id}`)
          .end((err, res) => {
            should.not.exist(err)
            res.should.have.status(200)

            res.body[0].should.have.keys(
              '_id',
              'center_doc',
              'name',
              'sessions_docs'
            )

            res.body[0].sessions_docs.should.be.an('array')

            res.body[0].sessions_docs.every(i =>
              i.should.to.have.all.keys(
                '__v',
                '_id',
                'activity',
                'bookedBy',
                'capacity',
                'duration',
                'peoplePresent',
                'shortId',
                'startsAt',
                'teacher'
              )
            )

            done()
          })
      })
      .catch(e => console.log(e))
  })
})
