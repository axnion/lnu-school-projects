// A module to check if a slackid is admin of the workspace

const request = require("request");
const url = "https://slack.com/api/users.info";

module.exports = function(token, user) {
    return new Promise((resolve, reject) => {
        request.post(url, {form:{token: token, user: user}}, function(error, response, body) {
            if (error) {
                reject("nope, could not connect, check your url");
            } else {
                let obj = JSON.parse(body);
                if (obj.user) {
                    resolve(obj.user.is_admin);
                } else {
                    reject("nope, no user found, check your user id");
                }  
            }
        });
    }).catch(e => {
        console.log(e);
    })
};