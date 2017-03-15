"use strict"

const router        = require("express").Router()
const request       = require("request-promise")
const linkParser    = require("parse-link-header")
const github        = require("../lib/githubApiClient")

router.route("/").get(function(req, res, next) {
    // getRepositories("https://api.github.com/user/repos").then(function(repos) {
    //     res.render("test", {repos: repos})
    // }).catch(function(err) {
    //     next(err)
    // })
    github.getRepositories("https://api.github.com/user/repos").then(function(repos) {
        res.render("test", {repos: repos})
    }).catch(function(err) {
        next(err)
    })
})

module.exports = router
