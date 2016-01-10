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
//TODO Lite mer fluff och CSS
//TODO Byta bilderna

function memoryGame(container) {
    var gameBoard;
    var rows;
    var cols;
    var turn1;
    var turn2;
    var lastTile;
    var pairs = 0;
    var tries = 0;

    printStartScreen().then(function(boardSize) {
        var size;
        size = boardSize.split("x");
        rows = parseInt(size[0]);
        cols = parseInt(size[1]);
        playGame();
    });

    function playGame() {
        var tiles = getBricksArray();
        gameBoard = printGameScreen(tiles);
        container.appendChild(gameBoard);
    }

    function printStartScreen() {
        var template;
        var div;
        var i = 0;
        var boardSize;

        template = document.querySelector("#memoryGameStartTemplate");
        div = document.importNode(template.content.firstElementChild, true);

        container.appendChild(div);

        //TODO Lägg till en reject!
        return new Promise (function(resolve) {
            for (i = 1; i < 4; i += 1) {
                div.children[i].addEventListener("click", function(event) {
                    event.preventDefault();
                    boardSize = this.firstChild.lastChild.nodeValue;
                    div.remove();
                    resolve(boardSize);
                });
            }
        });
    }

    function printGameScreen(tiles) {
        var template;
        var templateContent;
        var div;

        template = document.querySelector("#memoryBrickTemplate");
        templateContent = template.content.firstElementChild;

        template = document.querySelector("#memoryGameTemplate");
        div = document.importNode(template.content.firstElementChild, true);

        tiles.forEach(function(tile, index) {
            var a;

            a = document.importNode(templateContent, true);

            addGameMechanics(a, tile, index);

            div.appendChild(a);

            if ((index + 1) % cols === 0) {
                div.appendChild(document.createElement("br"));
            }
        });

        return div;
    }

    function addGameMechanics(a, tile, index) {
        a.addEventListener("click", function(event) {
            var img;
            event.preventDefault();

            img = event.target.nodeName === "IMG" ? event.target : event.target.firstElementChild;
            gameLogic(tile, index, img);
        });
    }

    function getBricksArray() {
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

    function gameLogic(tile, index, img) {
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
                    gameBoard.remove();
                    printHighScoreScreen();
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

    function printHighScoreScreen() {
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
}

module.exports.launch = memoryGame;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvc2V0dGluZ3MvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnNMaXN0Lmpzb24iLCJjbGllbnQvc291cmNlL2pzL2RvY2suanMiLCJjbGllbnQvc291cmNlL2pzL2xhdW5jaGVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy93aW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZG9jayA9IHJlcXVpcmUoXCIuL2RvY2tcIik7XG5kb2NrLmluaXQoKTtcbiIsIi8vVE9ETyBMw6RnZyB0aWxsIGxvZ2VkIGluIGFzLlxuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIHNvY2tldCA9IG51bGw7XG52YXIgY29uZmlnID0ge1xuICAgIGFkcmVzczogXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiLFxuICAgIGtleTogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiXG59O1xuXG5mdW5jdGlvbiBwcmludExvZ2luU2NyZWVuKGNvbnRhaW5lcikge1xuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB2YXIgbm9kZTtcblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNpbnN0YUNoYXRMb2dpblRlbXBsYXRlXCIpO1xuICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub2RlKTtcbn1cblxuZnVuY3Rpb24gcHJpbnRPcGVyYXRpb25zU2NyZWVuKGNvbnRhaW5lcikge1xuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB2YXIgbm9kZTtcblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNpbnN0YUNoYXRUZW1wbGF0ZVwiKTtcbiAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG5cbmZ1bmN0aW9uIHByaW50TWVzc2FnZShjb250YWluZXIsIG1lc3NhZ2UpIHtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIGZyYWdtZW50O1xuICAgIHZhciBtZXNzYWdlRWxlbWVudDtcbiAgICB2YXIgdXNlcm5hbWVFbGVtZW50O1xuICAgIHZhciBjaGF0Qm94ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdEJveFwiKTtcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgdmFyIHRpbWUgPSBkYXRlLmdldEhvdXJzKCkgKyBcIjpcIiArIGRhdGUuZ2V0TWludXRlcygpO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lc3NhZ2VUZW1wbGF0ZVwiKTtcbiAgICBmcmFnbWVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgICB1c2VybmFtZUVsZW1lbnQgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKFwiLnVzZXJuYW1lXCIpO1xuICAgIG1lc3NhZ2VFbGVtZW50ID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlXCIpO1xuXG4gICAgaWYgKG1lc3NhZ2UudXNlcm5hbWUgPT09IHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lKSB7XG4gICAgICAgIG1lc3NhZ2UudXNlcm5hbWUgPSBcIllvdVwiO1xuICAgICAgICB1c2VybmFtZUVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIHVzZXJuYW1lU2VudFwiO1xuICAgICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc05hbWUgKz0gXCIgbWVzc2FnZVNlbnRcIjtcbiAgICB9XG5cbiAgICB1c2VybmFtZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZS51c2VybmFtZSArIFwiIFwiICsgdGltZSkpO1xuICAgIG1lc3NhZ2VFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UuZGF0YSkpO1xuXG4gICAgY2hhdEJveC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG59XG5cbmZ1bmN0aW9uIGxvZ2luKGNvbnRhaW5lcikge1xuICAgIHByaW50TG9naW5TY3JlZW4oY29udGFpbmVyKTtcbiAgICB2YXIgbG9naW5EaXYgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5pbnN0YUNoYXRMb2dpblwiKTtcblxuICAgIC8vVE9ETyBMw6RnZyB0aWxsIGVuIHJlamVjdCFcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuXG4gICAgICAgIGlmIChzZXNzaW9uU3RvcmFnZS51c2VybmFtZSkge1xuICAgICAgICAgICAgbG9naW5EaXYucmVtb3ZlKCk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBsb2dpbkRpdi5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2UudXNlcm5hbWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGxvZ2luRGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuYWxlcnRUZXh0XCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiUGxlYXNlIGVudGVyIGEgdXNlcm5hbWUhXCIpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjb25uZWN0KGNvbnRhaW5lcikge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldChjb25maWcuYWRyZXNzKTtcbiAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VXaW5kb3dCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNvY2tldC5jbG9zZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvL1RPRE8gRGVubmEga29kZW4gYsO2ciB0ZXN0YXNcbiAgICAgICAgICAgIHJlamVjdChcIkRldCBnaWNrIGZlbFwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG5cbiAgICAgICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IFwibWVzc2FnZVwiKSB7XG4gICAgICAgICAgICAgICAgcHJpbnRNZXNzYWdlKGNvbnRhaW5lciwgbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzZW5kKHRleHQpIHtcbiAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgIGRhdGE6IHRleHQsXG4gICAgICAgIHVzZXJuYW1lOiBzZXNzaW9uU3RvcmFnZS51c2VybmFtZSxcbiAgICAgICAgY2hhbm5lbDogXCJcIixcbiAgICAgICAga2V5OiBjb25maWcua2V5XG4gICAgfTtcbiAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG59XG5cbmZ1bmN0aW9uIGxhdW5jaChjb250YWluZXIpIHtcbiAgICBsb2dpbihjb250YWluZXIpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbm5lY3QoY29udGFpbmVyKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcHJpbnRPcGVyYXRpb25zU2NyZWVuKGNvbnRhaW5lcik7XG4gICAgICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi50ZXh0QXJlYVwiKS5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VuZChldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoID0gbGF1bmNoO1xuIiwiLy9UT0RPIExpdGUgbWVyIGZsdWZmIG9jaCBDU1Ncbi8vVE9ETyBCeXRhIGJpbGRlcm5hXG5cbmZ1bmN0aW9uIG1lbW9yeUdhbWUoY29udGFpbmVyKSB7XG4gICAgdmFyIGdhbWVCb2FyZDtcbiAgICB2YXIgcm93cztcbiAgICB2YXIgY29scztcbiAgICB2YXIgdHVybjE7XG4gICAgdmFyIHR1cm4yO1xuICAgIHZhciBsYXN0VGlsZTtcbiAgICB2YXIgcGFpcnMgPSAwO1xuICAgIHZhciB0cmllcyA9IDA7XG5cbiAgICBwcmludFN0YXJ0U2NyZWVuKCkudGhlbihmdW5jdGlvbihib2FyZFNpemUpIHtcbiAgICAgICAgdmFyIHNpemU7XG4gICAgICAgIHNpemUgPSBib2FyZFNpemUuc3BsaXQoXCJ4XCIpO1xuICAgICAgICByb3dzID0gcGFyc2VJbnQoc2l6ZVswXSk7XG4gICAgICAgIGNvbHMgPSBwYXJzZUludChzaXplWzFdKTtcbiAgICAgICAgcGxheUdhbWUoKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHBsYXlHYW1lKCkge1xuICAgICAgICB2YXIgdGlsZXMgPSBnZXRCcmlja3NBcnJheSgpO1xuICAgICAgICBnYW1lQm9hcmQgPSBwcmludEdhbWVTY3JlZW4odGlsZXMpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ2FtZUJvYXJkKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludFN0YXJ0U2NyZWVuKCkge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBkaXY7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgdmFyIGJvYXJkU2l6ZTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5R2FtZVN0YXJ0VGVtcGxhdGVcIik7XG4gICAgICAgIGRpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICAgICAgLy9UT0RPIEzDpGdnIHRpbGwgZW4gcmVqZWN0IVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UgKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDE7IGkgPCA0OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBkaXYuY2hpbGRyZW5baV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGJvYXJkU2l6ZSA9IHRoaXMuZmlyc3RDaGlsZC5sYXN0Q2hpbGQubm9kZVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBkaXYucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYm9hcmRTaXplKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRHYW1lU2NyZWVuKHRpbGVzKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIHRlbXBsYXRlQ29udGVudDtcbiAgICAgICAgdmFyIGRpdjtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5QnJpY2tUZW1wbGF0ZVwiKTtcbiAgICAgICAgdGVtcGxhdGVDb250ZW50ID0gdGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5R2FtZVRlbXBsYXRlXCIpO1xuICAgICAgICBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgIHRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBhO1xuXG4gICAgICAgICAgICBhID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZUNvbnRlbnQsIHRydWUpO1xuXG4gICAgICAgICAgICBhZGRHYW1lTWVjaGFuaWNzKGEsIHRpbGUsIGluZGV4KTtcblxuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGEpO1xuXG4gICAgICAgICAgICBpZiAoKGluZGV4ICsgMSkgJSBjb2xzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkaXY7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkR2FtZU1lY2hhbmljcyhhLCB0aWxlLCBpbmRleCkge1xuICAgICAgICBhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGltZztcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGltZyA9IGV2ZW50LnRhcmdldC5ub2RlTmFtZSA9PT0gXCJJTUdcIiA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgICAgIGdhbWVMb2dpYyh0aWxlLCBpbmRleCwgaW1nKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QnJpY2tzQXJyYXkoKSB7XG4gICAgICAgIHZhciBhcnIgPSBbXTtcbiAgICAgICAgdmFyIHRlbXA7XG4gICAgICAgIHZhciBpO1xuXG4gICAgICAgIGZvciAoaSA9IDE7IGkgPD0gKHJvd3MgKiBjb2xzKSAvIDI7IGkgKz0gMSkge1xuICAgICAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgICAgICAgICBhcnIucHVzaChpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoaSA9IGFyci5sZW5ndGggLSAxOyBpID4gMDsgaSAtPSAxKSB7XG4gICAgICAgICAgICB2YXIgcmFuZG9tTnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSk7XG4gICAgICAgICAgICB0ZW1wID0gYXJyW2ldO1xuICAgICAgICAgICAgYXJyW2ldID0gYXJyW3JhbmRvbU51bWJlcl07XG4gICAgICAgICAgICBhcnJbcmFuZG9tTnVtYmVyXSA9IHRlbXA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdhbWVMb2dpYyh0aWxlLCBpbmRleCwgaW1nKSB7XG4gICAgICAgIGlmICh0dXJuMikge3JldHVybjt9XG5cbiAgICAgICAgaW1nLnNyYyA9IFwiaW1hZ2UvXCIgKyB0aWxlICsgXCIucG5nXCI7XG5cbiAgICAgICAgaWYgKCF0dXJuMSkge1xuICAgICAgICAgICAgdHVybjEgPSBpbWc7XG4gICAgICAgICAgICBsYXN0VGlsZSA9IHRpbGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW1nID09PSB0dXJuMSkge3JldHVybjt9XG5cbiAgICAgICAgICAgIHRyaWVzICs9IDE7XG5cbiAgICAgICAgICAgIHR1cm4yID0gaW1nO1xuICAgICAgICAgICAgaWYgKHRpbGUgPT09IGxhc3RUaWxlKSB7XG4gICAgICAgICAgICAgICAgcGFpcnMgKz0gMTtcblxuICAgICAgICAgICAgICAgIGlmIChwYWlycyA9PT0gKGNvbHMgKiByb3dzKSAvIDIpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2FtZUJvYXJkLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBwcmludEhpZ2hTY29yZVNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwicmVtb3ZlXCIpO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMi5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJyZW1vdmVcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5zcmMgPSBcImltYWdlLzAucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnNyYyA9IFwiaW1hZ2UvMC5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50SGlnaFNjb3JlU2NyZWVuKCkge1xuICAgICAgICB2YXIgc3RvcmFnZU5hbWUgPSBcIm1lbW9yeVwiICsgcm93cyArIFwieFwiICsgY29scztcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgZ2FtZUVuZERpdjtcbiAgICAgICAgdmFyIGhpZ2hTY29yZTtcblxuICAgICAgICBoaWdoU2NvcmUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VOYW1lKSk7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUdhbWVFbmRUZW1wbGF0ZVwiKTtcbiAgICAgICAgZ2FtZUVuZERpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICAgICAgZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiLnNhdmVIaWdoc2NvcmVGb3JtXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBzYXZlSGlnaFNjb3JlKGdhbWVFbmREaXYucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpWzBdLnZhbHVlKTtcbiAgICAgICAgICAgIGdhbWVFbmREaXYucXVlcnlTZWxlY3RvcihcIi5zYXZlSGlnaHNjb3JlRm9ybVwiKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHByaW50SGlnaFNjb3JlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByaW50SGlnaFNjb3JlKCk7XG5cbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdhbWVFbmREaXYpO1xuXG4gICAgICAgIGZ1bmN0aW9uIHByaW50SGlnaFNjb3JlKCkge1xuICAgICAgICAgICAgaGlnaFNjb3JlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShzdG9yYWdlTmFtZSkpO1xuICAgICAgICAgICAgdmFyIG9sZFNjb3JlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuaGlnaFNjb3JlXCIpO1xuICAgICAgICAgICAgaWYgKG9sZFNjb3JlKSB7XG4gICAgICAgICAgICAgICAgb2xkU2NvcmUucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoaWdoU2NvcmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgICAgICB2YXIgc2NvcmU7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgPSBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIjaGlnaFNjb3JlVGVtcGF0ZVwiKTtcbiAgICAgICAgICAgICAgICB2YXIgc2NvcmVCb2FyZCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaGlnaFNjb3JlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3JlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJOaWNrbmFtZTogXCIgKyBoaWdoU2NvcmVbaV0ubmlja25hbWUgKyBcIiB8IFRyaWVzOiBcIiArIGhpZ2hTY29yZVtpXS50cmllcyk7XG4gICAgICAgICAgICAgICAgICAgIHNjb3JlQm9hcmQuY2hpbGRyZW5baV0uYXBwZW5kQ2hpbGQoc2NvcmUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGdhbWVFbmREaXYuYXBwZW5kQ2hpbGQoc2NvcmVCb2FyZCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgPSBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIjbm9IaWdoU2NvcmVUZW1wYXRlXCIpO1xuICAgICAgICAgICAgICAgIGdhbWVFbmREaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzYXZlSGlnaFNjb3JlKG5pY2tuYW1lKSB7XG4gICAgICAgICAgICBpZiAoaGlnaFNjb3JlKSB7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlLnB1c2goe25pY2tuYW1lOiBuaWNrbmFtZSwgdHJpZXM6IHRyaWVzfSk7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKGEudHJpZXMpIC0gTnVtYmVyKGIudHJpZXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlLnNwbGljZSg1LCAxKTtcblxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VOYW1lLCBKU09OLnN0cmluZ2lmeShoaWdoU2NvcmUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlID0gW1xuICAgICAgICAgICAgICAgICAgICB7bmlja25hbWU6IG5pY2tuYW1lLCB0cmllczogdHJpZXN9XG4gICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VOYW1lLCBKU09OLnN0cmluZ2lmeShoaWdoU2NvcmUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoID0gbWVtb3J5R2FtZTtcbiIsIi8vVE9ETyBTcGFyYSBzZXR0aW5ncyBpIGxvY2Fsc3RvcmFnZS5cbi8vVE9ETyBIaWRlIHRhc2tiYXJcblxuZnVuY3Rpb24gbGF1bmNoKGNvbnRhaW5lcikge1xuICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJUaGlzIGlzIHRoZSBzZXR0aW5ncy4gV2UgYXJlIG5vdCBob21lIHJpZ2h0IG5vdyBidXQgbGVhdmUgYSBtZXNzYWdlXCIpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0KTtcbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoID0gbGF1bmNoO1xuIiwibW9kdWxlLmV4cG9ydHM9W1xuICAgIHtcImlkXCI6IFwiaW5zdGFDaGF0XCIsIFwiaW1nXCI6IFwiLi4vaW1hZ2UvaW5zdGFDaGF0LnBuZ1wiLCBcImJhY2tncm91bmRDb2xvclwiOiBcInllbGxvd2dyZWVuXCJ9LFxuICAgIHtcImlkXCI6IFwibWVtb3J5R2FtZVwiLCBcImltZ1wiOiBcIi4uL2ltYWdlL3Rlc3RBcHAucG5nXCIsIFwiYmFja2dyb3VuZENvbG9yXCI6IFwibGlnaHRibHVlXCJ9LFxuICAgIHtcImlkXCI6IFwic2V0dGluZ3NcIiwgXCJpbWdcIjogXCIuLi9pbWFnZS9zZXR0aW5ncy5wbmdcIiwgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCJ5ZWxsb3dcIn1cbl1cblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vVE9ETyBGw7Zyc8O2ayByZW5zYSB1cHAgc8OlIG1rdCBodG1sIG9jaCBjc3MgZnLDpW4gamF2YXNjcmlwdGtvZGVuLlxuXG52YXIgZG9jayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKTtcbnZhciBidXR0b25zID0gW107XG52YXIgbGF1bmNoZXIgPSByZXF1aXJlKFwiLi9sYXVuY2hlclwiKTtcblxudmFyIGFwcGxpY2F0aW9ucyA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9uc0xpc3RcIik7XG5cbmZ1bmN0aW9uIGNlbnRyYWxpemUoKSB7XG4gICAgdmFyIHdpZHRoID0gZG9jay5vZmZzZXRXaWR0aDtcbiAgICBkb2NrLnN0eWxlLm1hcmdpbkxlZnQgPSAod2lkdGggLyAyKSAqIC0xO1xufVxuXG5mdW5jdGlvbiBkb2NrSGlkZVNob3coKSB7XG4gICAgdmFyIGk7XG5cbiAgICBkb2NrLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCI2MHB4XCI7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRvY2suYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBkb2NrLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRCdXR0b24oYXBwKSB7XG4gICAgZG9jay5zdHlsZS53aWR0aCA9IGRvY2sub2Zmc2V0V2lkdGggKyA0NTtcbiAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBidXR0b24uY2xhc3NOYW1lID0gXCJhcHBCdXR0b25cIjtcbiAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYXBwLmJhY2tncm91bmRDb2xvcjtcbiAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXCIgKyBhcHAuaW1nICsgXCIpXCI7XG4gICAgZG9jay5hcHBlbmRDaGlsZChidXR0b24pO1xuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgbGF1bmNoZXIubGF1bmNoZXIoYXBwKTtcbiAgICB9KTtcblxuICAgIGJ1dHRvbnMucHVzaChidXR0b24pO1xufVxuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIHZhciBpO1xuICAgIGZvciAoaSA9IDA7IGkgPCBhcHBsaWNhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYWRkQnV0dG9uKGFwcGxpY2F0aW9uc1tpXSk7XG4gICAgfVxuXG4gICAgY2VudHJhbGl6ZSgpO1xuICAgIGRvY2tIaWRlU2hvdygpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gaW5pdDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgcHdkV2luZG93ID0gcmVxdWlyZShcIi4vd2luZG93XCIpO1xuXG5mdW5jdGlvbiBBcHBsaWNhdGlvbnMoKSB7XG4gICAgdGhpcy5pbnN0YUNoYXQgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9pbnN0YUNoYXQvYXBwXCIpO1xuICAgICAgICBhcHAubGF1bmNoKGNvbnRhaW5lcik7XG4gICAgfTtcblxuICAgIHRoaXMubWVtb3J5R2FtZSA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgYXBwID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwXCIpO1xuICAgICAgICBhcHAubGF1bmNoKGNvbnRhaW5lcik7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0dGluZ3MgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9zZXR0aW5ncy9hcHBcIik7XG4gICAgICAgIGFwcC5sYXVuY2goY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgdGhpcy5lcnJvciA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZXJyKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZXJyKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRleHQpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGxhdW5jaGVyKGFwcCkge1xuICAgIHZhciBjb250YWluZXI7XG4gICAgdmFyIGFwcGxpY2F0aW9ucztcblxuICAgIGNvbnRhaW5lciA9IHB3ZFdpbmRvdy5jcmVhdGVXaW5kb3coYXBwKTtcbiAgICBhcHBsaWNhdGlvbnMgPSBuZXcgQXBwbGljYXRpb25zKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBhcHBsaWNhdGlvbnNbYXBwLmlkXShjb250YWluZXIpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBhcHBsaWNhdGlvbnMuZXJyb3IoY29udGFpbmVyLCBlcnIpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoZXIgPSBsYXVuY2hlcjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBsYXN0SW5kZXggPSAwO1xudmFyIG9mZnNldFggPSAwO1xudmFyIG9mZnNldFkgPSAwO1xudmFyIHBvc2l0aW9uWCA9IDA7XG52YXIgcG9zaXRpb25ZID0gMDtcbnZhciBlbGVtZW50O1xuXG5mdW5jdGlvbiBncmFiRWxlbWVudCh0YXJnZXQpIHtcbiAgICBlbGVtZW50ID0gdGFyZ2V0O1xuICAgIG9mZnNldFggPSBwb3NpdGlvblggLSBlbGVtZW50Lm9mZnNldExlZnQ7XG4gICAgb2Zmc2V0WSA9IHBvc2l0aW9uWSAtIGVsZW1lbnQub2Zmc2V0VG9wO1xuICAgIGxhc3RJbmRleCArPSAxO1xuICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xufVxuXG5mdW5jdGlvbiBtb3ZlRWxlbWVudChldmVudCkge1xuICAgIHBvc2l0aW9uWCA9IGV2ZW50LmNsaWVudFg7XG4gICAgcG9zaXRpb25ZID0gZXZlbnQuY2xpZW50WTtcbiAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICBlbGVtZW50LnN0eWxlLmxlZnQgPSBwb3NpdGlvblggLSAob2Zmc2V0WCArIDIpICsgXCJweFwiO1xuICAgICAgICBlbGVtZW50LnN0eWxlLnRvcCA9IHBvc2l0aW9uWSAtIChvZmZzZXRZICsgMikgKyBcInB4XCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZWxlYXNlRWxlbWVudCgpIHtcbiAgICBlbGVtZW50ID0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBhZGRUZW1wbGF0ZSh0ZW1wbGF0ZU5hbWUsIGNvbnRhaW5lck5hbWUpIHtcbiAgICB2YXIgY29udGFpbmVyO1xuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB2YXIgbm9kZTtcblxuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyTmFtZSk7XG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRlbXBsYXRlTmFtZSk7XG4gICAgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVXaW5kb3coYXBwKSB7XG4gICAgdmFyIHRvcGJhcjtcbiAgICB2YXIgYXBwV2luZG93O1xuXG4gICAgYWRkVGVtcGxhdGUoXCIjYXBwV2luZG93VGVtcGxhdGVcIiwgXCJib2R5XCIpO1xuXG4gICAgYXBwV2luZG93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5hcHBXaW5kb3dcIilbZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5hcHBXaW5kb3dcIikubGVuZ3RoIC0gMV07XG4gICAgdG9wYmFyID0gYXBwV2luZG93LnF1ZXJ5U2VsZWN0b3IoXCIudG9wYmFyXCIpO1xuXG4gICAgbGFzdEluZGV4ICs9IDE7XG4gICAgYXBwV2luZG93LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcblxuICAgIHRvcGJhci5xdWVyeVNlbGVjdG9yKFwiLmFwcEljb25cIikuc2V0QXR0cmlidXRlKFwic3JjXCIsIGFwcC5pbWcpO1xuICAgIHRvcGJhci5xdWVyeVNlbGVjdG9yKFwiLmFwcFRpdGxlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcC5pZCkpO1xuXG4gICAgYXBwV2luZG93LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFwcC5iYWNrZ3JvdW5kQ29sb3I7XG5cbiAgICB0b3BiYXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZ3JhYkVsZW1lbnQoYXBwV2luZG93KTtcbiAgICB9KTtcblxuICAgIGFwcFdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVFbGVtZW50KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCByZWxlYXNlRWxlbWVudCk7XG5cbiAgICBhcHBXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBsYXN0SW5kZXggKz0gMTtcbiAgICAgICAgYXBwV2luZG93LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbiAgICB9KTtcblxuICAgIHRvcGJhci5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlV2luZG93QnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgYXBwV2luZG93LnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGFwcFdpbmRvdztcbn1cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlV2luZG93ID0gY3JlYXRlV2luZG93O1xuIl19
