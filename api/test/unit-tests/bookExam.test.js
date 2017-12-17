const mongoose = require('mongoose');
const sinon = require('sinon');
require('sinon-mongoose');

const controller = require('../../model/bookexam/controller');

describe('It performs a test', () => {
  test('stub exam', done => {
    const booking = sinon.stub(controller, controller.createBooking);

    // TODO: stubbing, assertions etc 
  })
})