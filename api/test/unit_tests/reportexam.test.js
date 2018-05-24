const mongoose = require('mongoose');
const sinon = require('sinon');
require('sinon-mongoose');

const controller = require('../../model/reportexam/controller');

describe('Test ', () => {

  test('spy stuff', done => {
    const spyController = sinon.spy(controller, 'createExamReport');

    const req = {
      body: {
        buildIsOk: false
      }
    };

    controller.createExamReport(req, () => {}, () => {});

    sinon.assert.calledOnce(controller.createExamReport);
    done();
  });
})
