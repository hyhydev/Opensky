import chai from 'chai'
import chaiHttp from 'chai-http'
import app from '../../index'
const { expect } = chai

chai.use(chaiHttp)

describe('GET /aircraft', () => {
  it('should return 400 for invalid inputs', (done) => {
    chai
      .request(app)
      .get('/aircraft')
      .query({
        type: null,
        airport: 'EDDF',
        begin: '1517227200',
        end: '1517230800',
      })
      .end((err, res) => {
        expect(res).to.have.status(400)
        expect(res.text).to.equal('Bad request')
        done()
      })
  })

  it('should return 200 for valid inputs', (done) => {
    chai
      .request(app)
      .get('/aircraft')
      .query({
        type: 'arrival',
        airport: 'EDDF',
        begin: '1517227200',
        end: '1517230800',
      })
      .end((err, res) => {
        expect(res).to.have.status(200)
        expect(res.text).to.equal('Success')
        done()
      })
  })
})
