"use strict"

const express       = require("express")
const exphbs        = require("express-handlebars")
const path          = require("path")
const bodyParser    = require("body-parser")
const http          = require("http")

const app       = express()
const server    = http.createServer(app)
const io        = require("socket.io")(server)

// TODO: In npm create dev and prod dependencies
// TODO: Add proper error handling

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
    console.log("Client connected")
})

server.listen(80)
