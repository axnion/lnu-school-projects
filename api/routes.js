const Router = require('express').Router;
const router = new Router();

const slack = require('./model/slack/router');
const example = require('./model/example/router');
const exam = require('./model/exam/router');
const bookexam = require('./model/bookexam/router');
const reportExam = require('./model/reportexam/router');

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to slackapp API!' });
});

router.use('/slack', slack);
router.use('/example', example);
router.use('/exam', exam);
router.use('/bookexam', bookexam);
router.use('/reportexam', reportExam);
module.exports = router;
