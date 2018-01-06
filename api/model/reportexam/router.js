const controller = require('./controller');
const Router = require('express').Router;
const router = new Router();

router
  .route('/')
  .post((...args) => controller.createExamReport(...args));

module.exports = router;
