(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var dock = require("./dock");
dock.init();

},{"./dock":6}],2:[function(require,module,exports){
"use strict";

var socket = null;
var config = {
    adress: "ws://vhost3.lnu.se:20080/socket/",
    key: "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
};

function printLoginScreen(container) {
    var template;
    var node;

    template = document.querySelector("#instaChatLoginTemplate");
    node = document.importNode(template.content, true);
    container.appendChild(node);
}

function printOperationsScreen(container) {
    var template;
    var node;

    template = document.querySelector("#instaChatTemplate");
    node = document.importNode(template.content, true);
    container.appendChild(node);
}

function printMessage(container, message) {
    var template;
    var fragment;
    var messageElement;
    var usernameElement;
    var chatBox = container.querySelector(".chatBox");
    var date = new Date();
    var time = date.getHours() + ":" + date.getMinutes();

    template = document.querySelector("#messageTemplate");
    fragment = document.importNode(template.content, true);

    usernameElement = fragment.querySelector(".username");
    messageElement = fragment.querySelector(".message");

    if (message.username === sessionStorage.username) {
        message.username = "You";
        usernameElement.className += " usernameSent";
        messageElement.className += " messageSent";
    }

    usernameElement.appendChild(document.createTextNode(message.username + " " + time));
    messageElement.appendChild(document.createTextNode(message.data));

    chatBox.appendChild(fragment);
}

function login(container) {
    printLoginScreen(container);
    var loginDiv = container.querySelector(".instaChatLogin");
    return new Promise(function(resolve) {

        if(sessionStorage.username) {
            loginDiv.remove();
            resolve();
            return;
        }

        loginDiv.addEventListener("keypress", function(event) {
            if (event.keyCode === 13) {
                if (event.target.value) {
                    sessionStorage.username = event.target.value;
                    loginDiv.remove();
                    resolve();
                } else {
                    container.querySelector(".alertText").appendChild(document.createTextNode("Please enter a username!"));
                }
            }
        });
    });
}

function connect(container) {
    return new Promise(function(resolve, reject) {
        socket = new WebSocket(config.adress);
        socket.addEventListener("open", function() {
            resolve();
        });

        socket.addEventListener("error", function() {
            //TODO Denna koden bör testas
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
        username: sessionStorage.username,
        channel: "",
        key: config.key
    };
    socket.send(JSON.stringify(data));
}

function launch(container) {
    login(container).then(function() {
        connect(container).then(function() {
            printOperationsScreen(container);
            container.querySelector(".textArea").addEventListener("keypress", function(event) {
                if (event.keyCode === 13) {
                    send(event.target.value);
                    event.target.value = "";
                    event.preventDefault();
                }
            });
        });
    });

    container.querySelector(".closeWindowButton").addEventListener("click", function() {
        socket.close();
    });
}

module.exports.launch = launch;

},{}],3:[function(require,module,exports){
function launch(container) {
    debugger;
    var rows = 4;
    var cols = 4;
    var a;
    var tiles;
    var templateDiv;
    var turn1;
    var turn2;
    var lastTile;
    var pairs = 0;
    var tries = 0;

    tiles = getPictureArray(rows, cols);

    templateDiv = document.querySelectorAll("#memoryGameTemplate")[0].content.firstElementChild;

    var div = document.importNode(templateDiv, false);

    tiles.forEach(function(tile, index) {
        a = document.importNode(templateDiv.firstElementChild, true);

        a.firstElementChild.setAttribute("data-bricknumber", index);

        div.appendChild(a);

        if ((index + 1) % cols === 0) {
            div.appendChild(document.createElement("br"));
        }
    });

    div.addEventListener("click", function(event) {
        event.preventDefault();
        var img = event.target.nodeName === "IMG" ? event.target : event.target.firstElementChild;

        var index = parseInt(img.getAttribute("data-bricknumber"));
        turnBrick(tiles[index], index, img);
    });

    container.appendChild(div);

    function turnBrick(tile, index, img) {
        if (turn2) {return;}

        img.src = "image/" + tile + ".png";

        if (!turn1) {
            turn1 = img;
            lastTile = tile;
        } else {
            if (img === turn1) {return;}

            tries += 1;

            turn2 = img;
            if (tile === lastTile) {
                pairs += 1;

                if (pairs === (cols * rows) / 2) {
                    console.log("Won on " + tries + "tries");
                }

                setTimeout(function(){
                    turn1.parentNode.classList.add("remove");
                    turn2.parentNode.classList.add("remove");

                    turn1 = null;
                    turn2 = null;
                }, 100);
            } else {
                setTimeout(function(){
                    turn1.src = "image/0.png";
                    turn2.src = "image/0.png";
                    turn1 = null;
                    turn2 = null;
                }, 500);
            }
        }
    }

    function getPictureArray(rows, cols) {
        var arr = [];
        var temp;
        var i;

        for (i = 1; i <= (rows * cols) / 2; i += 1) {
            arr.push(i);
            arr.push(i);
        }

        for (i = arr.length - 1; i > 0; i -= 1) {
            var randomNumber = Math.floor(Math.random() * i);
            temp = arr[i];
            arr[i] = arr[randomNumber];
            arr[randomNumber] = temp;
        }

        return arr;
    }
}

module.exports.launch = launch;

},{}],4:[function(require,module,exports){
function start(container) {
    var text = document.createTextNode("This is new testApp!");
    container.appendChild(text);
}

module.exports.start = start;

},{}],5:[function(require,module,exports){
module.exports=[
    {"id": "testApp", "img": "../image/testApp.png", "backgroundColor": "indianred"},
    {"id": "instaChat", "img": "../image/instaChat.png", "backgroundColor": "yellowgreen"},
    {"id": "memoryGame", "img": "../image/testApp.png", "backgroundColor": "lightblue"}
]


},{}],6:[function(require,module,exports){
"use strict";

var dock = document.querySelector("#dock");
var buttons = [];
var launcher = require("./launcher");

var applications = require("./applicationsList");

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
        launcher.launcher(app);
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

},{"./applicationsList":5,"./launcher":7}],7:[function(require,module,exports){
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

    this.memoryGame = function(container) {
        var app = require("./applications/memoryGame/app");
        app.launch(container);
    };

    this.error = function(container, err) {
        var text = document.createTextNode(err);
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


},{"./applications/instaChat/app":2,"./applications/memoryGame/app":3,"./applications/testApp/app":4,"./window":8}],8:[function(require,module,exports){
"use strict";

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvdGVzdEFwcC9hcHAuanMiLCJjbGllbnQvc291cmNlL2pzL2FwcGxpY2F0aW9uc0xpc3QuanNvbiIsImNsaWVudC9zb3VyY2UvanMvZG9jay5qcyIsImNsaWVudC9zb3VyY2UvanMvbGF1bmNoZXIuanMiLCJjbGllbnQvc291cmNlL2pzL3dpbmRvdy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZG9jayA9IHJlcXVpcmUoXCIuL2RvY2tcIik7XG5kb2NrLmluaXQoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgc29ja2V0ID0gbnVsbDtcbnZhciBjb25maWcgPSB7XG4gICAgYWRyZXNzOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXG4gICAga2V5OiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcbn07XG5cbmZ1bmN0aW9uIHByaW50TG9naW5TY3JlZW4oY29udGFpbmVyKSB7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdExvZ2luVGVtcGxhdGVcIik7XG4gICAgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUpO1xufVxuXG5mdW5jdGlvbiBwcmludE9wZXJhdGlvbnNTY3JlZW4oY29udGFpbmVyKSB7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdFRlbXBsYXRlXCIpO1xuICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub2RlKTtcbn1cblxuZnVuY3Rpb24gcHJpbnRNZXNzYWdlKGNvbnRhaW5lciwgbWVzc2FnZSkge1xuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB2YXIgZnJhZ21lbnQ7XG4gICAgdmFyIG1lc3NhZ2VFbGVtZW50O1xuICAgIHZhciB1c2VybmFtZUVsZW1lbnQ7XG4gICAgdmFyIGNoYXRCb3ggPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jaGF0Qm94XCIpO1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoKTtcbiAgICB2YXIgdGltZSA9IGRhdGUuZ2V0SG91cnMoKSArIFwiOlwiICsgZGF0ZS5nZXRNaW51dGVzKCk7XG5cbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVRlbXBsYXRlXCIpO1xuICAgIGZyYWdtZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcblxuICAgIHVzZXJuYW1lRWxlbWVudCA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudXNlcm5hbWVcIik7XG4gICAgbWVzc2FnZUVsZW1lbnQgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VcIik7XG5cbiAgICBpZiAobWVzc2FnZS51c2VybmFtZSA9PT0gc2Vzc2lvblN0b3JhZ2UudXNlcm5hbWUpIHtcbiAgICAgICAgbWVzc2FnZS51c2VybmFtZSA9IFwiWW91XCI7XG4gICAgICAgIHVzZXJuYW1lRWxlbWVudC5jbGFzc05hbWUgKz0gXCIgdXNlcm5hbWVTZW50XCI7XG4gICAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTmFtZSArPSBcIiBtZXNzYWdlU2VudFwiO1xuICAgIH1cblxuICAgIHVzZXJuYW1lRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlLnVzZXJuYW1lICsgXCIgXCIgKyB0aW1lKSk7XG4gICAgbWVzc2FnZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZS5kYXRhKSk7XG5cbiAgICBjaGF0Qm94LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbn1cblxuZnVuY3Rpb24gbG9naW4oY29udGFpbmVyKSB7XG4gICAgcHJpbnRMb2dpblNjcmVlbihjb250YWluZXIpO1xuICAgIHZhciBsb2dpbkRpdiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmluc3RhQ2hhdExvZ2luXCIpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG5cbiAgICAgICAgaWYoc2Vzc2lvblN0b3JhZ2UudXNlcm5hbWUpIHtcbiAgICAgICAgICAgIGxvZ2luRGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9naW5EaXYuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBsb2dpbkRpdi5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmFsZXJ0VGV4dFwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlBsZWFzZSBlbnRlciBhIHVzZXJuYW1lIVwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY29ubmVjdChjb250YWluZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoY29uZmlnLmFkcmVzcyk7XG4gICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vVE9ETyBEZW5uYSBrb2RlbiBiw7ZyIHRlc3Rhc1xuICAgICAgICAgICAgcmVqZWN0KFwiRGV0IGdpY2sgZmVsXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcblxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcbiAgICAgICAgICAgICAgICBwcmludE1lc3NhZ2UoY29udGFpbmVyLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNlbmQodGV4dCkge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgZGF0YTogdGV4dCxcbiAgICAgICAgdXNlcm5hbWU6IHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lLFxuICAgICAgICBjaGFubmVsOiBcIlwiLFxuICAgICAgICBrZXk6IGNvbmZpZy5rZXlcbiAgICB9O1xuICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbn1cblxuZnVuY3Rpb24gbGF1bmNoKGNvbnRhaW5lcikge1xuICAgIGxvZ2luKGNvbnRhaW5lcikudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgY29ubmVjdChjb250YWluZXIpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwcmludE9wZXJhdGlvbnNTY3JlZW4oY29udGFpbmVyKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLnRleHRBcmVhXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICBzZW5kKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VXaW5kb3dCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoID0gbGF1bmNoO1xuIiwiZnVuY3Rpb24gbGF1bmNoKGNvbnRhaW5lcikge1xuICAgIGRlYnVnZ2VyO1xuICAgIHZhciByb3dzID0gNDtcbiAgICB2YXIgY29scyA9IDQ7XG4gICAgdmFyIGE7XG4gICAgdmFyIHRpbGVzO1xuICAgIHZhciB0ZW1wbGF0ZURpdjtcbiAgICB2YXIgdHVybjE7XG4gICAgdmFyIHR1cm4yO1xuICAgIHZhciBsYXN0VGlsZTtcbiAgICB2YXIgcGFpcnMgPSAwO1xuICAgIHZhciB0cmllcyA9IDA7XG5cbiAgICB0aWxlcyA9IGdldFBpY3R1cmVBcnJheShyb3dzLCBjb2xzKTtcblxuICAgIHRlbXBsYXRlRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIiNtZW1vcnlHYW1lVGVtcGxhdGVcIilbMF0uY29udGVudC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LCBmYWxzZSk7XG5cbiAgICB0aWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHRpbGUsIGluZGV4KSB7XG4gICAgICAgIGEgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlRGl2LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICBhLmZpcnN0RWxlbWVudENoaWxkLnNldEF0dHJpYnV0ZShcImRhdGEtYnJpY2tudW1iZXJcIiwgaW5kZXgpO1xuXG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgICAgICBpZiAoKGluZGV4ICsgMSkgJSBjb2xzID09PSAwKSB7XG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJyXCIpKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB2YXIgaW1nID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSBcIklNR1wiID8gZXZlbnQudGFyZ2V0IDogZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgIHZhciBpbmRleCA9IHBhcnNlSW50KGltZy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWJyaWNrbnVtYmVyXCIpKTtcbiAgICAgICAgdHVybkJyaWNrKHRpbGVzW2luZGV4XSwgaW5kZXgsIGltZyk7XG4gICAgfSk7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgIGZ1bmN0aW9uIHR1cm5Ccmljayh0aWxlLCBpbmRleCwgaW1nKSB7XG4gICAgICAgIGlmICh0dXJuMikge3JldHVybjt9XG5cbiAgICAgICAgaW1nLnNyYyA9IFwiaW1hZ2UvXCIgKyB0aWxlICsgXCIucG5nXCI7XG5cbiAgICAgICAgaWYgKCF0dXJuMSkge1xuICAgICAgICAgICAgdHVybjEgPSBpbWc7XG4gICAgICAgICAgICBsYXN0VGlsZSA9IHRpbGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW1nID09PSB0dXJuMSkge3JldHVybjt9XG5cbiAgICAgICAgICAgIHRyaWVzICs9IDE7XG5cbiAgICAgICAgICAgIHR1cm4yID0gaW1nO1xuICAgICAgICAgICAgaWYgKHRpbGUgPT09IGxhc3RUaWxlKSB7XG4gICAgICAgICAgICAgICAgcGFpcnMgKz0gMTtcblxuICAgICAgICAgICAgICAgIGlmIChwYWlycyA9PT0gKGNvbHMgKiByb3dzKSAvIDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJXb24gb24gXCIgKyB0cmllcyArIFwidHJpZXNcIik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJyZW1vdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcInJlbW92ZVwiKTtcblxuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnNyYyA9IFwiaW1hZ2UvMC5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIuc3JjID0gXCJpbWFnZS8wLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0UGljdHVyZUFycmF5KHJvd3MsIGNvbHMpIHtcbiAgICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgICB2YXIgdGVtcDtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgZm9yIChpID0gMTsgaSA8PSAocm93cyAqIGNvbHMpIC8gMjsgaSArPSAxKSB7XG4gICAgICAgICAgICBhcnIucHVzaChpKTtcbiAgICAgICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gYXJyLmxlbmd0aCAtIDE7IGkgPiAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgIHZhciByYW5kb21OdW1iZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKTtcbiAgICAgICAgICAgIHRlbXAgPSBhcnJbaV07XG4gICAgICAgICAgICBhcnJbaV0gPSBhcnJbcmFuZG9tTnVtYmVyXTtcbiAgICAgICAgICAgIGFycltyYW5kb21OdW1iZXJdID0gdGVtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBsYXVuY2g7XG4iLCJmdW5jdGlvbiBzdGFydChjb250YWluZXIpIHtcbiAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiVGhpcyBpcyBuZXcgdGVzdEFwcCFcIik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRleHQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5zdGFydCA9IHN0YXJ0O1xuIiwibW9kdWxlLmV4cG9ydHM9W1xuICAgIHtcImlkXCI6IFwidGVzdEFwcFwiLCBcImltZ1wiOiBcIi4uL2ltYWdlL3Rlc3RBcHAucG5nXCIsIFwiYmFja2dyb3VuZENvbG9yXCI6IFwiaW5kaWFucmVkXCJ9LFxuICAgIHtcImlkXCI6IFwiaW5zdGFDaGF0XCIsIFwiaW1nXCI6IFwiLi4vaW1hZ2UvaW5zdGFDaGF0LnBuZ1wiLCBcImJhY2tncm91bmRDb2xvclwiOiBcInllbGxvd2dyZWVuXCJ9LFxuICAgIHtcImlkXCI6IFwibWVtb3J5R2FtZVwiLCBcImltZ1wiOiBcIi4uL2ltYWdlL3Rlc3RBcHAucG5nXCIsIFwiYmFja2dyb3VuZENvbG9yXCI6IFwibGlnaHRibHVlXCJ9XG5dXG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZG9jayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKTtcbnZhciBidXR0b25zID0gW107XG52YXIgbGF1bmNoZXIgPSByZXF1aXJlKFwiLi9sYXVuY2hlclwiKTtcblxudmFyIGFwcGxpY2F0aW9ucyA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9uc0xpc3RcIik7XG5cbmZ1bmN0aW9uIGNlbnRyYWxpemUoKSB7XG4gICAgdmFyIHdpZHRoID0gZG9jay5vZmZzZXRXaWR0aDtcbiAgICBkb2NrLnN0eWxlLm1hcmdpbkxlZnQgPSAod2lkdGggLyAyKSAqIC0xO1xufVxuXG5mdW5jdGlvbiBkb2NrSGlkZVNob3coKSB7XG4gICAgdmFyIGk7XG5cbiAgICBkb2NrLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCI2MHB4XCI7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRvY2suYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBkb2NrLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRCdXR0b24oYXBwKSB7XG4gICAgZG9jay5zdHlsZS53aWR0aCA9IGRvY2sub2Zmc2V0V2lkdGggKyA0NTtcbiAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBidXR0b24uY2xhc3NOYW1lID0gXCJhcHBCdXR0b25cIjtcbiAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYXBwLmJhY2tncm91bmRDb2xvcjtcbiAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXCIgKyBhcHAuaW1nICsgXCIpXCI7XG4gICAgZG9jay5hcHBlbmRDaGlsZChidXR0b24pO1xuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgbGF1bmNoZXIubGF1bmNoZXIoYXBwKTtcbiAgICB9KTtcblxuICAgIGJ1dHRvbnMucHVzaChidXR0b24pO1xufVxuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIHZhciBpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhcHBsaWNhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYWRkQnV0dG9uKGFwcGxpY2F0aW9uc1tpXSk7XG4gICAgfVxuXG4gICAgY2VudHJhbGl6ZSgpO1xuICAgIGRvY2tIaWRlU2hvdygpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gaW5pdDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgcHdkV2luZG93ID0gcmVxdWlyZShcIi4vd2luZG93XCIpO1xuXG5mdW5jdGlvbiBBcHBsaWNhdGlvbnMoKSB7XG4gICAgdGhpcy50ZXN0QXBwID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvdGVzdEFwcC9hcHBcIik7XG4gICAgICAgIGFwcC5zdGFydChjb250YWluZXIpO1xuICAgIH07XG5cbiAgICB0aGlzLmluc3RhQ2hhdCA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuXG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcFwiKTtcbiAgICAgICAgYXBwLmxhdW5jaChjb250YWluZXIpO1xuICAgIH07XG5cbiAgICB0aGlzLm1lbW9yeUdhbWUgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9tZW1vcnlHYW1lL2FwcFwiKTtcbiAgICAgICAgYXBwLmxhdW5jaChjb250YWluZXIpO1xuICAgIH07XG5cbiAgICB0aGlzLmVycm9yID0gZnVuY3Rpb24oY29udGFpbmVyLCBlcnIpIHtcbiAgICAgICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShlcnIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dCk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gbGF1bmNoZXIoYXBwKSB7XG4gICAgdmFyIGNvbnRhaW5lcjtcbiAgICB2YXIgYXBwbGljYXRpb25zO1xuXG4gICAgY29udGFpbmVyID0gcHdkV2luZG93LmNyZWF0ZVdpbmRvdyhhcHApO1xuICAgIGFwcGxpY2F0aW9ucyA9IG5ldyBBcHBsaWNhdGlvbnMoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGFwcGxpY2F0aW9uc1thcHAuaWRdKGNvbnRhaW5lcik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGFwcGxpY2F0aW9ucy5lcnJvcihjb250YWluZXIsIGVycik7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2hlciA9IGxhdW5jaGVyO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGxhc3RJbmRleCA9IDA7XG52YXIgb2Zmc2V0WCA9IDA7XG52YXIgb2Zmc2V0WSA9IDA7XG52YXIgcG9zaXRpb25YID0gMDtcbnZhciBwb3NpdGlvblkgPSAwO1xudmFyIGVsZW1lbnQ7XG5cbmZ1bmN0aW9uIGdyYWJFbGVtZW50KHRhcmdldCkge1xuICAgIGVsZW1lbnQgPSB0YXJnZXQ7XG4gICAgb2Zmc2V0WCA9IHBvc2l0aW9uWCAtIGVsZW1lbnQub2Zmc2V0TGVmdDtcbiAgICBvZmZzZXRZID0gcG9zaXRpb25ZIC0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgbGFzdEluZGV4ICs9IDE7XG4gICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG59XG5cbmZ1bmN0aW9uIG1vdmVFbGVtZW50KGV2ZW50KSB7XG4gICAgcG9zaXRpb25YID0gZXZlbnQuY2xpZW50WDtcbiAgICBwb3NpdGlvblkgPSBldmVudC5jbGllbnRZO1xuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IHBvc2l0aW9uWCAtIChvZmZzZXRYICsgMikgKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gcG9zaXRpb25ZIC0gKG9mZnNldFkgKyAyKSArIFwicHhcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbGVhc2VFbGVtZW50KCkge1xuICAgIGVsZW1lbnQgPSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGFkZFRlbXBsYXRlKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgIHZhciBjb250YWluZXI7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJOYW1lKTtcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGVtcGxhdGVOYW1lKTtcbiAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdpbmRvdyhhcHApIHtcbiAgICB2YXIgdG9wYmFyO1xuICAgIHZhciBhcHBXaW5kb3c7XG5cbiAgICBhZGRUZW1wbGF0ZShcIiNhcHBXaW5kb3dUZW1wbGF0ZVwiLCBcImJvZHlcIik7XG5cbiAgICBhcHBXaW5kb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKVtkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKS5sZW5ndGggLSAxXTtcbiAgICB0b3BiYXIgPSBhcHBXaW5kb3cucXVlcnlTZWxlY3RvcihcIi50b3BiYXJcIik7XG5cbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBhcHBXaW5kb3cuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xuXG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuYXBwSWNvblwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgYXBwLmltZyk7XG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuYXBwVGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwLmlkKSk7XG5cbiAgICBhcHBXaW5kb3cuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYXBwLmJhY2tncm91bmRDb2xvcjtcblxuICAgIHRvcGJhci5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBncmFiRWxlbWVudChhcHBXaW5kb3cpO1xuICAgIH0pO1xuXG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZUVsZW1lbnQpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHJlbGVhc2VFbGVtZW50KTtcblxuICAgIGFwcFdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGxhc3RJbmRleCArPSAxO1xuICAgICAgICBhcHBXaW5kb3cuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xuICAgIH0pO1xuXG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VXaW5kb3dCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhcHBXaW5kb3cucmVtb3ZlKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXBwV2luZG93O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVXaW5kb3cgPSBjcmVhdGVXaW5kb3c7XG4iXX0=
