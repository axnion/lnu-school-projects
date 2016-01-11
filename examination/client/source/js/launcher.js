"use strict";

var pwdWindow = require("./window");

/**
 * A constrictor function creating an object containing methods. These methods are called when launching an application.
 * The mathod of the application has to have the same name as in the applicationsList.json. Inside one of these methods
 * you can either create and application or call a function to create an application.
 * @constructor
 */
function Applications() {

    /**
     * Is called when we want to launch an instance of the instaChat application.
     * @param container An HTML element where the application will be created.
     */
    this.instaChat = function(container) {
        var app = require("./applications/instaChat/app");
        app.launch(container);
    };

    /**
     * Is called when we want to launch an instance of the instaChat application.
     * @param container An HTML element where the application will be created.
     */
    this.memoryGame = function(container) {
        var app = require("./applications/memoryGame/app");
        app.launch(container);
    };

    /**
     * Is called when we want to launch an instance of the instaChat application.
     * @param container An HTML element where the application will be created.
     */
    this.settings = function(container) {
        var app = require("./applications/settings/app");
        app.launch(container);
    };

    /**
     * Is called when we want to launch an instance of the instaChat application.
     * @param container An HTML element where the application will be created.
     * @param err       An error message.
     */
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

/**
 * Starts by creating a new window. Then an object of Applications with all the functions to launch the applications.
 * The id member in app has the name of the method we want to call in the Applications object. We try calling that and
 * if we succeed we will have an application. If something fails during the launch of the application the error
 * application is called instead.
 * @param app An object containing information about the application to be launched.
 */
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

