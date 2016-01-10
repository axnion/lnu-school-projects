(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var dock = require("./dock");
dock.init();

},{"./dock":6}],2:[function(require,module,exports){
//TODO Lägg till loged in as.

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

    //TODO Lägg till en reject!
    return new Promise(function(resolve) {

        if (sessionStorage.username) {
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
            container.querySelector(".closeWindowButton").addEventListener("click", function() {
                socket.close();
            });
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
}

module.exports.launch = launch;

},{}],3:[function(require,module,exports){
var nickname;
var turn1;
var turn2;
var lastTile;
var pairs = 0;
var tries = 0;

function printStartScreen(container) {
    var template;
    var div;
    var i = 0;
    var boardSize;

    template = document.querySelector("#memoryGameStartTemplate");
    div = document.importNode(template.content.firstElementChild, true);

    container.appendChild(div);

    //TODO Lägg till en reject!
    return new Promise (function(resolve) {
        for (i = 0; i < 3; i += 1) {
            div.children[i].addEventListener("click", function(event) {
                event.preventDefault();
                boardSize = this.firstChild.lastChild.nodeValue;
                div.remove();
                resolve(boardSize);
            });
        }
    });
}

function getBricksArray(rows, cols) {
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

function gameLogic(tile, img, rows, cols, container) {
    if (turn2) {return;}
    if (img.getAttribute("data-bricknumber") === "-1") {return;}

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
                container.querySelector(".memoryGameBoard").remove();
                printHighScoreScreen(rows, cols, container);
            }

            setTimeout(function() {
                turn1.parentNode.classList.add("remove");
                turn2.parentNode.classList.add("remove");

                turn1.setAttribute("data-bricknumber", "-1");
                turn2.setAttribute("data-bricknumber", "-1");

                turn1 = null;
                turn2 = null;
            }, 100);
        } else {
            setTimeout(function() {
                turn1.src = "image/0.png";
                turn2.src = "image/0.png";
                turn1 = null;
                turn2 = null;
            }, 500);
        }
    }
}

function addGameMechanics(gameBoard, tiles, rows, cols, container) {
    gameBoard.addEventListener("click", function(event) {
        var img;
        var index;
        event.preventDefault();

        img = event.target.nodeName === "IMG" ? event.target : event.target.firstElementChild;
        index = parseInt(img.getAttribute("data-bricknumber"));
        gameLogic(tiles[index], img, rows, cols, container);
    });
}

function printHighScoreScreen(rows, cols, container) {
    var storageName = "memory" + rows + "x" + cols;
    var template;
    var gameEndDiv;
    var highScore;

    highScore = JSON.parse(localStorage.getItem(storageName));

    template = document.querySelector("#memoryGameEndTemplate");
    gameEndDiv = document.importNode(template.content.firstElementChild, true);

    gameEndDiv.querySelector(".saveHighscoreForm").addEventListener("submit", function(event) {
        event.preventDefault();
        saveHighScore(gameEndDiv.querySelectorAll("input")[0].value);
        gameEndDiv.querySelector(".saveHighscoreForm").remove();
        printHighScore();
    });

    printHighScore();

    container.appendChild(gameEndDiv);

    function printHighScore() {
        highScore = JSON.parse(localStorage.getItem(storageName));
        var oldScore = container.querySelector(".highScore");
        if (oldScore) {
            oldScore.remove();
        }

        if (highScore) {
            var i;
            var score;
            template = gameEndDiv.querySelector("#highScoreTempate");
            var scoreBoard = document.importNode(template.content.firstElementChild, true);

            for (i = 0; i < highScore.length; i += 1) {
                score = document.createTextNode("Nickname: " + highScore[i].nickname + " | Tries: " + highScore[i].tries);
                scoreBoard.children[i].appendChild(score);
            }

            gameEndDiv.appendChild(scoreBoard);

        } else {
            template = gameEndDiv.querySelector("#noHighScoreTempate");
            gameEndDiv.appendChild(document.importNode(template.content.firstElementChild, true));
        }
    }

    function saveHighScore(nickname) {
        if (highScore) {
            highScore.push({nickname: nickname, tries: tries});
            highScore.sort(function(a, b) {
                return Number(a.tries) - Number(b.tries);
            });

            highScore.splice(5, 1);

            localStorage.setItem(storageName, JSON.stringify(highScore));
        } else {
            highScore = [
                {nickname: nickname, tries: tries}
            ];

            localStorage.setItem(storageName, JSON.stringify(highScore));
        }
    }
}

function printGameScreen(cols, tiles) {
    var template;
    var templateContent;
    var div;

    template = document.querySelector("#memoryGameTemplate");
    templateContent = template.content.firstElementChild;
    div = document.importNode(templateContent, false);

    tiles.forEach(function(tile, index) {
        var a;

        a = document.importNode(templateContent.firstElementChild, true);
        a.firstElementChild.setAttribute("data-bricknumber", index);
        div.appendChild(a);

        if ((index + 1) % cols === 0) {
            div.appendChild(document.createElement("br"));
        }
    });

    return div;
}

function playGame(rows, cols, container) {
    var tiles = getBricksArray(rows, cols);
    var gameBoard = printGameScreen(cols, tiles);
    addGameMechanics(gameBoard, tiles, rows, cols, container);
    container.appendChild(gameBoard);
}

function launch(container) {
    printStartScreen(container).then(function(boardSize) {
        var size;
        size = boardSize.split("x");
        playGame(parseInt(size[0]), parseInt(size[1]), container);
    });
}

module.exports.launch = launch;

},{}],4:[function(require,module,exports){
//TODO Spara settings i localstorage.
//TODO Hide taskbar

function launch(container) {
    var text = document.createTextNode("This is the settings. We are not home right now but leave a message");
    container.appendChild(text);
}

module.exports.launch = launch;

},{}],5:[function(require,module,exports){
module.exports=[
    {"id": "instaChat", "img": "../image/instaChat.png", "backgroundColor": "yellowgreen"},
    {"id": "memoryGame", "img": "../image/testApp.png", "backgroundColor": "lightblue"},
    {"id": "settings", "img": "../image/settings.png", "backgroundColor": "yellow"}
]


},{}],6:[function(require,module,exports){
"use strict";

//TODO Försök rensa upp så mkt html och css från javascriptkoden.

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


},{"./applications/instaChat/app":2,"./applications/memoryGame/app":3,"./applications/settings/app":4,"./window":8}],8:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvc2V0dGluZ3MvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnNMaXN0Lmpzb24iLCJjbGllbnQvc291cmNlL2pzL2RvY2suanMiLCJjbGllbnQvc291cmNlL2pzL2xhdW5jaGVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy93aW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBkb2NrID0gcmVxdWlyZShcIi4vZG9ja1wiKTtcbmRvY2suaW5pdCgpO1xuIiwiLy9UT0RPIEzDpGdnIHRpbGwgbG9nZWQgaW4gYXMuXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgc29ja2V0ID0gbnVsbDtcbnZhciBjb25maWcgPSB7XG4gICAgYWRyZXNzOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXG4gICAga2V5OiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCJcbn07XG5cbmZ1bmN0aW9uIHByaW50TG9naW5TY3JlZW4oY29udGFpbmVyKSB7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdExvZ2luVGVtcGxhdGVcIik7XG4gICAgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUpO1xufVxuXG5mdW5jdGlvbiBwcmludE9wZXJhdGlvbnNTY3JlZW4oY29udGFpbmVyKSB7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdFRlbXBsYXRlXCIpO1xuICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub2RlKTtcbn1cblxuZnVuY3Rpb24gcHJpbnRNZXNzYWdlKGNvbnRhaW5lciwgbWVzc2FnZSkge1xuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB2YXIgZnJhZ21lbnQ7XG4gICAgdmFyIG1lc3NhZ2VFbGVtZW50O1xuICAgIHZhciB1c2VybmFtZUVsZW1lbnQ7XG4gICAgdmFyIGNoYXRCb3ggPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jaGF0Qm94XCIpO1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoKTtcbiAgICB2YXIgdGltZSA9IGRhdGUuZ2V0SG91cnMoKSArIFwiOlwiICsgZGF0ZS5nZXRNaW51dGVzKCk7XG5cbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVRlbXBsYXRlXCIpO1xuICAgIGZyYWdtZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcblxuICAgIHVzZXJuYW1lRWxlbWVudCA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudXNlcm5hbWVcIik7XG4gICAgbWVzc2FnZUVsZW1lbnQgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VcIik7XG5cbiAgICBpZiAobWVzc2FnZS51c2VybmFtZSA9PT0gc2Vzc2lvblN0b3JhZ2UudXNlcm5hbWUpIHtcbiAgICAgICAgbWVzc2FnZS51c2VybmFtZSA9IFwiWW91XCI7XG4gICAgICAgIHVzZXJuYW1lRWxlbWVudC5jbGFzc05hbWUgKz0gXCIgdXNlcm5hbWVTZW50XCI7XG4gICAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTmFtZSArPSBcIiBtZXNzYWdlU2VudFwiO1xuICAgIH1cblxuICAgIHVzZXJuYW1lRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlLnVzZXJuYW1lICsgXCIgXCIgKyB0aW1lKSk7XG4gICAgbWVzc2FnZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZS5kYXRhKSk7XG5cbiAgICBjaGF0Qm94LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbn1cblxuZnVuY3Rpb24gbG9naW4oY29udGFpbmVyKSB7XG4gICAgcHJpbnRMb2dpblNjcmVlbihjb250YWluZXIpO1xuICAgIHZhciBsb2dpbkRpdiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmluc3RhQ2hhdExvZ2luXCIpO1xuXG4gICAgLy9UT0RPIEzDpGdnIHRpbGwgZW4gcmVqZWN0IVxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG5cbiAgICAgICAgaWYgKHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lKSB7XG4gICAgICAgICAgICBsb2dpbkRpdi5yZW1vdmUoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ2luRGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS51c2VybmFtZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgbG9naW5EaXYucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5hbGVydFRleHRcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJQbGVhc2UgZW50ZXIgYSB1c2VybmFtZSFcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNvbm5lY3QoY29udGFpbmVyKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5hZHJlc3MpO1xuICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jbG9zZVdpbmRvd0J1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vVE9ETyBEZW5uYSBrb2RlbiBiw7ZyIHRlc3Rhc1xuICAgICAgICAgICAgcmVqZWN0KFwiRGV0IGdpY2sgZmVsXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcblxuICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcbiAgICAgICAgICAgICAgICBwcmludE1lc3NhZ2UoY29udGFpbmVyLCBtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNlbmQodGV4dCkge1xuICAgIHZhciBkYXRhID0ge1xuICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgZGF0YTogdGV4dCxcbiAgICAgICAgdXNlcm5hbWU6IHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lLFxuICAgICAgICBjaGFubmVsOiBcIlwiLFxuICAgICAgICBrZXk6IGNvbmZpZy5rZXlcbiAgICB9O1xuICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbn1cblxuZnVuY3Rpb24gbGF1bmNoKGNvbnRhaW5lcikge1xuICAgIGxvZ2luKGNvbnRhaW5lcikudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgY29ubmVjdChjb250YWluZXIpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwcmludE9wZXJhdGlvbnNTY3JlZW4oY29udGFpbmVyKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLnRleHRBcmVhXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICBzZW5kKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBsYXVuY2g7XG4iLCJ2YXIgbmlja25hbWU7XG52YXIgdHVybjE7XG52YXIgdHVybjI7XG52YXIgbGFzdFRpbGU7XG52YXIgcGFpcnMgPSAwO1xudmFyIHRyaWVzID0gMDtcblxuZnVuY3Rpb24gcHJpbnRTdGFydFNjcmVlbihjb250YWluZXIpIHtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIGRpdjtcbiAgICB2YXIgaSA9IDA7XG4gICAgdmFyIGJvYXJkU2l6ZTtcblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlHYW1lU3RhcnRUZW1wbGF0ZVwiKTtcbiAgICBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICAvL1RPRE8gTMOkZ2cgdGlsbCBlbiByZWplY3QhXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlIChmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCAzOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGRpdi5jaGlsZHJlbltpXS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIGJvYXJkU2l6ZSA9IHRoaXMuZmlyc3RDaGlsZC5sYXN0Q2hpbGQubm9kZVZhbHVlO1xuICAgICAgICAgICAgICAgIGRpdi5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKGJvYXJkU2l6ZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBnZXRCcmlja3NBcnJheShyb3dzLCBjb2xzKSB7XG4gICAgdmFyIGFyciA9IFtdO1xuICAgIHZhciB0ZW1wO1xuICAgIHZhciBpO1xuXG4gICAgZm9yIChpID0gMTsgaSA8PSAocm93cyAqIGNvbHMpIC8gMjsgaSArPSAxKSB7XG4gICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgICBhcnIucHVzaChpKTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSBhcnIubGVuZ3RoIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICB2YXIgcmFuZG9tTnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSk7XG4gICAgICAgIHRlbXAgPSBhcnJbaV07XG4gICAgICAgIGFycltpXSA9IGFycltyYW5kb21OdW1iZXJdO1xuICAgICAgICBhcnJbcmFuZG9tTnVtYmVyXSA9IHRlbXA7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn1cblxuZnVuY3Rpb24gZ2FtZUxvZ2ljKHRpbGUsIGltZywgcm93cywgY29scywgY29udGFpbmVyKSB7XG4gICAgaWYgKHR1cm4yKSB7cmV0dXJuO31cbiAgICBpZiAoaW1nLmdldEF0dHJpYnV0ZShcImRhdGEtYnJpY2tudW1iZXJcIikgPT09IFwiLTFcIikge3JldHVybjt9XG5cbiAgICBpbWcuc3JjID0gXCJpbWFnZS9cIiArIHRpbGUgKyBcIi5wbmdcIjtcblxuICAgIGlmICghdHVybjEpIHtcbiAgICAgICAgdHVybjEgPSBpbWc7XG4gICAgICAgIGxhc3RUaWxlID0gdGlsZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoaW1nID09PSB0dXJuMSkge3JldHVybjt9XG5cbiAgICAgICAgdHJpZXMgKz0gMTtcblxuICAgICAgICB0dXJuMiA9IGltZztcbiAgICAgICAgaWYgKHRpbGUgPT09IGxhc3RUaWxlKSB7XG4gICAgICAgICAgICBwYWlycyArPSAxO1xuICAgICAgICAgICAgaWYgKHBhaXJzID09PSAoY29scyAqIHJvd3MpIC8gMikge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLm1lbW9yeUdhbWVCb2FyZFwiKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICBwcmludEhpZ2hTY29yZVNjcmVlbihyb3dzLCBjb2xzLCBjb250YWluZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHR1cm4xLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcInJlbW92ZVwiKTtcbiAgICAgICAgICAgICAgICB0dXJuMi5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJyZW1vdmVcIik7XG5cbiAgICAgICAgICAgICAgICB0dXJuMS5zZXRBdHRyaWJ1dGUoXCJkYXRhLWJyaWNrbnVtYmVyXCIsIFwiLTFcIik7XG4gICAgICAgICAgICAgICAgdHVybjIuc2V0QXR0cmlidXRlKFwiZGF0YS1icmlja251bWJlclwiLCBcIi0xXCIpO1xuXG4gICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHR1cm4xLnNyYyA9IFwiaW1hZ2UvMC5wbmdcIjtcbiAgICAgICAgICAgICAgICB0dXJuMi5zcmMgPSBcImltYWdlLzAucG5nXCI7XG4gICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFkZEdhbWVNZWNoYW5pY3MoZ2FtZUJvYXJkLCB0aWxlcywgcm93cywgY29scywgY29udGFpbmVyKSB7XG4gICAgZ2FtZUJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICB2YXIgaW1nO1xuICAgICAgICB2YXIgaW5kZXg7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgaW1nID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSBcIklNR1wiID8gZXZlbnQudGFyZ2V0IDogZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuICAgICAgICBpbmRleCA9IHBhcnNlSW50KGltZy5nZXRBdHRyaWJ1dGUoXCJkYXRhLWJyaWNrbnVtYmVyXCIpKTtcbiAgICAgICAgZ2FtZUxvZ2ljKHRpbGVzW2luZGV4XSwgaW1nLCByb3dzLCBjb2xzLCBjb250YWluZXIpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBwcmludEhpZ2hTY29yZVNjcmVlbihyb3dzLCBjb2xzLCBjb250YWluZXIpIHtcbiAgICB2YXIgc3RvcmFnZU5hbWUgPSBcIm1lbW9yeVwiICsgcm93cyArIFwieFwiICsgY29scztcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIGdhbWVFbmREaXY7XG4gICAgdmFyIGhpZ2hTY29yZTtcblxuICAgIGhpZ2hTY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZU5hbWUpKTtcblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlHYW1lRW5kVGVtcGxhdGVcIik7XG4gICAgZ2FtZUVuZERpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuc2F2ZUhpZ2hzY29yZUZvcm1cIikuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzYXZlSGlnaFNjb3JlKGdhbWVFbmREaXYucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpWzBdLnZhbHVlKTtcbiAgICAgICAgZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiLnNhdmVIaWdoc2NvcmVGb3JtXCIpLnJlbW92ZSgpO1xuICAgICAgICBwcmludEhpZ2hTY29yZSgpO1xuICAgIH0pO1xuXG4gICAgcHJpbnRIaWdoU2NvcmUoKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChnYW1lRW5kRGl2KTtcblxuICAgIGZ1bmN0aW9uIHByaW50SGlnaFNjb3JlKCkge1xuICAgICAgICBoaWdoU2NvcmUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VOYW1lKSk7XG4gICAgICAgIHZhciBvbGRTY29yZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmhpZ2hTY29yZVwiKTtcbiAgICAgICAgaWYgKG9sZFNjb3JlKSB7XG4gICAgICAgICAgICBvbGRTY29yZS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoaWdoU2NvcmUpIHtcbiAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgdmFyIHNjb3JlO1xuICAgICAgICAgICAgdGVtcGxhdGUgPSBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIjaGlnaFNjb3JlVGVtcGF0ZVwiKTtcbiAgICAgICAgICAgIHZhciBzY29yZUJvYXJkID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGhpZ2hTY29yZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIHNjb3JlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJOaWNrbmFtZTogXCIgKyBoaWdoU2NvcmVbaV0ubmlja25hbWUgKyBcIiB8IFRyaWVzOiBcIiArIGhpZ2hTY29yZVtpXS50cmllcyk7XG4gICAgICAgICAgICAgICAgc2NvcmVCb2FyZC5jaGlsZHJlbltpXS5hcHBlbmRDaGlsZChzY29yZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGdhbWVFbmREaXYuYXBwZW5kQ2hpbGQoc2NvcmVCb2FyZCk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRlbXBsYXRlID0gZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiI25vSGlnaFNjb3JlVGVtcGF0ZVwiKTtcbiAgICAgICAgICAgIGdhbWVFbmREaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzYXZlSGlnaFNjb3JlKG5pY2tuYW1lKSB7XG4gICAgICAgIGlmIChoaWdoU2NvcmUpIHtcbiAgICAgICAgICAgIGhpZ2hTY29yZS5wdXNoKHtuaWNrbmFtZTogbmlja25hbWUsIHRyaWVzOiB0cmllc30pO1xuICAgICAgICAgICAgaGlnaFNjb3JlLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIoYS50cmllcykgLSBOdW1iZXIoYi50cmllcyk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaGlnaFNjb3JlLnNwbGljZSg1LCAxKTtcblxuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZU5hbWUsIEpTT04uc3RyaW5naWZ5KGhpZ2hTY29yZSkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaGlnaFNjb3JlID0gW1xuICAgICAgICAgICAgICAgIHtuaWNrbmFtZTogbmlja25hbWUsIHRyaWVzOiB0cmllc31cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VOYW1lLCBKU09OLnN0cmluZ2lmeShoaWdoU2NvcmUpKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcHJpbnRHYW1lU2NyZWVuKGNvbHMsIHRpbGVzKSB7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciB0ZW1wbGF0ZUNvbnRlbnQ7XG4gICAgdmFyIGRpdjtcblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlHYW1lVGVtcGxhdGVcIik7XG4gICAgdGVtcGxhdGVDb250ZW50ID0gdGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlQ29udGVudCwgZmFsc2UpO1xuXG4gICAgdGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlLCBpbmRleCkge1xuICAgICAgICB2YXIgYTtcblxuICAgICAgICBhID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZUNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgICAgICBhLmZpcnN0RWxlbWVudENoaWxkLnNldEF0dHJpYnV0ZShcImRhdGEtYnJpY2tudW1iZXJcIiwgaW5kZXgpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYSk7XG5cbiAgICAgICAgaWYgKChpbmRleCArIDEpICUgY29scyA9PT0gMCkge1xuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBkaXY7XG59XG5cbmZ1bmN0aW9uIHBsYXlHYW1lKHJvd3MsIGNvbHMsIGNvbnRhaW5lcikge1xuICAgIHZhciB0aWxlcyA9IGdldEJyaWNrc0FycmF5KHJvd3MsIGNvbHMpO1xuICAgIHZhciBnYW1lQm9hcmQgPSBwcmludEdhbWVTY3JlZW4oY29scywgdGlsZXMpO1xuICAgIGFkZEdhbWVNZWNoYW5pY3MoZ2FtZUJvYXJkLCB0aWxlcywgcm93cywgY29scywgY29udGFpbmVyKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ2FtZUJvYXJkKTtcbn1cblxuZnVuY3Rpb24gbGF1bmNoKGNvbnRhaW5lcikge1xuICAgIHByaW50U3RhcnRTY3JlZW4oY29udGFpbmVyKS50aGVuKGZ1bmN0aW9uKGJvYXJkU2l6ZSkge1xuICAgICAgICB2YXIgc2l6ZTtcbiAgICAgICAgc2l6ZSA9IGJvYXJkU2l6ZS5zcGxpdChcInhcIik7XG4gICAgICAgIHBsYXlHYW1lKHBhcnNlSW50KHNpemVbMF0pLCBwYXJzZUludChzaXplWzFdKSwgY29udGFpbmVyKTtcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoID0gbGF1bmNoO1xuIiwiLy9UT0RPIFNwYXJhIHNldHRpbmdzIGkgbG9jYWxzdG9yYWdlLlxuLy9UT0RPIEhpZGUgdGFza2JhclxuXG5mdW5jdGlvbiBsYXVuY2goY29udGFpbmVyKSB7XG4gICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlRoaXMgaXMgdGhlIHNldHRpbmdzLiBXZSBhcmUgbm90IGhvbWUgcmlnaHQgbm93IGJ1dCBsZWF2ZSBhIG1lc3NhZ2VcIik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRleHQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBsYXVuY2g7XG4iLCJtb2R1bGUuZXhwb3J0cz1bXG4gICAge1wiaWRcIjogXCJpbnN0YUNoYXRcIiwgXCJpbWdcIjogXCIuLi9pbWFnZS9pbnN0YUNoYXQucG5nXCIsIFwiYmFja2dyb3VuZENvbG9yXCI6IFwieWVsbG93Z3JlZW5cIn0sXG4gICAge1wiaWRcIjogXCJtZW1vcnlHYW1lXCIsIFwiaW1nXCI6IFwiLi4vaW1hZ2UvdGVzdEFwcC5wbmdcIiwgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCJsaWdodGJsdWVcIn0sXG4gICAge1wiaWRcIjogXCJzZXR0aW5nc1wiLCBcImltZ1wiOiBcIi4uL2ltYWdlL3NldHRpbmdzLnBuZ1wiLCBcImJhY2tncm91bmRDb2xvclwiOiBcInllbGxvd1wifVxuXVxuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy9UT0RPIEbDtnJzw7ZrIHJlbnNhIHVwcCBzw6UgbWt0IGh0bWwgb2NoIGNzcyBmcsOlbiBqYXZhc2NyaXB0a29kZW4uXG5cbnZhciBkb2NrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpO1xudmFyIGJ1dHRvbnMgPSBbXTtcbnZhciBsYXVuY2hlciA9IHJlcXVpcmUoXCIuL2xhdW5jaGVyXCIpO1xuXG52YXIgYXBwbGljYXRpb25zID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zTGlzdFwiKTtcblxuZnVuY3Rpb24gY2VudHJhbGl6ZSgpIHtcbiAgICB2YXIgd2lkdGggPSBkb2NrLm9mZnNldFdpZHRoO1xuICAgIGRvY2suc3R5bGUubWFyZ2luTGVmdCA9ICh3aWR0aCAvIDIpICogLTE7XG59XG5cbmZ1bmN0aW9uIGRvY2tIaWRlU2hvdygpIHtcbiAgICB2YXIgaTtcblxuICAgIGRvY2suYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZG9jay5zdHlsZS5oZWlnaHQgPSBcIjYwcHhcIjtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZG9jay5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjBweFwiO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZEJ1dHRvbihhcHApIHtcbiAgICBkb2NrLnN0eWxlLndpZHRoID0gZG9jay5vZmZzZXRXaWR0aCArIDQ1O1xuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBcImFwcEJ1dHRvblwiO1xuICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhcHAuYmFja2dyb3VuZENvbG9yO1xuICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIGFwcC5pbWcgKyBcIilcIjtcbiAgICBkb2NrLmFwcGVuZENoaWxkKGJ1dHRvbik7XG5cbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsYXVuY2hlci5sYXVuY2hlcihhcHApO1xuICAgIH0pO1xuXG4gICAgYnV0dG9ucy5wdXNoKGJ1dHRvbik7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIGk7XG4gICAgZm9yIChpID0gMDsgaSA8IGFwcGxpY2F0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhZGRCdXR0b24oYXBwbGljYXRpb25zW2ldKTtcbiAgICB9XG5cbiAgICBjZW50cmFsaXplKCk7XG4gICAgZG9ja0hpZGVTaG93KCk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmluaXQgPSBpbml0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBwd2RXaW5kb3cgPSByZXF1aXJlKFwiLi93aW5kb3dcIik7XG5cbmZ1bmN0aW9uIEFwcGxpY2F0aW9ucygpIHtcbiAgICB0aGlzLmluc3RhQ2hhdCA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgYXBwID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zL2luc3RhQ2hhdC9hcHBcIik7XG4gICAgICAgIGFwcC5sYXVuY2goY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgdGhpcy5tZW1vcnlHYW1lID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvbWVtb3J5R2FtZS9hcHBcIik7XG4gICAgICAgIGFwcC5sYXVuY2goY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgYXBwID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zL3NldHRpbmdzL2FwcFwiKTtcbiAgICAgICAgYXBwLmxhdW5jaChjb250YWluZXIpO1xuICAgIH07XG5cbiAgICB0aGlzLmVycm9yID0gZnVuY3Rpb24oY29udGFpbmVyLCBlcnIpIHtcbiAgICAgICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShlcnIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dCk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gbGF1bmNoZXIoYXBwKSB7XG4gICAgdmFyIGNvbnRhaW5lcjtcbiAgICB2YXIgYXBwbGljYXRpb25zO1xuXG4gICAgY29udGFpbmVyID0gcHdkV2luZG93LmNyZWF0ZVdpbmRvdyhhcHApO1xuICAgIGFwcGxpY2F0aW9ucyA9IG5ldyBBcHBsaWNhdGlvbnMoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGFwcGxpY2F0aW9uc1thcHAuaWRdKGNvbnRhaW5lcik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGFwcGxpY2F0aW9ucy5lcnJvcihjb250YWluZXIsIGVycik7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2hlciA9IGxhdW5jaGVyO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGxhc3RJbmRleCA9IDA7XG52YXIgb2Zmc2V0WCA9IDA7XG52YXIgb2Zmc2V0WSA9IDA7XG52YXIgcG9zaXRpb25YID0gMDtcbnZhciBwb3NpdGlvblkgPSAwO1xudmFyIGVsZW1lbnQ7XG5cbmZ1bmN0aW9uIGdyYWJFbGVtZW50KHRhcmdldCkge1xuICAgIGVsZW1lbnQgPSB0YXJnZXQ7XG4gICAgb2Zmc2V0WCA9IHBvc2l0aW9uWCAtIGVsZW1lbnQub2Zmc2V0TGVmdDtcbiAgICBvZmZzZXRZID0gcG9zaXRpb25ZIC0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgbGFzdEluZGV4ICs9IDE7XG4gICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG59XG5cbmZ1bmN0aW9uIG1vdmVFbGVtZW50KGV2ZW50KSB7XG4gICAgcG9zaXRpb25YID0gZXZlbnQuY2xpZW50WDtcbiAgICBwb3NpdGlvblkgPSBldmVudC5jbGllbnRZO1xuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IHBvc2l0aW9uWCAtIChvZmZzZXRYICsgMikgKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gcG9zaXRpb25ZIC0gKG9mZnNldFkgKyAyKSArIFwicHhcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbGVhc2VFbGVtZW50KCkge1xuICAgIGVsZW1lbnQgPSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGFkZFRlbXBsYXRlKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgIHZhciBjb250YWluZXI7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJOYW1lKTtcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGVtcGxhdGVOYW1lKTtcbiAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdpbmRvdyhhcHApIHtcbiAgICB2YXIgdG9wYmFyO1xuICAgIHZhciBhcHBXaW5kb3c7XG5cbiAgICBhZGRUZW1wbGF0ZShcIiNhcHBXaW5kb3dUZW1wbGF0ZVwiLCBcImJvZHlcIik7XG5cbiAgICBhcHBXaW5kb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKVtkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKS5sZW5ndGggLSAxXTtcbiAgICB0b3BiYXIgPSBhcHBXaW5kb3cucXVlcnlTZWxlY3RvcihcIi50b3BiYXJcIik7XG5cbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBhcHBXaW5kb3cuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xuXG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuYXBwSWNvblwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgYXBwLmltZyk7XG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuYXBwVGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwLmlkKSk7XG5cbiAgICBhcHBXaW5kb3cuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYXBwLmJhY2tncm91bmRDb2xvcjtcblxuICAgIHRvcGJhci5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBncmFiRWxlbWVudChhcHBXaW5kb3cpO1xuICAgIH0pO1xuXG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZUVsZW1lbnQpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHJlbGVhc2VFbGVtZW50KTtcblxuICAgIGFwcFdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGxhc3RJbmRleCArPSAxO1xuICAgICAgICBhcHBXaW5kb3cuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xuICAgIH0pO1xuXG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VXaW5kb3dCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhcHBXaW5kb3cucmVtb3ZlKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXBwV2luZG93O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVXaW5kb3cgPSBjcmVhdGVXaW5kb3c7XG4iXX0=
