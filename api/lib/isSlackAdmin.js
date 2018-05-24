// A module to check if a slackid is admin of the workspace

const request = require("request");
const url = process.env.SLACK_API_URL;

module.exports = function(token, user) {
    return new Promise((resolve, reject) => {
        request.post(url, {form:{token: token, user: user}}, function(error, response, body) {
            if (error) {
                reject("Could not connect, check the URL");
            } else {
                let obj = JSON.parse(body);
                if (obj.user) {
                    resolve(obj.user.is_admin);
                } else {
                    reject("No user found, check the user_id");
                }  
            }
        });
    }).catch(e => {
        console.log(e);
    })
};