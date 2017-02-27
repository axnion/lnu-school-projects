"use strict"

const router = require("express").Router()

router.route("/").post(function(req, res) {
    let io = req.app.get("socketio")
    let test = ["Back", "blalba", "bla"]
    io.emit("test", test)

    console.log("I'm hooked!")
    res.redirect("/")
})

module.exports = router
