"use strict";

var pwdWindow = require("./window");

function Applications() {
    this.testApp = function(container) {
        var app = require("./applications/testApp/app");
        app.start(container);
    };

    this.instaChat = function(container) {
        var app = require("./applications/instaChat/app");
        app.launch(container);
    };

    this.error = function(container) {
        var text = document.createTextNode("An error occurred");
        container.appendChild(text);
    };
}

function launcher(app) {
    var container;
    var applications;

    container = pwdWindow.createWindow(app);
    applications = new Applications();

    try {
        applications[app.id](container);
    } catch (err) {
        applications.error(container);
    }
}

module.exports.launcher = launcher;

