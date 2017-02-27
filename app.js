"use strict"

const express       = require("express")
const exphbs        = require("express-handlebars")
const path          = require("path")
const bodyParser    = require("body-parser")

const app = express()

app.engine("handlebars", exphbs({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(express.static(path.join(__dirname, "public")))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use("/", require("./routes/index"))

//app.use("/webhook", require("./routes/webhook"))

app.listen(8080)
