"use strict"

const router    = require("express").Router()
const request   = require("request-promise")

router.route("/").get(function(req, res, next) {
    let options = {
        url: "https://api.github.com/repos/1dv023/an222yp-examination-3/issues",
        headers: {
            Host: "api.github.com",
            Authorization: "Basic " + new Buffer(
                process.env.GITHUB_USER + ":" + process.env.GITHUB_API
            ).toString("base64"),
            "User-Agent": "an222yp@student.lnu.se"
        }
    }

    request(options).then(function(json) {
        res.render("index", {issues: mapIssues(json)})
    }).catch(function(err) {
        next(err)
    })
})

function mapIssues(json) {
    let issues = JSON.parse(json)

    return issues.map(function(issue) {
        return {
            url: issue.url,
            title: issue.title,
            number: issue.number,
            state: issue.state,
            user: {
                username: issue.user.login,
                avatar: issue.user.avatar_url
            },
            createdAt: issue.created_at,
            updatedAt: issue.updated_at
        }
    })
}

module.exports = router
