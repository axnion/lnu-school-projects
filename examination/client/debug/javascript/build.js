(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var dock = require("./dock");
dock.init();

},{"./dock":7}],2:[function(require,module,exports){
//Om jag har tid lägg till så kan kan lägga till och ta bort kanaler i en oonfig fil

"use strict";

function instaChat(container) {

    var socket = null;
    var config = {
        adress: "ws://vhost3.lnu.se:20080/socket/",
        key: "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd",
        channel: ""
    };

    login().then(function() {
        connect().then(function() {
            printOperationsScreen();
            container.querySelector(".textArea").addEventListener("keypress", function(event) {
                if (event.keyCode === 13) {
                    send(event.target.value);
                    event.target.value = "";
                    event.preventDefault();
                }
            });
        });
    });

    function printLoginScreen() {
        var template;
        var node;

        template = document.querySelector("#instaChatLoginTemplate");
        node = document.importNode(template.content, true);
        container.appendChild(node);
    }

    function printOperationsScreen() {
        var template;
        var node;
        var options;
        var i;

        template = document.querySelector("#instaChatTemplate");
        node = document.importNode(template.content, true);
        container.appendChild(node);

        template = document.querySelector("#channelSelectTempalte");
        node = document.importNode(template.content.firstElementChild, true);

        container.querySelector(".topbar").appendChild(node);

        node.addEventListener("change", function() {
            var selected
            options = node.children;

            selected = node.options[node.selectedIndex];

            debugger;

            config.channel = selected.value;
            printNotification("Switched to " + selected.firstChild.data + " channel", false);
        });
    }

    function printMessage(message) {
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

    function printNotification(message, temporary) {
        var template = document.querySelector("#notificationTemplate");
        var notification = document.importNode(template.content.firstElementChild, true);
        var text;

        text = document.createTextNode(message);

        notification.appendChild(text);

        container.querySelector(".chatBox").appendChild(notification);

        if (temporary) {
            setTimeout(function() {
                notification.remove();
            }, 5000);
        }
    }

    function login() {
        printLoginScreen();
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

    function connect() {
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
                    if (message.channel === config.channel) {
                        printMessage(message);
                    }
                } else if (message.type === "notification") {
                    printNotification(message.data+ " Welcome " + sessionStorage.getItem("username"), true);
                }
            });
        });
    }

    function send(text) {
        var data = {
            type: "message",
            data: text,
            username: sessionStorage.username,
            channel: config.channel,
            key: config.key
        };
        socket.send(JSON.stringify(data));
    }
}

module.exports.launch = instaChat;

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
function settings(container) {
    var form;
    var inputs;
    var template;

    template = document.querySelector("#settingsTemplate");
    form = document.importNode(template.content.firstElementChild, true);
    inputs = form.querySelectorAll("input");

    container.appendChild(form);

    fillFormWithData();

    form.addEventListener("change", function(event) {
        event.preventDefault();
        inputs[5].disabled = false;
        inputs[6].disabled = false;
    });

    inputs[5].addEventListener("click", function() {
        apply();
    });
    inputs[6].addEventListener("click", function() {
        fillFormWithData();
    });
    inputs[7].addEventListener("click", function() {
        resetToDefault();
    });

    function fillFormWithData() {
        var settings = JSON.parse(localStorage.getItem("PWDSettings"));

        inputs[0].value = settings.wallpaper;

        if (settings.hideDock === "true") {
            inputs[1].checked = true;
        } else {
            inputs[2].checked = true;
        }

        if (settings.dockPosition === "top") {
            inputs[3].checked = true;
        } else {
            inputs[4].checked = true;
        }

        inputs[5].disabled = true;
        inputs[6].disabled = true;
    }

    function apply(){
        var newSetting = {
            wallpaper: inputs[0].value,
            hideDock: inputs[1].checked ? "true" : "false",
            dockPosition: inputs[3].checked ? "top" : "bottom"
        };
        localStorage.setItem("PWDSettings", JSON.stringify(newSetting));
        useNewSettings();
    }

    function resetToDefault() {
        localStorage.setItem("PWDSettings", JSON.stringify(require("../../defaultSettings.json")));
        useNewSettings();
    }

    function useNewSettings() {
        var i;
        var settings = JSON.parse(localStorage.getItem("PWDSettings"));
        var buttons;

        document.querySelector("body").style.backgroundImage = "url(" + settings.wallpaper + ")";

        if (settings.hideDock === "false") {
            document.querySelector("#dock").style.height = "60px";
            buttons = document.querySelector("#dock").children;

            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].style.height = "50px";
            }
        } else {
            document.querySelector("#dock").style.height = "0px";
            buttons = document.querySelector("#dock").children;

            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].style.height = "0px";
            }
        }

        if (settings.dockPosition === "top") {
            document.querySelector("#dock").className = "dockTop";
        } else {
            document.querySelector("#dock").className = "dockBottom";
        }
    }
}

module.exports.launch = settings;

},{"../../defaultSettings.json":6}],5:[function(require,module,exports){
module.exports=[
    {"id": "instaChat", "img": "../image/instaChat.png", "backgroundColor": "yellowgreen"},
    {"id": "memoryGame", "img": "../image/testApp.png", "backgroundColor": "lightblue"},
    {"id": "settings", "img": "../image/settings.png", "backgroundColor": "yellow"}
]


},{}],6:[function(require,module,exports){
module.exports={
    "wallpaper": "../image/wallpaper.jpg",
    "hideDock": "false",
    "dockPosition": "bottom"
}

},{}],7:[function(require,module,exports){
"use strict";
//TODO Städa upp så URLen inte förändras.
//TODO Försök rensa upp så mkt html och css från javascriptkoden.
//TODO Kolla var där kan behövas med feedback

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
        var hideDock = JSON.parse(localStorage.getItem("PWDSettings")).hideDock;

        if (hideDock === "true") {
            dock.style.height = "0px";

            for (i = 0; i < buttons.length; i += 1) {
                buttons[i].style.height = "0px";
            }
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

function init() {
    var i;

    for (i = 0; i < applications.length; i += 1) {
        addButton(applications[i]);
    }

    loadSettings();
    centralize();
    dockHideShow();

}

module.exports.init = init;

},{"./applicationsList":5,"./defaultSettings.json":6,"./launcher":8}],8:[function(require,module,exports){
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

    //TODO Ta bort allt i fönstret innan
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


},{"./applications/instaChat/app":2,"./applications/memoryGame/app":3,"./applications/settings/app":4,"./window":9}],9:[function(require,module,exports){
//TODO Gör så att fönsterna inte kan gå utanför skärmen.

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvc2V0dGluZ3MvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnNMaXN0Lmpzb24iLCJjbGllbnQvc291cmNlL2pzL2RlZmF1bHRTZXR0aW5ncy5qc29uIiwiY2xpZW50L3NvdXJjZS9qcy9kb2NrLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9sYXVuY2hlci5qcyIsImNsaWVudC9zb3VyY2UvanMvd2luZG93LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGRvY2sgPSByZXF1aXJlKFwiLi9kb2NrXCIpO1xuZG9jay5pbml0KCk7XG4iLCIvL09tIGphZyBoYXIgdGlkIGzDpGdnIHRpbGwgc8OlIGthbiBrYW4gbMOkZ2dhIHRpbGwgb2NoIHRhIGJvcnQga2FuYWxlciBpIGVuIG9vbmZpZyBmaWxcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIGluc3RhQ2hhdChjb250YWluZXIpIHtcblxuICAgIHZhciBzb2NrZXQgPSBudWxsO1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFkcmVzczogXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiLFxuICAgICAgICBrZXk6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIixcbiAgICAgICAgY2hhbm5lbDogXCJcIlxuICAgIH07XG5cbiAgICBsb2dpbigpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcHJpbnRPcGVyYXRpb25zU2NyZWVuKCk7XG4gICAgICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi50ZXh0QXJlYVwiKS5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VuZChldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHByaW50TG9naW5TY3JlZW4oKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIG5vZGU7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdExvZ2luVGVtcGxhdGVcIik7XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRPcGVyYXRpb25zU2NyZWVuKCkge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBub2RlO1xuICAgICAgICB2YXIgb3B0aW9ucztcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdFRlbXBsYXRlXCIpO1xuICAgICAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGFubmVsU2VsZWN0VGVtcGFsdGVcIik7XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLnRvcGJhclwiKS5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWRcbiAgICAgICAgICAgIG9wdGlvbnMgPSBub2RlLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICBzZWxlY3RlZCA9IG5vZGUub3B0aW9uc1tub2RlLnNlbGVjdGVkSW5kZXhdO1xuXG4gICAgICAgICAgICBkZWJ1Z2dlcjtcblxuICAgICAgICAgICAgY29uZmlnLmNoYW5uZWwgPSBzZWxlY3RlZC52YWx1ZTtcbiAgICAgICAgICAgIHByaW50Tm90aWZpY2F0aW9uKFwiU3dpdGNoZWQgdG8gXCIgKyBzZWxlY3RlZC5maXJzdENoaWxkLmRhdGEgKyBcIiBjaGFubmVsXCIsIGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgZnJhZ21lbnQ7XG4gICAgICAgIHZhciBtZXNzYWdlRWxlbWVudDtcbiAgICAgICAgdmFyIHVzZXJuYW1lRWxlbWVudDtcbiAgICAgICAgdmFyIGNoYXRCb3ggPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jaGF0Qm94XCIpO1xuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHZhciB0aW1lID0gZGF0ZS5nZXRIb3VycygpICsgXCI6XCIgKyBkYXRlLmdldE1pbnV0ZXMoKTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVRlbXBsYXRlXCIpO1xuICAgICAgICBmcmFnbWVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgICAgICAgdXNlcm5hbWVFbGVtZW50ID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvcihcIi51c2VybmFtZVwiKTtcbiAgICAgICAgbWVzc2FnZUVsZW1lbnQgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VcIik7XG5cbiAgICAgICAgaWYgKG1lc3NhZ2UudXNlcm5hbWUgPT09IHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lKSB7XG4gICAgICAgICAgICBtZXNzYWdlLnVzZXJuYW1lID0gXCJZb3VcIjtcbiAgICAgICAgICAgIHVzZXJuYW1lRWxlbWVudC5jbGFzc05hbWUgKz0gXCIgdXNlcm5hbWVTZW50XCI7XG4gICAgICAgICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc05hbWUgKz0gXCIgbWVzc2FnZVNlbnRcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVzZXJuYW1lRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlLnVzZXJuYW1lICsgXCIgXCIgKyB0aW1lKSk7XG4gICAgICAgIG1lc3NhZ2VFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UuZGF0YSkpO1xuXG4gICAgICAgIGNoYXRCb3guYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50Tm90aWZpY2F0aW9uKG1lc3NhZ2UsIHRlbXBvcmFyeSkge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25vdGlmaWNhdGlvblRlbXBsYXRlXCIpO1xuICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgdmFyIHRleHQ7XG5cbiAgICAgICAgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpO1xuXG4gICAgICAgIG5vdGlmaWNhdGlvbi5hcHBlbmRDaGlsZCh0ZXh0KTtcblxuICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jaGF0Qm94XCIpLmFwcGVuZENoaWxkKG5vdGlmaWNhdGlvbik7XG5cbiAgICAgICAgaWYgKHRlbXBvcmFyeSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvZ2luKCkge1xuICAgICAgICBwcmludExvZ2luU2NyZWVuKCk7XG4gICAgICAgIHZhciBsb2dpbkRpdiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmluc3RhQ2hhdExvZ2luXCIpO1xuXG4gICAgICAgIC8vVE9ETyBMw6RnZyB0aWxsIGVuIHJlamVjdCFcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcblxuICAgICAgICAgICAgaWYgKHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lKSB7XG4gICAgICAgICAgICAgICAgbG9naW5EaXYucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9naW5EaXYuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW5EaXYucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5hbGVydFRleHRcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJQbGVhc2UgZW50ZXIgYSB1c2VybmFtZSFcIikpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbm5lY3QoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoY29uZmlnLmFkcmVzcyk7XG4gICAgICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VXaW5kb3dCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAvL1RPRE8gRGVubmEga29kZW4gYsO2ciB0ZXN0YXNcbiAgICAgICAgICAgICAgICByZWplY3QoXCJEZXQgZ2ljayBmZWxcIik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuY2hhbm5lbCA9PT0gY29uZmlnLmNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50TWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS50eXBlID09PSBcIm5vdGlmaWNhdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHByaW50Tm90aWZpY2F0aW9uKG1lc3NhZ2UuZGF0YSsgXCIgV2VsY29tZSBcIiArIHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJ1c2VybmFtZVwiKSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbmQodGV4dCkge1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICAgICAgZGF0YTogdGV4dCxcbiAgICAgICAgICAgIHVzZXJuYW1lOiBzZXNzaW9uU3RvcmFnZS51c2VybmFtZSxcbiAgICAgICAgICAgIGNoYW5uZWw6IGNvbmZpZy5jaGFubmVsLFxuICAgICAgICAgICAga2V5OiBjb25maWcua2V5XG4gICAgICAgIH07XG4gICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaCA9IGluc3RhQ2hhdDtcbiIsIi8vVE9ETyBMaXRlIG1lciBmbHVmZiBvY2ggQ1NTXG4vL1RPRE8gQnl0YSBiaWxkZXJuYVxuXG5mdW5jdGlvbiBtZW1vcnlHYW1lKGNvbnRhaW5lcikge1xuICAgIHZhciBnYW1lQm9hcmQ7XG4gICAgdmFyIHJvd3M7XG4gICAgdmFyIGNvbHM7XG4gICAgdmFyIHR1cm4xO1xuICAgIHZhciB0dXJuMjtcbiAgICB2YXIgbGFzdFRpbGU7XG4gICAgdmFyIHBhaXJzID0gMDtcbiAgICB2YXIgdHJpZXMgPSAwO1xuXG4gICAgcHJpbnRTdGFydFNjcmVlbigpLnRoZW4oZnVuY3Rpb24oYm9hcmRTaXplKSB7XG4gICAgICAgIHZhciBzaXplO1xuICAgICAgICBzaXplID0gYm9hcmRTaXplLnNwbGl0KFwieFwiKTtcbiAgICAgICAgcm93cyA9IHBhcnNlSW50KHNpemVbMF0pO1xuICAgICAgICBjb2xzID0gcGFyc2VJbnQoc2l6ZVsxXSk7XG4gICAgICAgIHBsYXlHYW1lKCk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBwbGF5R2FtZSgpIHtcbiAgICAgICAgdmFyIHRpbGVzID0gZ2V0QnJpY2tzQXJyYXkoKTtcbiAgICAgICAgZ2FtZUJvYXJkID0gcHJpbnRHYW1lU2NyZWVuKHRpbGVzKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdhbWVCb2FyZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRTdGFydFNjcmVlbigpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgZGl2O1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHZhciBib2FyZFNpemU7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUdhbWVTdGFydFRlbXBsYXRlXCIpO1xuICAgICAgICBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuXG4gICAgICAgIC8vVE9ETyBMw6RnZyB0aWxsIGVuIHJlamVjdCFcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlIChmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAxOyBpIDwgNDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgZGl2LmNoaWxkcmVuW2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBib2FyZFNpemUgPSB0aGlzLmZpcnN0Q2hpbGQubGFzdENoaWxkLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgZGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGJvYXJkU2l6ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50R2FtZVNjcmVlbih0aWxlcykge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciB0ZW1wbGF0ZUNvbnRlbnQ7XG4gICAgICAgIHZhciBkaXY7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUJyaWNrVGVtcGxhdGVcIik7XG4gICAgICAgIHRlbXBsYXRlQ29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUdhbWVUZW1wbGF0ZVwiKTtcbiAgICAgICAgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICB0aWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHRpbGUsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgYTtcblxuICAgICAgICAgICAgYSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVDb250ZW50LCB0cnVlKTtcblxuICAgICAgICAgICAgYWRkR2FtZU1lY2hhbmljcyhhLCB0aWxlLCBpbmRleCk7XG5cbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgICAgICAgICAgaWYgKChpbmRleCArIDEpICUgY29scyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGl2O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZEdhbWVNZWNoYW5pY3MoYSwgdGlsZSwgaW5kZXgpIHtcbiAgICAgICAgYS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBpbWc7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpbWcgPSBldmVudC50YXJnZXQubm9kZU5hbWUgPT09IFwiSU1HXCIgPyBldmVudC50YXJnZXQgOiBldmVudC50YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgICAgICBnYW1lTG9naWModGlsZSwgaW5kZXgsIGltZyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJyaWNrc0FycmF5KCkge1xuICAgICAgICB2YXIgYXJyID0gW107XG4gICAgICAgIHZhciB0ZW1wO1xuICAgICAgICB2YXIgaTtcblxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IChyb3dzICogY29scykgLyAyOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSBhcnIubGVuZ3RoIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgdmFyIHJhbmRvbU51bWJlciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpO1xuICAgICAgICAgICAgdGVtcCA9IGFycltpXTtcbiAgICAgICAgICAgIGFycltpXSA9IGFycltyYW5kb21OdW1iZXJdO1xuICAgICAgICAgICAgYXJyW3JhbmRvbU51bWJlcl0gPSB0ZW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnYW1lTG9naWModGlsZSwgaW5kZXgsIGltZykge1xuICAgICAgICBpZiAodHVybjIpIHtyZXR1cm47fVxuXG4gICAgICAgIGltZy5zcmMgPSBcImltYWdlL1wiICsgdGlsZSArIFwiLnBuZ1wiO1xuXG4gICAgICAgIGlmICghdHVybjEpIHtcbiAgICAgICAgICAgIHR1cm4xID0gaW1nO1xuICAgICAgICAgICAgbGFzdFRpbGUgPSB0aWxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGltZyA9PT0gdHVybjEpIHtyZXR1cm47fVxuXG4gICAgICAgICAgICB0cmllcyArPSAxO1xuXG4gICAgICAgICAgICB0dXJuMiA9IGltZztcbiAgICAgICAgICAgIGlmICh0aWxlID09PSBsYXN0VGlsZSkge1xuICAgICAgICAgICAgICAgIHBhaXJzICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFpcnMgPT09IChjb2xzICogcm93cykgLyAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVCb2FyZC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbnRIaWdoU2NvcmVTY3JlZW4oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcInJlbW92ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwicmVtb3ZlXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIHR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEuc3JjID0gXCJpbWFnZS8wLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMi5zcmMgPSBcImltYWdlLzAucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludEhpZ2hTY29yZVNjcmVlbigpIHtcbiAgICAgICAgdmFyIHN0b3JhZ2VOYW1lID0gXCJtZW1vcnlcIiArIHJvd3MgKyBcInhcIiArIGNvbHM7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIGdhbWVFbmREaXY7XG4gICAgICAgIHZhciBoaWdoU2NvcmU7XG5cbiAgICAgICAgaGlnaFNjb3JlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShzdG9yYWdlTmFtZSkpO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlHYW1lRW5kVGVtcGxhdGVcIik7XG4gICAgICAgIGdhbWVFbmREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgIGdhbWVFbmREaXYucXVlcnlTZWxlY3RvcihcIi5zYXZlSGlnaHNjb3JlRm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgc2F2ZUhpZ2hTY29yZShnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKVswXS52YWx1ZSk7XG4gICAgICAgICAgICBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuc2F2ZUhpZ2hzY29yZUZvcm1cIikucmVtb3ZlKCk7XG4gICAgICAgICAgICBwcmludEhpZ2hTY29yZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcmludEhpZ2hTY29yZSgpO1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChnYW1lRW5kRGl2KTtcblxuICAgICAgICBmdW5jdGlvbiBwcmludEhpZ2hTY29yZSgpIHtcbiAgICAgICAgICAgIGhpZ2hTY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZU5hbWUpKTtcbiAgICAgICAgICAgIHZhciBvbGRTY29yZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmhpZ2hTY29yZVwiKTtcbiAgICAgICAgICAgIGlmIChvbGRTY29yZSkge1xuICAgICAgICAgICAgICAgIG9sZFNjb3JlLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaGlnaFNjb3JlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICAgICAgdmFyIHNjb3JlO1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiI2hpZ2hTY29yZVRlbXBhdGVcIik7XG4gICAgICAgICAgICAgICAgdmFyIHNjb3JlQm9hcmQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGhpZ2hTY29yZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzY29yZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTmlja25hbWU6IFwiICsgaGlnaFNjb3JlW2ldLm5pY2tuYW1lICsgXCIgfCBUcmllczogXCIgKyBoaWdoU2NvcmVbaV0udHJpZXMpO1xuICAgICAgICAgICAgICAgICAgICBzY29yZUJvYXJkLmNoaWxkcmVuW2ldLmFwcGVuZENoaWxkKHNjb3JlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBnYW1lRW5kRGl2LmFwcGVuZENoaWxkKHNjb3JlQm9hcmQpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiI25vSGlnaFNjb3JlVGVtcGF0ZVwiKTtcbiAgICAgICAgICAgICAgICBnYW1lRW5kRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2F2ZUhpZ2hTY29yZShuaWNrbmFtZSkge1xuICAgICAgICAgICAgaWYgKGhpZ2hTY29yZSkge1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZS5wdXNoKHtuaWNrbmFtZTogbmlja25hbWUsIHRyaWVzOiB0cmllc30pO1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE51bWJlcihhLnRyaWVzKSAtIE51bWJlcihiLnRyaWVzKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGhpZ2hTY29yZS5zcGxpY2UoNSwgMSk7XG5cbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdG9yYWdlTmFtZSwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZSA9IFtcbiAgICAgICAgICAgICAgICAgICAge25pY2tuYW1lOiBuaWNrbmFtZSwgdHJpZXM6IHRyaWVzfVxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdG9yYWdlTmFtZSwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaCA9IG1lbW9yeUdhbWU7XG4iLCJmdW5jdGlvbiBzZXR0aW5ncyhjb250YWluZXIpIHtcbiAgICB2YXIgZm9ybTtcbiAgICB2YXIgaW5wdXRzO1xuICAgIHZhciB0ZW1wbGF0ZTtcblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZXR0aW5nc1RlbXBsYXRlXCIpO1xuICAgIGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGlucHV0cyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xuXG4gICAgZmlsbEZvcm1XaXRoRGF0YSgpO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGlucHV0c1s1XS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICBpbnB1dHNbNl0uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIGlucHV0c1s1XS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFwcGx5KCk7XG4gICAgfSk7XG4gICAgaW5wdXRzWzZdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZmlsbEZvcm1XaXRoRGF0YSgpO1xuICAgIH0pO1xuICAgIGlucHV0c1s3XS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc2V0VG9EZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBmaWxsRm9ybVdpdGhEYXRhKCkge1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpO1xuXG4gICAgICAgIGlucHV0c1swXS52YWx1ZSA9IHNldHRpbmdzLndhbGxwYXBlcjtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuaGlkZURvY2sgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICBpbnB1dHNbMV0uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dHNbMl0uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MuZG9ja1Bvc2l0aW9uID09PSBcInRvcFwiKSB7XG4gICAgICAgICAgICBpbnB1dHNbM10uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dHNbNF0uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpbnB1dHNbNV0uZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICBpbnB1dHNbNl0uZGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFwcGx5KCl7XG4gICAgICAgIHZhciBuZXdTZXR0aW5nID0ge1xuICAgICAgICAgICAgd2FsbHBhcGVyOiBpbnB1dHNbMF0udmFsdWUsXG4gICAgICAgICAgICBoaWRlRG9jazogaW5wdXRzWzFdLmNoZWNrZWQgPyBcInRydWVcIiA6IFwiZmFsc2VcIixcbiAgICAgICAgICAgIGRvY2tQb3NpdGlvbjogaW5wdXRzWzNdLmNoZWNrZWQgPyBcInRvcFwiIDogXCJib3R0b21cIlxuICAgICAgICB9O1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIlBXRFNldHRpbmdzXCIsIEpTT04uc3RyaW5naWZ5KG5ld1NldHRpbmcpKTtcbiAgICAgICAgdXNlTmV3U2V0dGluZ3MoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldFRvRGVmYXVsdCgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJQV0RTZXR0aW5nc1wiLCBKU09OLnN0cmluZ2lmeShyZXF1aXJlKFwiLi4vLi4vZGVmYXVsdFNldHRpbmdzLmpzb25cIikpKTtcbiAgICAgICAgdXNlTmV3U2V0dGluZ3MoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB1c2VOZXdTZXR0aW5ncygpIHtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSk7XG4gICAgICAgIHZhciBidXR0b25zO1xuXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgc2V0dGluZ3Mud2FsbHBhcGVyICsgXCIpXCI7XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmhpZGVEb2NrID09PSBcImZhbHNlXCIpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5zdHlsZS5oZWlnaHQgPSBcIjYwcHhcIjtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuY2hpbGRyZW47XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5zdHlsZS5oZWlnaHQgPSBcIjBweFwiO1xuICAgICAgICAgICAgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jaGlsZHJlbjtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBidXR0b25zW2ldLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MuZG9ja1Bvc2l0aW9uID09PSBcInRvcFwiKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuY2xhc3NOYW1lID0gXCJkb2NrVG9wXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuY2xhc3NOYW1lID0gXCJkb2NrQm90dG9tXCI7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaCA9IHNldHRpbmdzO1xuIiwibW9kdWxlLmV4cG9ydHM9W1xuICAgIHtcImlkXCI6IFwiaW5zdGFDaGF0XCIsIFwiaW1nXCI6IFwiLi4vaW1hZ2UvaW5zdGFDaGF0LnBuZ1wiLCBcImJhY2tncm91bmRDb2xvclwiOiBcInllbGxvd2dyZWVuXCJ9LFxuICAgIHtcImlkXCI6IFwibWVtb3J5R2FtZVwiLCBcImltZ1wiOiBcIi4uL2ltYWdlL3Rlc3RBcHAucG5nXCIsIFwiYmFja2dyb3VuZENvbG9yXCI6IFwibGlnaHRibHVlXCJ9LFxuICAgIHtcImlkXCI6IFwic2V0dGluZ3NcIiwgXCJpbWdcIjogXCIuLi9pbWFnZS9zZXR0aW5ncy5wbmdcIiwgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCJ5ZWxsb3dcIn1cbl1cblxuIiwibW9kdWxlLmV4cG9ydHM9e1xuICAgIFwid2FsbHBhcGVyXCI6IFwiLi4vaW1hZ2Uvd2FsbHBhcGVyLmpwZ1wiLFxuICAgIFwiaGlkZURvY2tcIjogXCJmYWxzZVwiLFxuICAgIFwiZG9ja1Bvc2l0aW9uXCI6IFwiYm90dG9tXCJcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuLy9UT0RPIFN0w6RkYSB1cHAgc8OlIFVSTGVuIGludGUgZsO2csOkbmRyYXMuXG4vL1RPRE8gRsO2cnPDtmsgcmVuc2EgdXBwIHPDpSBta3QgaHRtbCBvY2ggY3NzIGZyw6VuIGphdmFzY3JpcHRrb2Rlbi5cbi8vVE9ETyBLb2xsYSB2YXIgZMOkciBrYW4gYmVow7Z2YXMgbWVkIGZlZWRiYWNrXG5cbnZhciBkb2NrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpO1xudmFyIGJ1dHRvbnMgPSBbXTtcbnZhciBsYXVuY2hlciA9IHJlcXVpcmUoXCIuL2xhdW5jaGVyXCIpO1xuXG52YXIgYXBwbGljYXRpb25zID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zTGlzdFwiKTtcblxuZnVuY3Rpb24gY2VudHJhbGl6ZSgpIHtcbiAgICB2YXIgd2lkdGggPSBkb2NrLm9mZnNldFdpZHRoO1xuICAgIGRvY2suc3R5bGUubWFyZ2luTGVmdCA9ICh3aWR0aCAvIDIpICogLTE7XG59XG5cbmZ1bmN0aW9uIGRvY2tIaWRlU2hvdygpIHtcbiAgICB2YXIgaTtcblxuICAgIGRvY2suYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3ZlclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZG9jay5zdHlsZS5oZWlnaHQgPSBcIjYwcHhcIjtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZG9jay5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdXRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBoaWRlRG9jayA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSkuaGlkZURvY2s7XG5cbiAgICAgICAgaWYgKGhpZGVEb2NrID09PSBcInRydWVcIikge1xuICAgICAgICAgICAgZG9jay5zdHlsZS5oZWlnaHQgPSBcIjBweFwiO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRCdXR0b24oYXBwKSB7XG4gICAgZG9jay5zdHlsZS53aWR0aCA9IGRvY2sub2Zmc2V0V2lkdGggKyA0NTtcbiAgICB2YXIgYnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBidXR0b24uY2xhc3NOYW1lID0gXCJhcHBCdXR0b25cIjtcbiAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYXBwLmJhY2tncm91bmRDb2xvcjtcbiAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXCIgKyBhcHAuaW1nICsgXCIpXCI7XG4gICAgZG9jay5hcHBlbmRDaGlsZChidXR0b24pO1xuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgbGF1bmNoZXIubGF1bmNoZXIoYXBwKTtcbiAgICB9KTtcblxuICAgIGJ1dHRvbnMucHVzaChidXR0b24pO1xufVxuXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3MoKSB7XG4gICAgdmFyIHNldHRpbmdzO1xuICAgIGlmICghbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIlBXRFNldHRpbmdzXCIsIEpTT04uc3RyaW5naWZ5KHJlcXVpcmUoXCIuL2RlZmF1bHRTZXR0aW5ncy5qc29uXCIpKSk7XG4gICAgfVxuXG4gICAgc2V0dGluZ3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgc2V0dGluZ3Mud2FsbHBhcGVyICsgXCIpXCI7XG5cbiAgICBpZiAoc2V0dGluZ3MuZG9ja1Bvc2l0aW9uID09PSBcInRvcFwiKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jbGFzc0xpc3QuYWRkKFwiZG9ja1RvcFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuY2xhc3NMaXN0LmFkZChcImRvY2tCb3R0b21cIik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIHZhciBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGFwcGxpY2F0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhZGRCdXR0b24oYXBwbGljYXRpb25zW2ldKTtcbiAgICB9XG5cbiAgICBsb2FkU2V0dGluZ3MoKTtcbiAgICBjZW50cmFsaXplKCk7XG4gICAgZG9ja0hpZGVTaG93KCk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGluaXQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHB3ZFdpbmRvdyA9IHJlcXVpcmUoXCIuL3dpbmRvd1wiKTtcblxuZnVuY3Rpb24gQXBwbGljYXRpb25zKCkge1xuICAgIHRoaXMuaW5zdGFDaGF0ID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcFwiKTtcbiAgICAgICAgYXBwLmxhdW5jaChjb250YWluZXIpO1xuICAgIH07XG5cbiAgICB0aGlzLm1lbW9yeUdhbWUgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9tZW1vcnlHYW1lL2FwcFwiKTtcbiAgICAgICAgYXBwLmxhdW5jaChjb250YWluZXIpO1xuICAgIH07XG5cbiAgICB0aGlzLnNldHRpbmdzID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvc2V0dGluZ3MvYXBwXCIpO1xuICAgICAgICBhcHAubGF1bmNoKGNvbnRhaW5lcik7XG4gICAgfTtcblxuICAgIC8vVE9ETyBUYSBib3J0IGFsbHQgaSBmw7Zuc3RyZXQgaW5uYW5cbiAgICB0aGlzLmVycm9yID0gZnVuY3Rpb24oY29udGFpbmVyLCBlcnIpIHtcbiAgICAgICAgdmFyIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShlcnIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dCk7XG4gICAgfTtcbn1cblxuZnVuY3Rpb24gbGF1bmNoZXIoYXBwKSB7XG4gICAgdmFyIGNvbnRhaW5lcjtcbiAgICB2YXIgYXBwbGljYXRpb25zO1xuXG4gICAgY29udGFpbmVyID0gcHdkV2luZG93LmNyZWF0ZVdpbmRvdyhhcHApO1xuICAgIGFwcGxpY2F0aW9ucyA9IG5ldyBBcHBsaWNhdGlvbnMoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGFwcGxpY2F0aW9uc1thcHAuaWRdKGNvbnRhaW5lcik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGFwcGxpY2F0aW9ucy5lcnJvcihjb250YWluZXIsIGVycik7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2hlciA9IGxhdW5jaGVyO1xuXG4iLCIvL1RPRE8gR8O2ciBzw6UgYXR0IGbDtm5zdGVybmEgaW50ZSBrYW4gZ8OlIHV0YW5mw7ZyIHNrw6RybWVuLlxuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGxhc3RJbmRleCA9IDA7XG52YXIgb2Zmc2V0WCA9IDA7XG52YXIgb2Zmc2V0WSA9IDA7XG52YXIgcG9zaXRpb25YID0gMDtcbnZhciBwb3NpdGlvblkgPSAwO1xudmFyIGVsZW1lbnQ7XG5cbmZ1bmN0aW9uIGdyYWJFbGVtZW50KHRhcmdldCkge1xuICAgIGVsZW1lbnQgPSB0YXJnZXQ7XG4gICAgb2Zmc2V0WCA9IHBvc2l0aW9uWCAtIGVsZW1lbnQub2Zmc2V0TGVmdDtcbiAgICBvZmZzZXRZID0gcG9zaXRpb25ZIC0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgbGFzdEluZGV4ICs9IDE7XG4gICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG59XG5cbmZ1bmN0aW9uIG1vdmVFbGVtZW50KGV2ZW50KSB7XG4gICAgcG9zaXRpb25YID0gZXZlbnQuY2xpZW50WDtcbiAgICBwb3NpdGlvblkgPSBldmVudC5jbGllbnRZO1xuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IHBvc2l0aW9uWCAtIChvZmZzZXRYICsgMikgKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gcG9zaXRpb25ZIC0gKG9mZnNldFkgKyAyKSArIFwicHhcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbGVhc2VFbGVtZW50KCkge1xuICAgIGVsZW1lbnQgPSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGFkZFRlbXBsYXRlKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgIHZhciBjb250YWluZXI7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJOYW1lKTtcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGVtcGxhdGVOYW1lKTtcbiAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdpbmRvdyhhcHApIHtcbiAgICB2YXIgdG9wYmFyO1xuICAgIHZhciBhcHBXaW5kb3c7XG5cbiAgICBhZGRUZW1wbGF0ZShcIiNhcHBXaW5kb3dUZW1wbGF0ZVwiLCBcImJvZHlcIik7XG5cbiAgICBhcHBXaW5kb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKVtkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKS5sZW5ndGggLSAxXTtcbiAgICB0b3BiYXIgPSBhcHBXaW5kb3cucXVlcnlTZWxlY3RvcihcIi50b3BiYXJcIik7XG5cbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBhcHBXaW5kb3cuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xuXG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuYXBwSWNvblwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgYXBwLmltZyk7XG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuYXBwVGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwLmlkKSk7XG5cbiAgICBhcHBXaW5kb3cuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYXBwLmJhY2tncm91bmRDb2xvcjtcblxuICAgIHRvcGJhci5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBncmFiRWxlbWVudChhcHBXaW5kb3cpO1xuICAgIH0pO1xuXG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZUVsZW1lbnQpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsIHJlbGVhc2VFbGVtZW50KTtcblxuICAgIGFwcFdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGxhc3RJbmRleCArPSAxO1xuICAgICAgICBhcHBXaW5kb3cuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xuICAgIH0pO1xuXG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VXaW5kb3dCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhcHBXaW5kb3cucmVtb3ZlKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXBwV2luZG93O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVXaW5kb3cgPSBjcmVhdGVXaW5kb3c7XG4iXX0=
