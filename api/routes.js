const Router = require('express').Router;
const router = new Router();

const exam = require('./model/exam/router');
const bookexam = require('./model/bookexam/router');
const reportExam = require('./model/reportexam/router');

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to slackapp API!' });
});

router.use('/exam', exam);
router.use('/bookexam', bookexam);
router.use('/reportexam', reportExam);
module.exports = router;
