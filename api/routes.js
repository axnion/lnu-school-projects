const Router = require('express').Router;
const router = new Router();

const exam = require('./model/exam/router');
const bookExam = require('./model/bookexam/router');
const reportExam = require('./model/reportexam/router');
const user = require('./model/user/router');

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome two slackapp API!' });
});

router.route('*').all(function (req, res, next) {
    let token = req.body.token;
    if(req.url === "/bookexam"){
        token = JSON.parse(req.body.payload).token;
    }
    if(req.method === "POST" && req.url !== "/reportexam" && process.env.SLACKTOKEN !== token){
        return res.status(403);
    }

    return next();
});

router.use('/exam', exam);
router.use('/bookexam', bookExam);
router.use('/reportexam', reportExam);
router.use('/user', user);
module.exports = router;
