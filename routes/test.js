"use strict"

const router        = require("express").Router()
const request       = require("request-promise")
const linkParser    = require("parse-link-header")

router.route("/").get(function(req, res, next) {
    getRepositories("https://api.github.com/user/repos").then(function(repos) {
        console.log("Done")
        repos.forEach(function(repo) {
            console.log(repo.full_name)
        })

        res.render("test")
    }).catch(function(err) {
        next(err)
    })
})

function getRepositories(url) {
    return new Promise(function(resolve, reject) {
        let options = {
            url: url,
            headers: {
                Host: "api.github.com",
                Authorization: "Basic " + new Buffer(
                    process.env.USER + ":" + process.env.API
                ).toString("base64"),
                "User-Agent": process.env.USER_AGENT
            },
            resolveWithFullResponse: true
        }

        request(options).then(function(res) {
            let link = linkParser(res.headers.link)
            if (link.next) {
                getRepositories(link.next.url).then(function(repos) {
                    let allRepos = repos
                    allRepos =  allRepos.concat(JSON.parse(res.body))
                    resolve(repos)
                }).catch(function(err) {
                    throw err
                })
            } else {
                resolve(JSON.parse(res.body))
            }
        }).catch(function(err) {
            reject(err)
        })
    })
}

module.exports = router
