const controller = require('./controller');
const Router = require('express').Router;
const router = new Router();

router.route('/')
  .get((...args) => controller.find(...args));

router.route('/create').post((...args) => controller.createExam(...args));

router.route('/get').post((...args) => controller.getExam(...args));

router.route('/build').post((...args) => controller.buildExam(...args));

router.route('/getmyexam').post((...args) => controller.getMyExam(...args));


router.route('/:id')
  .put((...args) => controller.update(...args))
  .get((...args) => controller.findById(...args))
  .delete((...args) => controller.remove(...args));

module.exports = router;
