const config = {
  environment: process.env.NODE_ENV || 'dev',
  server: {
    port: process.env.PORT || 8080
  },
  mongo: {
    url: process.env.MONGO_DB_URI || 'mongodb://localhost/slackapp'
  },
  slack: {
    token: process.env.SLACKTOKEN,
    apitoken: "xoxp-273720381861-273503337875-295792058871-3b163bd86f0376bb62cf609f4df26983"
  }
};

module.exports = config;
