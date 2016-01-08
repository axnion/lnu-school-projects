(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var dock = require("./dock");
dock.init();

},{"./dock":5}],2:[function(require,module,exports){
function testApp(container) {
    var app = require("./applications/testApp/app");

    app.start(container);
}

function instaChat(container) {
    var app = require("./applications/instaChat/app");

    app.launch(container);
}

function error(container) {
    var text = document.createTextNode("An error occurred");
    container.appendChild(text);
}

module.exports.testApp = testApp;
module.exports.instaChat = instaChat;
module.exports.error = error;

},{"./applications/instaChat/app":3,"./applications/testApp/app":4}],3:[function(require,module,exports){
var socket = null;
var config = {
    adress: "ws://vhost3.lnu.se:20080/socket/",
    key: "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd",
    username: "an222yp"
};

function printMessage(container, message) {
    var template;
    var fragment;
    var messageElement;
    var username;
    var chatBox = container.querySelector(".chatBox");
    var date = new Date();
    var time = date.getHours() + ":" + date.getMinutes();

    template = document.querySelector("#messageTemplate");
    fragment = document.importNode(template.content, true);

    username = fragment.querySelector(".username");
    messageElement = fragment.querySelector(".message");

    if (message.username === config.username) {
        message.username = "You";
        username.className += " usernameSent";
        messageElement.className += " messageSent";
    }

    username.appendChild(document.createTextNode(message.username + " " + time));
    messageElement.appendChild(document.createTextNode(message.data));

    chatBox.appendChild(fragment);
}

function print(container) {
    var template;
    var node;

    template = document.querySelector("#instaChatTemplate");
    node = document.importNode(template.content, true);
    container.appendChild(node);
}

function connect(container) {
    return new Promise(function(resolve, reject) {
        socket = new WebSocket(config.adress);
        socket.addEventListener("open", function() {
            resolve();
        });

        socket.addEventListener("error", function() {
            reject("Det gick fel");
        });

        socket.addEventListener("message", function(event) {
            var message = JSON.parse(event.data);

            if (message.type === "message") {
                printMessage(container, message);
            }
        });
    });
}

function send(text) {
    var data = {
        type: "message",
        data: text,
        username: config.username,
        channel: "",
        key: config.key
    };
    socket.send(JSON.stringify(data));
}

function launch(container) {
    connect(container).then(function() {
        print(container);
        container.querySelector(".textArea").addEventListener("keypress", function(event) {
            if (event.keyCode === 13) {
                send(event.target.value);
                event.target.value = "";
                event.preventDefault();
            }
        });
    });

    container.querySelector(".closeWindowButton").addEventListener("click", function() {
        socket.close();
    });
}

module.exports.launch = launch;

},{}],4:[function(require,module,exports){
function start(container) {
    var text = document.createTextNode("This is new testApp!");
    container.appendChild(text);
}

module.exports.start = start;

},{}],5:[function(require,module,exports){
var dock = document.querySelector("#dock");
var buttons = [];
var launcher = require("./launcher");

var applications = [
    {id: "testApp", img: "../image/testApp.png", backgroundColor: "indianred"},
    {id: "instaChat", img: "../image/instaChat.png", backgroundColor: "yellowgreen"}
];

function centralize() {
    var width = dock.offsetWidth;
    dock.style.marginLeft = (width / 2) * -1;
}

function dockHideShow() {
    var i;

    dock.addEventListener("mouseover", function() {
        dock.style.height = "60px";

        for (i = 0; i < buttons.length; i += 1) {
            buttons[i].style.height = "50px";
        }
    });

    dock.addEventListener("mouseout", function() {
        dock.style.height = "0px";

        for (i = 0; i < buttons.length; i += 1) {
            buttons[i].style.height = "0px";
        }
    });
}

function addButton(app) {
    dock.style.width = dock.offsetWidth + 45;
    var button = document.createElement("div");
    button.className = "appButton";
    button.style.backgroundColor = app.backgroundColor;
    button.style.backgroundImage = "url(" + app.img + ")";
    dock.appendChild(button);

    button.addEventListener("click", function() {
        launcher.launchApplication(app);
    });

    buttons.push(button);
}

function init() {
    var i;
    for (i = 0; i < applications.length; i += 1) {
        addButton(applications[i]);
    }

    centralize();
    dockHideShow();
}

module.exports.init = init;

},{"./launcher":6}],6:[function(require,module,exports){
var pwdWindow = require("./window");

function launchApplication(app) {
    var appWindow;
    var launcherSpace;
    var launcher;

    appWindow = pwdWindow.createWindow(app);
    launcherSpace = require("./applications");

    try {
        launcher = launcherSpace[app.id];
        launcher(appWindow);
    } catch (error) {
        launcherSpace.error(appWindow);
    }
}

module.exports.launchApplication = launchApplication;

},{"./applications":2,"./window":7}],7:[function(require,module,exports){
var lastIndex = 0;
var offsetX = 0;
var offsetY = 0;
var positionX = 0;
var positionY = 0;
var element;

function grabElement(target) {
    element = target;
    offsetX = positionX - element.offsetLeft;
    offsetY = positionY - element.offsetTop;
    lastIndex += 1;
    element.style.zIndex = lastIndex;
}

function moveElement(event) {
    positionX = event.clientX;
    positionY = event.clientY;
    if (element) {
        element.style.left = positionX - (offsetX + 2) + "px";
        element.style.top = positionY - (offsetY + 2) + "px";
    }
}

function releaseElement() {
    element = undefined;
}

function addTemplate(templateName, containerName) {
    var container;
    var template;
    var node;

    container = document.querySelector(containerName);
    template = document.querySelector(templateName);
    node = document.importNode(template.content, true);
    container.appendChild(node);
}

function createWindow(app) {
    var topbar;
    var appWindow;

    addTemplate("#appWindowTemplate", "body");

    appWindow = document.querySelectorAll(".appWindow")[document.querySelectorAll(".appWindow").length - 1];
    topbar = appWindow.querySelector(".topbar");

    lastIndex += 1;
    appWindow.style.zIndex = lastIndex;

    topbar.querySelector(".appIcon").setAttribute("src", app.img);
    topbar.querySelector(".appTitle").appendChild(document.createTextNode(app.id));

    appWindow.style.backgroundColor = app.backgroundColor;

    topbar.addEventListener("mousedown", function() {
        grabElement(appWindow);
    });

    appWindow.addEventListener("mousemove", moveElement);
    document.addEventListener("mouseup", releaseElement);

    appWindow.addEventListener("click", function(event) {
        event.stopPropagation();
        lastIndex += 1;
        appWindow.style.zIndex = lastIndex;
    });

    topbar.querySelector(".closeWindowButton").addEventListener("click", function() {
        appWindow.remove();
    });

    return appWindow;
}

module.exports.createWindow = createWindow;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcGxpY2F0aW9ucy9pbnN0YUNoYXQvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvdGVzdEFwcC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2RvY2suanMiLCJjbGllbnQvc291cmNlL2pzL2xhdW5jaGVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy93aW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgZG9jayA9IHJlcXVpcmUoXCIuL2RvY2tcIik7XG5kb2NrLmluaXQoKTtcbiIsImZ1bmN0aW9uIHRlc3RBcHAoY29udGFpbmVyKSB7XG4gICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy90ZXN0QXBwL2FwcFwiKTtcblxuICAgIGFwcC5zdGFydChjb250YWluZXIpO1xufVxuXG5mdW5jdGlvbiBpbnN0YUNoYXQoY29udGFpbmVyKSB7XG4gICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9pbnN0YUNoYXQvYXBwXCIpO1xuXG4gICAgYXBwLmxhdW5jaChjb250YWluZXIpO1xufVxuXG5mdW5jdGlvbiBlcnJvcihjb250YWluZXIpIHtcbiAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiQW4gZXJyb3Igb2NjdXJyZWRcIik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRleHQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy50ZXN0QXBwID0gdGVzdEFwcDtcbm1vZHVsZS5leHBvcnRzLmluc3RhQ2hhdCA9IGluc3RhQ2hhdDtcbm1vZHVsZS5leHBvcnRzLmVycm9yID0gZXJyb3I7XG4iLCJ2YXIgc29ja2V0ID0gbnVsbDtcbnZhciBjb25maWcgPSB7XG4gICAgYWRyZXNzOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXG4gICAga2V5OiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCIsXG4gICAgdXNlcm5hbWU6IFwiYW4yMjJ5cFwiXG59O1xuXG5mdW5jdGlvbiBwcmludE1lc3NhZ2UoY29udGFpbmVyLCBtZXNzYWdlKSB7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBmcmFnbWVudDtcbiAgICB2YXIgbWVzc2FnZUVsZW1lbnQ7XG4gICAgdmFyIHVzZXJuYW1lO1xuICAgIHZhciBjaGF0Qm94ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdEJveFwiKTtcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgdmFyIHRpbWUgPSBkYXRlLmdldEhvdXJzKCkgKyBcIjpcIiArIGRhdGUuZ2V0TWludXRlcygpO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lc3NhZ2VUZW1wbGF0ZVwiKTtcbiAgICBmcmFnbWVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgICB1c2VybmFtZSA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudXNlcm5hbWVcIik7XG4gICAgbWVzc2FnZUVsZW1lbnQgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VcIik7XG5cbiAgICBpZiAobWVzc2FnZS51c2VybmFtZSA9PT0gY29uZmlnLnVzZXJuYW1lKSB7XG4gICAgICAgIG1lc3NhZ2UudXNlcm5hbWUgPSBcIllvdVwiO1xuICAgICAgICB1c2VybmFtZS5jbGFzc05hbWUgKz0gXCIgdXNlcm5hbWVTZW50XCI7XG4gICAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTmFtZSArPSBcIiBtZXNzYWdlU2VudFwiO1xuICAgIH1cblxuICAgIHVzZXJuYW1lLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UudXNlcm5hbWUgKyBcIiBcIiArIHRpbWUpKTtcbiAgICBtZXNzYWdlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlLmRhdGEpKTtcblxuICAgIGNoYXRCb3guYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xufVxuXG5mdW5jdGlvbiBwcmludChjb250YWluZXIpIHtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIG5vZGU7XG5cbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5zdGFDaGF0VGVtcGxhdGVcIik7XG4gICAgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUpO1xufVxuXG5mdW5jdGlvbiBjb25uZWN0KGNvbnRhaW5lcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldChjb25maWcuYWRyZXNzKTtcbiAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmVqZWN0KFwiRGV0IGdpY2sgZmVsXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcblxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcbiAgICAgICAgICAgICAgICBwcmludE1lc3NhZ2UoY29udGFpbmVyLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNlbmQodGV4dCkge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgZGF0YTogdGV4dCxcbiAgICAgICAgdXNlcm5hbWU6IGNvbmZpZy51c2VybmFtZSxcbiAgICAgICAgY2hhbm5lbDogXCJcIixcbiAgICAgICAga2V5OiBjb25maWcua2V5XG4gICAgfTtcbiAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG59XG5cbmZ1bmN0aW9uIGxhdW5jaChjb250YWluZXIpIHtcbiAgICBjb25uZWN0KGNvbnRhaW5lcikudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgcHJpbnQoY29udGFpbmVyKTtcbiAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dEFyZWFcIikuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICBzZW5kKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlV2luZG93QnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaCA9IGxhdW5jaDtcbiIsImZ1bmN0aW9uIHN0YXJ0KGNvbnRhaW5lcikge1xuICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJUaGlzIGlzIG5ldyB0ZXN0QXBwIVwiKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLnN0YXJ0ID0gc3RhcnQ7XG4iLCJ2YXIgZG9jayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKTtcbnZhciBidXR0b25zID0gW107XG52YXIgbGF1bmNoZXIgPSByZXF1aXJlKFwiLi9sYXVuY2hlclwiKTtcblxudmFyIGFwcGxpY2F0aW9ucyA9IFtcbiAgICB7aWQ6IFwidGVzdEFwcFwiLCBpbWc6IFwiLi4vaW1hZ2UvdGVzdEFwcC5wbmdcIiwgYmFja2dyb3VuZENvbG9yOiBcImluZGlhbnJlZFwifSxcbiAgICB7aWQ6IFwiaW5zdGFDaGF0XCIsIGltZzogXCIuLi9pbWFnZS9pbnN0YUNoYXQucG5nXCIsIGJhY2tncm91bmRDb2xvcjogXCJ5ZWxsb3dncmVlblwifVxuXTtcblxuZnVuY3Rpb24gY2VudHJhbGl6ZSgpIHtcbiAgICB2YXIgd2lkdGggPSBkb2NrLm9mZnNldFdpZHRoO1xuICAgIGRvY2suc3R5bGUubWFyZ2luTGVmdCA9ICh3aWR0aCAvIDIpICogLTE7XG59XG5cbmZ1bmN0aW9uIGRvY2tIaWRlU2hvdygpIHtcbiAgICB2YXIgaTtcblxuICAgIGRvY2suYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZG9jay5zdHlsZS5oZWlnaHQgPSBcIjYwcHhcIjtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZG9jay5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjBweFwiO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZEJ1dHRvbihhcHApIHtcbiAgICBkb2NrLnN0eWxlLndpZHRoID0gZG9jay5vZmZzZXRXaWR0aCArIDQ1O1xuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBcImFwcEJ1dHRvblwiO1xuICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhcHAuYmFja2dyb3VuZENvbG9yO1xuICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIGFwcC5pbWcgKyBcIilcIjtcbiAgICBkb2NrLmFwcGVuZENoaWxkKGJ1dHRvbik7XG5cbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsYXVuY2hlci5sYXVuY2hBcHBsaWNhdGlvbihhcHApO1xuICAgIH0pO1xuXG4gICAgYnV0dG9ucy5wdXNoKGJ1dHRvbik7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIGk7XG4gICAgZm9yIChpID0gMDsgaSA8IGFwcGxpY2F0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhZGRCdXR0b24oYXBwbGljYXRpb25zW2ldKTtcbiAgICB9XG5cbiAgICBjZW50cmFsaXplKCk7XG4gICAgZG9ja0hpZGVTaG93KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBpbml0O1xuIiwidmFyIHB3ZFdpbmRvdyA9IHJlcXVpcmUoXCIuL3dpbmRvd1wiKTtcblxuZnVuY3Rpb24gbGF1bmNoQXBwbGljYXRpb24oYXBwKSB7XG4gICAgdmFyIGFwcFdpbmRvdztcbiAgICB2YXIgbGF1bmNoZXJTcGFjZTtcbiAgICB2YXIgbGF1bmNoZXI7XG5cbiAgICBhcHBXaW5kb3cgPSBwd2RXaW5kb3cuY3JlYXRlV2luZG93KGFwcCk7XG4gICAgbGF1bmNoZXJTcGFjZSA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9uc1wiKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGxhdW5jaGVyID0gbGF1bmNoZXJTcGFjZVthcHAuaWRdO1xuICAgICAgICBsYXVuY2hlcihhcHBXaW5kb3cpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxhdW5jaGVyU3BhY2UuZXJyb3IoYXBwV2luZG93KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaEFwcGxpY2F0aW9uID0gbGF1bmNoQXBwbGljYXRpb247XG4iLCJ2YXIgbGFzdEluZGV4ID0gMDtcbnZhciBvZmZzZXRYID0gMDtcbnZhciBvZmZzZXRZID0gMDtcbnZhciBwb3NpdGlvblggPSAwO1xudmFyIHBvc2l0aW9uWSA9IDA7XG52YXIgZWxlbWVudDtcblxuZnVuY3Rpb24gZ3JhYkVsZW1lbnQodGFyZ2V0KSB7XG4gICAgZWxlbWVudCA9IHRhcmdldDtcbiAgICBvZmZzZXRYID0gcG9zaXRpb25YIC0gZWxlbWVudC5vZmZzZXRMZWZ0O1xuICAgIG9mZnNldFkgPSBwb3NpdGlvblkgLSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbn1cblxuZnVuY3Rpb24gbW92ZUVsZW1lbnQoZXZlbnQpIHtcbiAgICBwb3NpdGlvblggPSBldmVudC5jbGllbnRYO1xuICAgIHBvc2l0aW9uWSA9IGV2ZW50LmNsaWVudFk7XG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gcG9zaXRpb25YIC0gKG9mZnNldFggKyAyKSArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSBwb3NpdGlvblkgLSAob2Zmc2V0WSArIDIpICsgXCJweFwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVsZWFzZUVsZW1lbnQoKSB7XG4gICAgZWxlbWVudCA9IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gYWRkVGVtcGxhdGUodGVtcGxhdGVOYW1lLCBjb250YWluZXJOYW1lKSB7XG4gICAgdmFyIGNvbnRhaW5lcjtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIG5vZGU7XG5cbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lck5hbWUpO1xuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0ZW1wbGF0ZU5hbWUpO1xuICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub2RlKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlV2luZG93KGFwcCkge1xuICAgIHZhciB0b3BiYXI7XG4gICAgdmFyIGFwcFdpbmRvdztcblxuICAgIGFkZFRlbXBsYXRlKFwiI2FwcFdpbmRvd1RlbXBsYXRlXCIsIFwiYm9keVwiKTtcblxuICAgIGFwcFdpbmRvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXBwV2luZG93XCIpW2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXBwV2luZG93XCIpLmxlbmd0aCAtIDFdO1xuICAgIHRvcGJhciA9IGFwcFdpbmRvdy5xdWVyeVNlbGVjdG9yKFwiLnRvcGJhclwiKTtcblxuICAgIGxhc3RJbmRleCArPSAxO1xuICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG5cbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5hcHBJY29uXCIpLnNldEF0dHJpYnV0ZShcInNyY1wiLCBhcHAuaW1nKTtcbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5hcHBUaXRsZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhcHAuaWQpKTtcblxuICAgIGFwcFdpbmRvdy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhcHAuYmFja2dyb3VuZENvbG9yO1xuXG4gICAgdG9wYmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGdyYWJFbGVtZW50KGFwcFdpbmRvdyk7XG4gICAgfSk7XG5cbiAgICBhcHBXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlRWxlbWVudCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgcmVsZWFzZUVsZW1lbnQpO1xuXG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgbGFzdEluZGV4ICs9IDE7XG4gICAgICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgfSk7XG5cbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5jbG9zZVdpbmRvd0J1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFwcFdpbmRvdy5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhcHBXaW5kb3c7XG59XG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZVdpbmRvdyA9IGNyZWF0ZVdpbmRvdztcbiJdfQ==
