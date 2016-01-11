"use strict";

var pwdWindow = require("./window");

function Applications() {
    this.instaChat = function(container) {
        var app = require("./applications/instaChat/app");
        app.launch(container);
    };

    this.memoryGame = function(container) {
        var app = require("./applications/memoryGame/app");
        app.launch(container);
    };

    this.settings = function(container) {
        var app = require("./applications/settings/app");
        app.launch(container);
    };


    this.error = function(container, err) {
        var elements = container.children;
        var text;

        for (var i = 1; i < elements.length; i += 1) {
            elements[i].remove();
        }

        text = document.createTextNode(err);
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
        applications.error(container, err);
    }
}

module.exports.launcher = launcher;

