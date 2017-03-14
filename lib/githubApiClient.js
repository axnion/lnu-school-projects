"use strict"

module.exports = {
    createWebhook, createWebhook
}

const request   = require("request-promise")

function createWebhook(repo, id) {
    let options = {
        url: "https://api.github.com/repos/" + repo + "/hooks",
        method: "POST",
        headers: {
            Host: "api.github.com",
            Authorization: "Basic " + new Buffer(
                process.env.USER + ":" + process.env.API
            ).toString("base64"),
            "User-Agent": process.env.USER_AGENT
        },
        body: JSON.stringify({
            name: "web",
            config: {
                url: process.env.URL + "/webhook/" + id,
                content_type: "json",
                secret: process.env.WEBHOOK
            },
            events: [
                "issues",
                "issue_comment"
            ],
            active: true
        })
    }

    request(options)
}
