"use strict"

const router = require("express").Router()

router.route("/").get(function(req, res) {
    res.render("index")
})

module.exports = router
