"use strict"

module.exports = {
    createWebhook: createWebhook,
    getIssues: getIssues
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

function getIssues(repo) {
    return new Promise(function(resolve, reject) {
        let options = {
            url: "https://api.github.com/repos/" + repo + "/issues",
            headers: {
                Host: "api.github.com",
                Authorization: "Basic " + new Buffer(
                    process.env.USER + ":" + process.env.API
                ).toString("base64"),
                "User-Agent": process.env.USER_AGENT
            }
        }

        request(options).then(function(body) {
            let issues = JSON.parse(body).map(function(issue) {
                return {
                    id: issue.id,
                    repo: repo,
                    url: issue.html_url,
                    title: issue.title,
                    number: issue.number,
                    comments: issue.comments,
                    user: {
                        username: issue.user.login,
                        avatar: issue.user.avatar_url
                    },
                    createdAt: issue.created_at,
                    updatedAt: issue.updated_at
                }
            })

            resolve(issues)
        }).catch(function(err) {
            reject(err)
        })
    })
}
