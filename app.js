"use strict"

const express       = require("express")
const exphbs        = require("express-handlebars")
const path          = require("path")
const bodyParser    = require("body-parser")
const http          = require("http")
const github        = require("./lib/githubApiClient")

const app       = express()
const server    = http.createServer(app)
const io        = require("socket.io")(server)

// TODO: Move all Github API handling to a lib
// TODO: Security, including the websockets

app.engine("handlebars", exphbs({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(express.static(path.join(__dirname, "public")))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use("/", require("./routes/index"))
app.use("/webhook", require("./routes/webhook"))

app.set("socketio", io)

io.on("connection", function(socket) {
    console.log("Client " + socket.id + " connected")

    socket.on("disconnect", function() {
        console.log("Client " + socket.id + " disconnected")
        github.removeWebhooks(socket.id)
    })

    socket.on("addWatch", function(repo) {
        github.createWebhook(repo, socket.id)
        github.getIssues(repo).then(function(issues) {
            socket.emit("addRepo", issues)
        })
    })
})

app.use(function(req, res) {
    res.status(404)
    res.render("404")
})

app.use(function(err, req, res, next) {
    console.log(err.stack)
    res.status(500).render("500")
})

server.listen(80)
