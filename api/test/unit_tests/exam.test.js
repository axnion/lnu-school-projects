const nock = require('nock')
const request = require('supertest')('localhost:8080')
const controller = require('../../model/exam/controller')
const router = require('../../model/exam/router')
const sinon = require('sinon')
const mongoose = require('mongoose')
require('sinon-mongoose')

const Exam = require('../../model/exam/facade')

describe('Get exam route', () => {
  test('Get something', done => {
    nock('http://localhost:8080')
      .get('/exam')
      .reply(200, {
        status: 200
      })

    request.get('/exam').end((err, res) => {
      expect(res.body.status).toEqual(200)
      done()
    })
  })

  test('test find', done => {
    let examMock = sinon.mock(Exam)
    let expectedResult = {
      status: 200,
      exam: []
    }
    examMock.expects('find').yields(null, expectedResult)
    Exam.find(function (err, result) {
      examMock.verify()
      examMock.restore()
      expect(result.status).toEqual(200)
      done()
    })
    done()
  })

  test('test findById', done => {
    let examMock = sinon.mock(Exam)
    let expectedResult = {
      status: 200
    }
    examMock.expects('findById').yields(null, expectedResult)
    Exam.findById(function (err, result) {
      examMock.verify()
      examMock.restore()
      expect(result.status).toEqual(200)
      done()
    })
  })

  test('test findOne', done => {
    let examMock = sinon.mock(Exam)
    let expectedResult = {
      status: 200
    }
    examMock.expects('findOne').yields(null, expectedResult)
    Exam.findOne(function (err, result) {
      examMock.verify()
      examMock.restore()
      expect(result.status).toEqual(200)
      done()
    })
  })
})
