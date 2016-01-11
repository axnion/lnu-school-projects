"use strict";

//TODO Försök rensa upp så mkt html och css från javascriptkoden.

var dock = document.querySelector("#dock");
var buttons = [];
var launcher = require("./launcher");
var applications = require("./applicationsList");

/**
 * Takes the dock and places it in the center of the screen.
 */
function centralize() {
    var width = dock.offsetWidth;
    dock.style.marginLeft = (width / 2) * -1;
}

/**
 * Adds two event listeners on the dock. If the mouse is over the dock an event is triggered so the dock is visible. If
 * the mouse moves out of the dock and hideDock is set to true, the dock will hide.
 */
function dockHideShow() {
    var i;

    dock.addEventListener("mouseover", function() {
        dock.style.height = "60px";

        for (i = 0; i < buttons.length; i += 1) {
            buttons[i].style.height = "50px";
        }
    });

    dock.addEventListener("mouseout", function() {
        var hideDock = JSON.parse(localStorage.getItem("PWDSettings")).hideDock;

        if (hideDock === "true") {
            dock.style.height = "0px";

            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].style.height = "0px";
            }
        }
    });
}

/**
 * Adds a button to the dock. Loads the template, adds style to it and an event listener to launch the app.
 * @param app An object containing information about an application.
 */
function addButton(app) {
    var template;
    var button;

    template = document.querySelector("#appButtonTemplate");
    button = document.importNode(template.content.firstElementChild, false);

    button.className = "appButton";
    button.style.backgroundColor = app.backgroundColor;
    button.style.backgroundImage = "url(" + app.img + ")";
    dock.appendChild(button);
    dock.style.width = dock.offsetWidth + 45;

    button.addEventListener("click", function(event) {
        event.preventDefault();
        launcher.launcher(app);
    });

    buttons.push(button);
}

/**
 * Checks if there are settings in the localstorage, if not data is loaded from defaultSettings.json and uploaded to
 * localstorage. Settings are then applied to the web application.
 */
function loadSettings() {
    var settings;
    if (!localStorage.getItem("PWDSettings")) {
        localStorage.setItem("PWDSettings", JSON.stringify(require("./defaultSettings.json")));
    }

    settings = JSON.parse(localStorage.getItem("PWDSettings"));
    document.querySelector("body").style.backgroundImage = "url(" + settings.wallpaper + ")";

    if (settings.dockPosition === "top") {
        document.querySelector("#dock").classList.add("dockTop");
    } else {
        document.querySelector("#dock").classList.add("dockBottom");
    }
}

/**
 * Prepares and starts the fundamental functionalities of the PWD. Creates the dock and the buttons and links them to
 * an application, loads settings and applies them.
 */
function initialize() {
    var i;

    loadSettings();

    for (i = 0; i < applications.length; i += 1) {
        addButton(applications[i]);
    }

    centralize();
    dockHideShow();
}

module.exports.initialize = initialize;
