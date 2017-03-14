"use strict"

const router = require("express").Router()
const crypto = require("crypto")

router.route("/:id").post(function(req, res) {
    console.log("webhook!")
    let io = req.app.get("socketio")

    if (validate(JSON.stringify(req.body), process.env.WEBHOOK, req.get("X-Hub-Signature"))) {
        let notification = createNotification(req.body)

        io.sockets.connected[req.params.id].emit("notification", createNotification(req.body))
        //io.sockets.emit("notification", createNotification(req.body))
    }

    //console.log(notification)
    res.redirect("/")
})

function createNotification(data) {
    return {
        action: data.action,
        id: data.issue.id,
        repo: data.repository.full_name,
        url: data.issue.html_url,
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

function validate(payload, key, hash) {
    let newHash = "sha1=" + crypto.createHmac("sha1", key).update(payload).digest("hex")
    return newHash === hash
}

module.exports = router
