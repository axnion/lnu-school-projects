const Router = require('express').Router;
const router = new Router();

const slack = require('./model/slack/router');
const example = require('./model/example/router');

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to slackapp API!' });
});

router.use('/slack', slack);
router.use('/example', example);

module.exports = router;
