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

// TODO: In npm create dev and prod dependencies
// TODO: Add proper error handling
// TODO: Move all Github API handling to a lib
// TODO: Security, including the websockets

/*
When user connencts he picks repositories to monitor and when he clicks add a webhook is created on
that repository. When the the client disconnects from the websocket all webhooks created by this
application is removed.

The client clicks the add button. The client then sends only the repo name though websocket to the
server which creates the websocket with the socket.id in the name so it's comparable when we need to
delete it.

When the user disconnects the server with catch the disconnect event and delete all hooks with the
socket id.

To solve the problem of everyone getting the push from the webhook, the webhook should include an
id of the client which should have the message.
 */

app.engine("handlebars", exphbs({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(express.static(path.join(__dirname, "public")))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use("/", require("./routes/index"))
app.use("/test", require("./routes/test"))
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

server.listen(80)
