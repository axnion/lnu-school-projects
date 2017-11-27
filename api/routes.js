const Router = require('express').Router;
const router = new Router();

const slack = require('./model/slack/router');

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to slackapp API!' });
});

router.use('/slack', slack);

module.exports = router;
