const rp = require('request-promise');

module.exports = {
  async function(channelName, slackUser, message) {
    const options = {
      method: 'GET',
      uri: `https://slack.com/api/chat.postMessage?token=xoxp-273720381861-272957369408-294957226822-bb7917d088c058e70600b89f9d0617e8&channel=${slackUser}&text=${message}&pretty=1`,
    };

    return rp(options).then(resp => {
      const res = JSON.parse(resp);
      if (!res.ok) {
        reportToSlack(channelName, channelName, `Oh nooooo! Something went wrong while sending a message to ${slackUser} about their Jenkins build.`);
      }
      return res;
    })
      .catch(err => err);
  }
}