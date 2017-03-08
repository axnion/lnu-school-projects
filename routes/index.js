"use strict"

const router    = require("express").Router()
const request   = require("request-promise")

router.route("/").get(function(req, res, next) {
    let options = {
        url: "https://api.github.com/repos/" + process.env.REPO + "/issues",
        headers: {
            Host: "api.github.com",
            Authorization: "Basic " + new Buffer(
                process.env.USER + ":" + process.env.API
            ).toString("base64"),
            "User-Agent": process.env.USER_AGENT
        }
    }

    console.log(options.url)

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
            id: issue.id,
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
}

module.exports = router
