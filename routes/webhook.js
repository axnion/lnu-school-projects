"use strict"

const router = require("express").Router()

router.route("/").post(function(req, res) {
    console.log("NOTIFICATION!")

    let io = req.app.get("socketio")
    let test = ["Back", "blalba", "bla"]

    io.sockets.emit("notification", createNotification(req.body))

    console.log("I'm hooked!")
    res.redirect("/")
})

function createNotification(data) {
    return {
        action: data.action,
        title: data.issue.title,
        url: data.issue.url,
        creator: data.issue.user.login
    }
}

module.exports = router

//91jgr8u3jgr98ijg29j
