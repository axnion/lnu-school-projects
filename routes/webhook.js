"use strict"

const router = require("express").Router()

router.route("/").post(function(req, res) {
    let io = req.app.get("socketio")
    let notification = createNotification(req.body)

    console.log(notification)
    io.sockets.emit("notification", notification)
    res.redirect("/")
})

function createNotification(data) {
    console.log(data)
    return {
        action: data.action,
        id: data.issue.id,
        url: data.issue.url,
        title: data.issue.title,
        number: data.issue.number,
        comments: data.issue.comments,
        user: {
            username: data.issue.user.login,
            avatar: data.issue.user.avatar_url
        },
        createdAt: data.issue.created_at,
        updatedAt: data.issue.updated_at
    }
}

module.exports = router
