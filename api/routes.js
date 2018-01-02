const Router = require('express').Router;
const router = new Router();

const exam = require('./model/exam/router');
const bookExam = require('./model/bookexam/router');
const reportExam = require('./model/reportexam/router');
const user = require('./model/user/router');

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome two slackapp API!' });
});

router.use('/exam', exam);
router.use('/bookexam', bookExam);
router.use('/reportexam', reportExam);
router.use('/user', user);
module.exports = router;
