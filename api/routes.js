const Router = require('express').Router;
const router = new Router();

const exam = require('./model/exam/router');
const bookExam = require('./model/bookexam/router');
const reportExam = require('./model/reportexam/router');
const user = require('./model/user/router');

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome the slackapp API! 11.0' });
});

router.route('*').all(function (req, res, next) {
    let token = req.body.token;
    if(req.url === "/bookexam"){
        token = JSON.parse(req.body.payload).token;
    }
    if(req.method === "POST" && req.url !== "/reportexam" && req.url !== "/exam/build" && process.env.SLACKTOKEN !== token){
        return res.status(403).json("Forbidden");
    }else {
        return next();
    }
});

router.use('/exam', exam);
router.use('/bookexam', bookExam);
router.use('/reportexam', reportExam);
router.use('/user', user);
module.exports = router;
