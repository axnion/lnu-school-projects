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

    template = document.querySelector("#messageTemplate");
    fragment = document.importNode(template.content, true);

    username = fragment.querySelector(".username");
    username.appendChild(document.createTextNode(message.username));
    messageElement = fragment.querySelector(".message");
    messageElement.appendChild(document.createTextNode(message.data));


    if (message.username === config.username) {
        messageElement.className += " sentMessage";
    } else {
        messageElement.className += " receivedMessage";
    }

    chatBox.appendChild(fragment);
}

function print(container) {
    var template;
    var node;

    template = document.querySelector("#instaChatTemplate");
    node = document.importNode(template.content, true);
    container.appendChild(node);

    container.style.backgroundColor = "greenyellow";
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

            if(message.type === "message") {
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
    {id: "testApp", img: "../image/test.jpg"},
    {id: "instaChat", img: ""}
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
    button.style.backgroundImage = "url(" + app.img + ")";
    dock.appendChild(button);

    button.addEventListener("click", function() {
        launcher.launchApplication(app.id);
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


function launchApplication(appID) {
    var appWindow;
    var launcherSpace;
    var launcher;

    appWindow = pwdWindow.createWindow();
    launcherSpace = require("./applications");

    try {
        launcher = launcherSpace[appID];
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

function createWindow() {
    var topbar;
    var appWindow;

    addTemplate("#appWindowTemplate", "body");

    appWindow = document.querySelectorAll(".appWindow")[document.querySelectorAll(".appWindow").length - 1];
    topbar = appWindow.querySelector(".topbar");

    lastIndex += 1;
    appWindow.style.zIndex = lastIndex;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcGxpY2F0aW9ucy9pbnN0YUNoYXQvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvdGVzdEFwcC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2RvY2suanMiLCJjbGllbnQvc291cmNlL2pzL2xhdW5jaGVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy93aW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBkb2NrID0gcmVxdWlyZShcIi4vZG9ja1wiKTtcbmRvY2suaW5pdCgpO1xuIiwiZnVuY3Rpb24gdGVzdEFwcChjb250YWluZXIpIHtcbiAgICB2YXIgYXBwID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zL3Rlc3RBcHAvYXBwXCIpO1xuXG4gICAgYXBwLnN0YXJ0KGNvbnRhaW5lcik7XG59XG5cbmZ1bmN0aW9uIGluc3RhQ2hhdChjb250YWluZXIpIHtcbiAgICB2YXIgYXBwID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zL2luc3RhQ2hhdC9hcHBcIik7XG5cbiAgICBhcHAubGF1bmNoKGNvbnRhaW5lcik7XG59XG5cbmZ1bmN0aW9uIGVycm9yKGNvbnRhaW5lcikge1xuICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJBbiBlcnJvciBvY2N1cnJlZFwiKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLnRlc3RBcHAgPSB0ZXN0QXBwO1xubW9kdWxlLmV4cG9ydHMuaW5zdGFDaGF0ID0gaW5zdGFDaGF0O1xubW9kdWxlLmV4cG9ydHMuZXJyb3IgPSBlcnJvcjtcbiIsInZhciBzb2NrZXQgPSBudWxsO1xudmFyIGNvbmZpZyA9IHtcbiAgICBhZHJlc3M6IFwid3M6Ly92aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIixcbiAgICBrZXk6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIixcbiAgICB1c2VybmFtZTogXCJhbjIyMnlwXCJcbn07XG5cbmZ1bmN0aW9uIHByaW50TWVzc2FnZShjb250YWluZXIsIG1lc3NhZ2UpIHtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIGZyYWdtZW50O1xuICAgIHZhciBtZXNzYWdlRWxlbWVudDtcbiAgICB2YXIgdXNlcm5hbWU7XG4gICAgdmFyIGNoYXRCb3ggPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jaGF0Qm94XCIpO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lc3NhZ2VUZW1wbGF0ZVwiKTtcbiAgICBmcmFnbWVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgICB1c2VybmFtZSA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudXNlcm5hbWVcIik7XG4gICAgdXNlcm5hbWUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZS51c2VybmFtZSkpO1xuICAgIG1lc3NhZ2VFbGVtZW50ID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlXCIpO1xuICAgIG1lc3NhZ2VFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UuZGF0YSkpO1xuXG5cbiAgICBpZiAobWVzc2FnZS51c2VybmFtZSA9PT0gY29uZmlnLnVzZXJuYW1lKSB7XG4gICAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTmFtZSArPSBcIiBzZW50TWVzc2FnZVwiO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTmFtZSArPSBcIiByZWNlaXZlZE1lc3NhZ2VcIjtcbiAgICB9XG5cbiAgICBjaGF0Qm94LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbn1cblxuZnVuY3Rpb24gcHJpbnQoY29udGFpbmVyKSB7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdFRlbXBsYXRlXCIpO1xuICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgIGNvbnRhaW5lci5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcImdyZWVueWVsbG93XCI7XG59XG5cbmZ1bmN0aW9uIGNvbm5lY3QoY29udGFpbmVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5hZHJlc3MpO1xuICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZWplY3QoXCJEZXQgZ2ljayBmZWxcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgICAgICBpZihtZXNzYWdlLnR5cGUgPT09IFwibWVzc2FnZVwiKSB7XG4gICAgICAgICAgICAgICAgcHJpbnRNZXNzYWdlKGNvbnRhaW5lciwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzZW5kKHRleHQpIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGRhdGE6IHRleHQsXG4gICAgICAgIHVzZXJuYW1lOiBjb25maWcudXNlcm5hbWUsXG4gICAgICAgIGNoYW5uZWw6IFwiXCIsXG4gICAgICAgIGtleTogY29uZmlnLmtleVxuICAgIH07XG4gICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xufVxuXG5mdW5jdGlvbiBsYXVuY2goY29udGFpbmVyKSB7XG4gICAgY29ubmVjdChjb250YWluZXIpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIHByaW50KGNvbnRhaW5lcik7XG4gICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLnRleHRBcmVhXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgc2VuZChldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jbG9zZVdpbmRvd0J1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNvY2tldC5jbG9zZSgpO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBsYXVuY2g7XG4iLCJmdW5jdGlvbiBzdGFydChjb250YWluZXIpIHtcbiAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiVGhpcyBpcyBuZXcgdGVzdEFwcCFcIik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRleHQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5zdGFydCA9IHN0YXJ0O1xuIiwidmFyIGRvY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIik7XG52YXIgYnV0dG9ucyA9IFtdO1xudmFyIGxhdW5jaGVyID0gcmVxdWlyZShcIi4vbGF1bmNoZXJcIik7XG5cbnZhciBhcHBsaWNhdGlvbnMgPSBbXG4gICAge2lkOiBcInRlc3RBcHBcIiwgaW1nOiBcIi4uL2ltYWdlL3Rlc3QuanBnXCJ9LFxuICAgIHtpZDogXCJpbnN0YUNoYXRcIiwgaW1nOiBcIlwifVxuXTtcblxuZnVuY3Rpb24gY2VudHJhbGl6ZSgpIHtcbiAgICB2YXIgd2lkdGggPSBkb2NrLm9mZnNldFdpZHRoO1xuICAgIGRvY2suc3R5bGUubWFyZ2luTGVmdCA9ICh3aWR0aCAvIDIpICogLTE7XG59XG5cbmZ1bmN0aW9uIGRvY2tIaWRlU2hvdygpIHtcbiAgICB2YXIgaTtcblxuICAgIGRvY2suYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZG9jay5zdHlsZS5oZWlnaHQgPSBcIjYwcHhcIjtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZG9jay5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjBweFwiO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZEJ1dHRvbihhcHApIHtcbiAgICBkb2NrLnN0eWxlLndpZHRoID0gZG9jay5vZmZzZXRXaWR0aCArIDQ1O1xuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBcImFwcEJ1dHRvblwiO1xuICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIGFwcC5pbWcgKyBcIilcIjtcbiAgICBkb2NrLmFwcGVuZENoaWxkKGJ1dHRvbik7XG5cbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsYXVuY2hlci5sYXVuY2hBcHBsaWNhdGlvbihhcHAuaWQpO1xuICAgIH0pO1xuXG4gICAgYnV0dG9ucy5wdXNoKGJ1dHRvbik7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIGk7XG4gICAgZm9yIChpID0gMDsgaSA8IGFwcGxpY2F0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhZGRCdXR0b24oYXBwbGljYXRpb25zW2ldKTtcbiAgICB9XG5cbiAgICBjZW50cmFsaXplKCk7XG4gICAgZG9ja0hpZGVTaG93KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBpbml0O1xuIiwidmFyIHB3ZFdpbmRvdyA9IHJlcXVpcmUoXCIuL3dpbmRvd1wiKTtcblxuXG5mdW5jdGlvbiBsYXVuY2hBcHBsaWNhdGlvbihhcHBJRCkge1xuICAgIHZhciBhcHBXaW5kb3c7XG4gICAgdmFyIGxhdW5jaGVyU3BhY2U7XG4gICAgdmFyIGxhdW5jaGVyO1xuXG4gICAgYXBwV2luZG93ID0gcHdkV2luZG93LmNyZWF0ZVdpbmRvdygpO1xuICAgIGxhdW5jaGVyU3BhY2UgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnNcIik7XG5cbiAgICB0cnkge1xuICAgICAgICBsYXVuY2hlciA9IGxhdW5jaGVyU3BhY2VbYXBwSURdO1xuICAgICAgICBsYXVuY2hlcihhcHBXaW5kb3cpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxhdW5jaGVyU3BhY2UuZXJyb3IoYXBwV2luZG93KTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaEFwcGxpY2F0aW9uID0gbGF1bmNoQXBwbGljYXRpb247XG4iLCJ2YXIgbGFzdEluZGV4ID0gMDtcbnZhciBvZmZzZXRYID0gMDtcbnZhciBvZmZzZXRZID0gMDtcbnZhciBwb3NpdGlvblggPSAwO1xudmFyIHBvc2l0aW9uWSA9IDA7XG52YXIgZWxlbWVudDtcblxuZnVuY3Rpb24gZ3JhYkVsZW1lbnQodGFyZ2V0KSB7XG4gICAgZWxlbWVudCA9IHRhcmdldDtcbiAgICBvZmZzZXRYID0gcG9zaXRpb25YIC0gZWxlbWVudC5vZmZzZXRMZWZ0O1xuICAgIG9mZnNldFkgPSBwb3NpdGlvblkgLSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbn1cblxuZnVuY3Rpb24gbW92ZUVsZW1lbnQoZXZlbnQpIHtcbiAgICBwb3NpdGlvblggPSBldmVudC5jbGllbnRYO1xuICAgIHBvc2l0aW9uWSA9IGV2ZW50LmNsaWVudFk7XG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gcG9zaXRpb25YIC0gKG9mZnNldFggKyAyKSArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSBwb3NpdGlvblkgLSAob2Zmc2V0WSArIDIpICsgXCJweFwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVsZWFzZUVsZW1lbnQoKSB7XG4gICAgZWxlbWVudCA9IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gYWRkVGVtcGxhdGUodGVtcGxhdGVOYW1lLCBjb250YWluZXJOYW1lKSB7XG4gICAgdmFyIGNvbnRhaW5lcjtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIG5vZGU7XG5cbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lck5hbWUpO1xuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0ZW1wbGF0ZU5hbWUpO1xuICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub2RlKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlV2luZG93KCkge1xuICAgIHZhciB0b3BiYXI7XG4gICAgdmFyIGFwcFdpbmRvdztcblxuICAgIGFkZFRlbXBsYXRlKFwiI2FwcFdpbmRvd1RlbXBsYXRlXCIsIFwiYm9keVwiKTtcblxuICAgIGFwcFdpbmRvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXBwV2luZG93XCIpW2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXBwV2luZG93XCIpLmxlbmd0aCAtIDFdO1xuICAgIHRvcGJhciA9IGFwcFdpbmRvdy5xdWVyeVNlbGVjdG9yKFwiLnRvcGJhclwiKTtcblxuICAgIGxhc3RJbmRleCArPSAxO1xuICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG5cbiAgICB0b3BiYXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZ3JhYkVsZW1lbnQoYXBwV2luZG93KTtcbiAgICB9KTtcblxuICAgIGFwcFdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVFbGVtZW50KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCByZWxlYXNlRWxlbWVudCk7XG5cbiAgICBhcHBXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBsYXN0SW5kZXggKz0gMTtcbiAgICAgICAgYXBwV2luZG93LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbiAgICB9KTtcblxuICAgIHRvcGJhci5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlV2luZG93QnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgYXBwV2luZG93LnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGFwcFdpbmRvdztcbn1cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlV2luZG93ID0gY3JlYXRlV2luZG93O1xuIl19
