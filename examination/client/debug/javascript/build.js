(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var dock = require("./pwd");
dock.init();

},{"./pwd":8}],2:[function(require,module,exports){
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

        template = document.querySelector("#instaChatTemplate");
        node = document.importNode(template.content, true);
        container.appendChild(node);

        template = document.querySelector("#channelSelectTempalte");
        node = document.importNode(template.content.firstElementChild, true);

        container.querySelector(".topbar").appendChild(node);

        node.addEventListener("change", function() {
            var selected;
            options = node.children;

            selected = node.options[node.selectedIndex];

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
        var time = date.getHours() + ":";
        if (date.getMinutes() < 10) {
            time += 0;
        }

        time += date.getMinutes();

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
                reject("An error has occured");
            });

            socket.addEventListener("message", function(event) {
                var message = JSON.parse(event.data);

                if (message.type === "message") {
                    if (message.channel === config.channel) {
                        printMessage(message);
                    }
                } else if (message.type === "notification") {
                    printNotification(message.data + " Welcome " + sessionStorage.getItem("username"), true);
                }

                container.scrollTo(0, 100);
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
"use strict";

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
        var credits;
        var i;
        var boardSize;

        template = document.querySelector("#memoryGameStartTemplate");
        div = document.importNode(template.content.firstElementChild, true);

        template = div.querySelector("#memoryCreditsTemplate");
        credits = document.importNode(template.content, true);
        div.appendChild(credits);

        container.appendChild(div);

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

            if (cols === 2) {
                a.firstElementChild.className = "brickWidth2";
            } else if (cols === 4) {
                a.firstElementChild.className = "brickWidth4";
            }

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
        var credits;

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
"use strict";

function settings(container) {
    var form;
    var inputs;
    var template;

    template = document.querySelector("#settingsTemplate");
    form = document.importNode(template.content.firstElementChild, true);
    inputs = form.querySelectorAll("input");

    container.appendChild(form);

    fillFormWithData();

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        apply();
    });

    form.addEventListener("change", function(event) {
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
        fillFormWithData();
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
    {"id": "memoryGame", "img": "../image/testApp.png", "backgroundColor": "cornflowerBlue"},
    {"id": "settings", "img": "../image/settings.png", "backgroundColor": "Gold"}
]


},{}],6:[function(require,module,exports){
module.exports={
    "wallpaper": "../image/wallpaper.jpg",
    "hideDock": "false",
    "dockPosition": "bottom"
}

},{}],7:[function(require,module,exports){
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


},{"./applications/instaChat/app":2,"./applications/memoryGame/app":3,"./applications/settings/app":4,"./window":9}],8:[function(require,module,exports){
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
    var template;
    var button;

    template = document.querySelector("#appButtonTemplate");
    button = document.importNode(template.content.firstElementChild, false);

    button.className = "appButton";
    button.style.backgroundColor = app.backgroundColor;
    button.style.backgroundImage = "url(" + app.img + ")";
    dock.appendChild(button);
    dock.style.width = dock.offsetWidth + 45;

    button.addEventListener("click", function(evemt) {
        event.preventDefault();
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

},{"./applicationsList":5,"./defaultSettings.json":6,"./launcher":7}],9:[function(require,module,exports){
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
        var newLeft = positionX - (offsetX + 2);
        var newTop = positionY - (offsetY + 2);

        newLeft = newLeft < 0 ? 0 : newLeft;
        newTop = newTop < 0 ? 0 : newTop;

        element.style.left = newLeft + "px";
        element.style.top = newTop + "px";
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

    topbar.querySelector(".closeWindowButton").addEventListener("click", function(event) {
        event.preventDefault();
        appWindow.remove();
    });

    return appWindow;
}

module.exports.createWindow = createWindow;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvc2V0dGluZ3MvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnNMaXN0Lmpzb24iLCJjbGllbnQvc291cmNlL2pzL2RlZmF1bHRTZXR0aW5ncy5qc29uIiwiY2xpZW50L3NvdXJjZS9qcy9sYXVuY2hlci5qcyIsImNsaWVudC9zb3VyY2UvanMvcHdkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy93aW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGRvY2sgPSByZXF1aXJlKFwiLi9wd2RcIik7XG5kb2NrLmluaXQoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBpbnN0YUNoYXQoY29udGFpbmVyKSB7XG5cbiAgICB2YXIgc29ja2V0ID0gbnVsbDtcbiAgICB2YXIgY29uZmlnID0ge1xuICAgICAgICBhZHJlc3M6IFwid3M6Ly92aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIixcbiAgICAgICAga2V5OiBcImVEQkU3NmRlVTdMMEg5bUVCZ3hVS1ZSMFZDbnEwWEJkXCIsXG4gICAgICAgIGNoYW5uZWw6IFwiXCJcbiAgICB9O1xuXG4gICAgbG9naW4oKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25uZWN0KCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHByaW50T3BlcmF0aW9uc1NjcmVlbigpO1xuICAgICAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dEFyZWFcIikuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbmQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBwcmludExvZ2luU2NyZWVuKCkge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBub2RlO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNpbnN0YUNoYXRMb2dpblRlbXBsYXRlXCIpO1xuICAgICAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50T3BlcmF0aW9uc1NjcmVlbigpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgbm9kZTtcbiAgICAgICAgdmFyIG9wdGlvbnM7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdFRlbXBsYXRlXCIpO1xuICAgICAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGFubmVsU2VsZWN0VGVtcGFsdGVcIik7XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLnRvcGJhclwiKS5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWQ7XG4gICAgICAgICAgICBvcHRpb25zID0gbm9kZS5jaGlsZHJlbjtcblxuICAgICAgICAgICAgc2VsZWN0ZWQgPSBub2RlLm9wdGlvbnNbbm9kZS5zZWxlY3RlZEluZGV4XTtcblxuICAgICAgICAgICAgY29uZmlnLmNoYW5uZWwgPSBzZWxlY3RlZC52YWx1ZTtcbiAgICAgICAgICAgIHByaW50Tm90aWZpY2F0aW9uKFwiU3dpdGNoZWQgdG8gXCIgKyBzZWxlY3RlZC5maXJzdENoaWxkLmRhdGEgKyBcIiBjaGFubmVsXCIsIGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgZnJhZ21lbnQ7XG4gICAgICAgIHZhciBtZXNzYWdlRWxlbWVudDtcbiAgICAgICAgdmFyIHVzZXJuYW1lRWxlbWVudDtcbiAgICAgICAgdmFyIGNoYXRCb3ggPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jaGF0Qm94XCIpO1xuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHZhciB0aW1lID0gZGF0ZS5nZXRIb3VycygpICsgXCI6XCI7XG4gICAgICAgIGlmIChkYXRlLmdldE1pbnV0ZXMoKSA8IDEwKSB7XG4gICAgICAgICAgICB0aW1lICs9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB0aW1lICs9IGRhdGUuZ2V0TWludXRlcygpO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZXNzYWdlVGVtcGxhdGVcIik7XG4gICAgICAgIGZyYWdtZW50ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcblxuICAgICAgICB1c2VybmFtZUVsZW1lbnQgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKFwiLnVzZXJuYW1lXCIpO1xuICAgICAgICBtZXNzYWdlRWxlbWVudCA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZVwiKTtcblxuICAgICAgICBpZiAobWVzc2FnZS51c2VybmFtZSA9PT0gc2Vzc2lvblN0b3JhZ2UudXNlcm5hbWUpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UudXNlcm5hbWUgPSBcIllvdVwiO1xuICAgICAgICAgICAgdXNlcm5hbWVFbGVtZW50LmNsYXNzTmFtZSArPSBcIiB1c2VybmFtZVNlbnRcIjtcbiAgICAgICAgICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTmFtZSArPSBcIiBtZXNzYWdlU2VudFwiO1xuICAgICAgICB9XG5cbiAgICAgICAgdXNlcm5hbWVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UudXNlcm5hbWUgKyBcIiBcIiArIHRpbWUpKTtcbiAgICAgICAgbWVzc2FnZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZS5kYXRhKSk7XG5cbiAgICAgICAgY2hhdEJveC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnROb3RpZmljYXRpb24obWVzc2FnZSwgdGVtcG9yYXJ5KSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbm90aWZpY2F0aW9uVGVtcGxhdGVcIik7XG4gICAgICAgIHZhciBub3RpZmljYXRpb24gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgICAgICB2YXIgdGV4dDtcblxuICAgICAgICB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSk7XG5cbiAgICAgICAgbm90aWZpY2F0aW9uLmFwcGVuZENoaWxkKHRleHQpO1xuXG4gICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmNoYXRCb3hcIikuYXBwZW5kQ2hpbGQobm90aWZpY2F0aW9uKTtcblxuICAgICAgICBpZiAodGVtcG9yYXJ5KSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbi5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0sIDUwMDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbG9naW4oKSB7XG4gICAgICAgIHByaW50TG9naW5TY3JlZW4oKTtcbiAgICAgICAgdmFyIGxvZ2luRGl2ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuaW5zdGFDaGF0TG9naW5cIik7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcblxuICAgICAgICAgICAgaWYgKHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lKSB7XG4gICAgICAgICAgICAgICAgbG9naW5EaXYucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbG9naW5EaXYuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC50YXJnZXQudmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9naW5EaXYucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5hbGVydFRleHRcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJQbGVhc2UgZW50ZXIgYSB1c2VybmFtZSFcIikpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGNvbm5lY3QoKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoY29uZmlnLmFkcmVzcyk7XG4gICAgICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm9wZW5cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VXaW5kb3dCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoXCJBbiBlcnJvciBoYXMgb2NjdXJlZFwiKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcIm1lc3NhZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXZlbnQuZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSBcIm1lc3NhZ2VcIikge1xuICAgICAgICAgICAgICAgICAgICBpZiAobWVzc2FnZS5jaGFubmVsID09PSBjb25maWcuY2hhbm5lbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJpbnRNZXNzYWdlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtZXNzYWdlLnR5cGUgPT09IFwibm90aWZpY2F0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbnROb3RpZmljYXRpb24obWVzc2FnZS5kYXRhICsgXCIgV2VsY29tZSBcIiArIHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJ1c2VybmFtZVwiKSwgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvKDAsIDEwMCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gc2VuZCh0ZXh0KSB7XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgICAgICBkYXRhOiB0ZXh0LFxuICAgICAgICAgICAgdXNlcm5hbWU6IHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lLFxuICAgICAgICAgICAgY2hhbm5lbDogY29uZmlnLmNoYW5uZWwsXG4gICAgICAgICAgICBrZXk6IGNvbmZpZy5rZXlcbiAgICAgICAgfTtcbiAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoID0gaW5zdGFDaGF0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIG1lbW9yeUdhbWUoY29udGFpbmVyKSB7XG4gICAgdmFyIGdhbWVCb2FyZDtcbiAgICB2YXIgcm93cztcbiAgICB2YXIgY29scztcbiAgICB2YXIgdHVybjE7XG4gICAgdmFyIHR1cm4yO1xuICAgIHZhciBsYXN0VGlsZTtcbiAgICB2YXIgcGFpcnMgPSAwO1xuICAgIHZhciB0cmllcyA9IDA7XG5cbiAgICBwcmludFN0YXJ0U2NyZWVuKCkudGhlbihmdW5jdGlvbihib2FyZFNpemUpIHtcbiAgICAgICAgdmFyIHNpemU7XG4gICAgICAgIHNpemUgPSBib2FyZFNpemUuc3BsaXQoXCJ4XCIpO1xuICAgICAgICByb3dzID0gcGFyc2VJbnQoc2l6ZVswXSk7XG4gICAgICAgIGNvbHMgPSBwYXJzZUludChzaXplWzFdKTtcbiAgICAgICAgcGxheUdhbWUoKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHBsYXlHYW1lKCkge1xuICAgICAgICB2YXIgdGlsZXMgPSBnZXRCcmlja3NBcnJheSgpO1xuICAgICAgICBnYW1lQm9hcmQgPSBwcmludEdhbWVTY3JlZW4odGlsZXMpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ2FtZUJvYXJkKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludFN0YXJ0U2NyZWVuKCkge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBkaXY7XG4gICAgICAgIHZhciBjcmVkaXRzO1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgdmFyIGJvYXJkU2l6ZTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5R2FtZVN0YXJ0VGVtcGxhdGVcIik7XG4gICAgICAgIGRpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkaXYucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlDcmVkaXRzVGVtcGxhdGVcIik7XG4gICAgICAgIGNyZWRpdHMgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoY3JlZGl0cyk7XG5cbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlIChmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAxOyBpIDwgNDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgZGl2LmNoaWxkcmVuW2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBib2FyZFNpemUgPSB0aGlzLmZpcnN0Q2hpbGQubGFzdENoaWxkLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgZGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGJvYXJkU2l6ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50R2FtZVNjcmVlbih0aWxlcykge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciB0ZW1wbGF0ZUNvbnRlbnQ7XG4gICAgICAgIHZhciBkaXY7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUJyaWNrVGVtcGxhdGVcIik7XG4gICAgICAgIHRlbXBsYXRlQ29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUdhbWVUZW1wbGF0ZVwiKTtcbiAgICAgICAgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICB0aWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHRpbGUsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgYTtcblxuICAgICAgICAgICAgYSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVDb250ZW50LCB0cnVlKTtcbiAgICAgICAgICAgIGFkZEdhbWVNZWNoYW5pY3MoYSwgdGlsZSwgaW5kZXgpO1xuICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGEpO1xuXG4gICAgICAgICAgICBpZiAoY29scyA9PT0gMikge1xuICAgICAgICAgICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuY2xhc3NOYW1lID0gXCJicmlja1dpZHRoMlwiO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChjb2xzID09PSA0KSB7XG4gICAgICAgICAgICAgICAgYS5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc05hbWUgPSBcImJyaWNrV2lkdGg0XCI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgoaW5kZXggKyAxKSAlIGNvbHMgPT09IDApIHtcbiAgICAgICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImJyXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGRpdjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBhZGRHYW1lTWVjaGFuaWNzKGEsIHRpbGUsIGluZGV4KSB7XG4gICAgICAgIGEuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgaW1nO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaW1nID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSBcIklNR1wiID8gZXZlbnQudGFyZ2V0IDogZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgICAgICBnYW1lTG9naWModGlsZSwgaW5kZXgsIGltZyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJyaWNrc0FycmF5KCkge1xuICAgICAgICB2YXIgYXJyID0gW107XG4gICAgICAgIHZhciB0ZW1wO1xuICAgICAgICB2YXIgaTtcblxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IChyb3dzICogY29scykgLyAyOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSBhcnIubGVuZ3RoIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgdmFyIHJhbmRvbU51bWJlciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpO1xuICAgICAgICAgICAgdGVtcCA9IGFycltpXTtcbiAgICAgICAgICAgIGFycltpXSA9IGFycltyYW5kb21OdW1iZXJdO1xuICAgICAgICAgICAgYXJyW3JhbmRvbU51bWJlcl0gPSB0ZW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnYW1lTG9naWModGlsZSwgaW5kZXgsIGltZykge1xuICAgICAgICBpZiAodHVybjIpIHtyZXR1cm47fVxuXG4gICAgICAgIGltZy5zcmMgPSBcImltYWdlL1wiICsgdGlsZSArIFwiLnBuZ1wiO1xuXG4gICAgICAgIGlmICghdHVybjEpIHtcbiAgICAgICAgICAgIHR1cm4xID0gaW1nO1xuICAgICAgICAgICAgbGFzdFRpbGUgPSB0aWxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGltZyA9PT0gdHVybjEpIHtyZXR1cm47fVxuXG4gICAgICAgICAgICB0cmllcyArPSAxO1xuXG4gICAgICAgICAgICB0dXJuMiA9IGltZztcbiAgICAgICAgICAgIGlmICh0aWxlID09PSBsYXN0VGlsZSkge1xuICAgICAgICAgICAgICAgIHBhaXJzICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFpcnMgPT09IChjb2xzICogcm93cykgLyAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVCb2FyZC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbnRIaWdoU2NvcmVTY3JlZW4oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcInJlbW92ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwicmVtb3ZlXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIHR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEuc3JjID0gXCJpbWFnZS8wLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMi5zcmMgPSBcImltYWdlLzAucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludEhpZ2hTY29yZVNjcmVlbigpIHtcbiAgICAgICAgdmFyIHN0b3JhZ2VOYW1lID0gXCJtZW1vcnlcIiArIHJvd3MgKyBcInhcIiArIGNvbHM7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIGdhbWVFbmREaXY7XG4gICAgICAgIHZhciBoaWdoU2NvcmU7XG4gICAgICAgIHZhciBjcmVkaXRzO1xuXG4gICAgICAgIGhpZ2hTY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZU5hbWUpKTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5R2FtZUVuZFRlbXBsYXRlXCIpO1xuICAgICAgICBnYW1lRW5kRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuc2F2ZUhpZ2hzY29yZUZvcm1cIikuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHNhdmVIaWdoU2NvcmUoZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRcIilbMF0udmFsdWUpO1xuICAgICAgICAgICAgZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiLnNhdmVIaWdoc2NvcmVGb3JtXCIpLnJlbW92ZSgpO1xuICAgICAgICAgICAgcHJpbnRIaWdoU2NvcmUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJpbnRIaWdoU2NvcmUoKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdhbWVFbmREaXYpO1xuXG4gICAgICAgIGZ1bmN0aW9uIHByaW50SGlnaFNjb3JlKCkge1xuICAgICAgICAgICAgaGlnaFNjb3JlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShzdG9yYWdlTmFtZSkpO1xuICAgICAgICAgICAgdmFyIG9sZFNjb3JlID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuaGlnaFNjb3JlXCIpO1xuICAgICAgICAgICAgaWYgKG9sZFNjb3JlKSB7XG4gICAgICAgICAgICAgICAgb2xkU2NvcmUucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChoaWdoU2NvcmUpIHtcbiAgICAgICAgICAgICAgICB2YXIgaTtcbiAgICAgICAgICAgICAgICB2YXIgc2NvcmU7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgPSBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIjaGlnaFNjb3JlVGVtcGF0ZVwiKTtcbiAgICAgICAgICAgICAgICB2YXIgc2NvcmVCb2FyZCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaGlnaFNjb3JlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3JlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJOaWNrbmFtZTogXCIgKyBoaWdoU2NvcmVbaV0ubmlja25hbWUgKyBcIiB8IFRyaWVzOiBcIiArIGhpZ2hTY29yZVtpXS50cmllcyk7XG4gICAgICAgICAgICAgICAgICAgIHNjb3JlQm9hcmQuY2hpbGRyZW5baV0uYXBwZW5kQ2hpbGQoc2NvcmUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGdhbWVFbmREaXYuYXBwZW5kQ2hpbGQoc2NvcmVCb2FyZCk7XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGUgPSBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIjbm9IaWdoU2NvcmVUZW1wYXRlXCIpO1xuICAgICAgICAgICAgICAgIGdhbWVFbmREaXYuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzYXZlSGlnaFNjb3JlKG5pY2tuYW1lKSB7XG4gICAgICAgICAgICBpZiAoaGlnaFNjb3JlKSB7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlLnB1c2goe25pY2tuYW1lOiBuaWNrbmFtZSwgdHJpZXM6IHRyaWVzfSk7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKGEudHJpZXMpIC0gTnVtYmVyKGIudHJpZXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlLnNwbGljZSg1LCAxKTtcblxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VOYW1lLCBKU09OLnN0cmluZ2lmeShoaWdoU2NvcmUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlID0gW1xuICAgICAgICAgICAgICAgICAgICB7bmlja25hbWU6IG5pY2tuYW1lLCB0cmllczogdHJpZXN9XG4gICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VOYW1lLCBKU09OLnN0cmluZ2lmeShoaWdoU2NvcmUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoID0gbWVtb3J5R2FtZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBzZXR0aW5ncyhjb250YWluZXIpIHtcbiAgICB2YXIgZm9ybTtcbiAgICB2YXIgaW5wdXRzO1xuICAgIHZhciB0ZW1wbGF0ZTtcblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZXR0aW5nc1RlbXBsYXRlXCIpO1xuICAgIGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGlucHV0cyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xuXG4gICAgZmlsbEZvcm1XaXRoRGF0YSgpO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGFwcGx5KCk7XG4gICAgfSk7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaW5wdXRzWzVdLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGlucHV0c1s2XS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgaW5wdXRzWzVdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgYXBwbHkoKTtcbiAgICB9KTtcbiAgICBpbnB1dHNbNl0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBmaWxsRm9ybVdpdGhEYXRhKCk7XG4gICAgfSk7XG4gICAgaW5wdXRzWzddLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzZXRUb0RlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGZpbGxGb3JtV2l0aERhdGEoKSB7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSk7XG5cbiAgICAgICAgaW5wdXRzWzBdLnZhbHVlID0gc2V0dGluZ3Mud2FsbHBhcGVyO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5oaWRlRG9jayA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIGlucHV0c1sxXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0c1syXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncy5kb2NrUG9zaXRpb24gPT09IFwidG9wXCIpIHtcbiAgICAgICAgICAgIGlucHV0c1szXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0c1s0XS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlucHV0c1s1XS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIGlucHV0c1s2XS5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXBwbHkoKXtcbiAgICAgICAgdmFyIG5ld1NldHRpbmcgPSB7XG4gICAgICAgICAgICB3YWxscGFwZXI6IGlucHV0c1swXS52YWx1ZSxcbiAgICAgICAgICAgIGhpZGVEb2NrOiBpbnB1dHNbMV0uY2hlY2tlZCA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiLFxuICAgICAgICAgICAgZG9ja1Bvc2l0aW9uOiBpbnB1dHNbM10uY2hlY2tlZCA/IFwidG9wXCIgOiBcImJvdHRvbVwiXG4gICAgICAgIH07XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiUFdEU2V0dGluZ3NcIiwgSlNPTi5zdHJpbmdpZnkobmV3U2V0dGluZykpO1xuICAgICAgICB1c2VOZXdTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0VG9EZWZhdWx0KCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIlBXRFNldHRpbmdzXCIsIEpTT04uc3RyaW5naWZ5KHJlcXVpcmUoXCIuLi8uLi9kZWZhdWx0U2V0dGluZ3MuanNvblwiKSkpO1xuICAgICAgICBmaWxsRm9ybVdpdGhEYXRhKCk7XG4gICAgICAgIHVzZU5ld1NldHRpbmdzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXNlTmV3U2V0dGluZ3MoKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpO1xuICAgICAgICB2YXIgYnV0dG9ucztcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIHNldHRpbmdzLndhbGxwYXBlciArIFwiKVwiO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5oaWRlRG9jayA9PT0gXCJmYWxzZVwiKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuc3R5bGUuaGVpZ2h0ID0gXCI2MHB4XCI7XG4gICAgICAgICAgICBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuY2hpbGRyZW47XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjBweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmRvY2tQb3NpdGlvbiA9PT0gXCJ0b3BcIikge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNsYXNzTmFtZSA9IFwiZG9ja1RvcFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNsYXNzTmFtZSA9IFwiZG9ja0JvdHRvbVwiO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBzZXR0aW5ncztcbiIsIm1vZHVsZS5leHBvcnRzPVtcbiAgICB7XCJpZFwiOiBcImluc3RhQ2hhdFwiLCBcImltZ1wiOiBcIi4uL2ltYWdlL2luc3RhQ2hhdC5wbmdcIiwgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCJ5ZWxsb3dncmVlblwifSxcbiAgICB7XCJpZFwiOiBcIm1lbW9yeUdhbWVcIiwgXCJpbWdcIjogXCIuLi9pbWFnZS90ZXN0QXBwLnBuZ1wiLCBcImJhY2tncm91bmRDb2xvclwiOiBcImNvcm5mbG93ZXJCbHVlXCJ9LFxuICAgIHtcImlkXCI6IFwic2V0dGluZ3NcIiwgXCJpbWdcIjogXCIuLi9pbWFnZS9zZXR0aW5ncy5wbmdcIiwgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCJHb2xkXCJ9XG5dXG5cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcIndhbGxwYXBlclwiOiBcIi4uL2ltYWdlL3dhbGxwYXBlci5qcGdcIixcbiAgICBcImhpZGVEb2NrXCI6IFwiZmFsc2VcIixcbiAgICBcImRvY2tQb3NpdGlvblwiOiBcImJvdHRvbVwiXG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHB3ZFdpbmRvdyA9IHJlcXVpcmUoXCIuL3dpbmRvd1wiKTtcblxuZnVuY3Rpb24gQXBwbGljYXRpb25zKCkge1xuICAgIHRoaXMuaW5zdGFDaGF0ID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcFwiKTtcbiAgICAgICAgYXBwLmxhdW5jaChjb250YWluZXIpO1xuICAgIH07XG5cbiAgICB0aGlzLm1lbW9yeUdhbWUgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9tZW1vcnlHYW1lL2FwcFwiKTtcbiAgICAgICAgYXBwLmxhdW5jaChjb250YWluZXIpO1xuICAgIH07XG5cbiAgICB0aGlzLnNldHRpbmdzID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvc2V0dGluZ3MvYXBwXCIpO1xuICAgICAgICBhcHAubGF1bmNoKGNvbnRhaW5lcik7XG4gICAgfTtcblxuXG4gICAgdGhpcy5lcnJvciA9IGZ1bmN0aW9uKGNvbnRhaW5lciwgZXJyKSB7XG4gICAgICAgIHZhciBlbGVtZW50cyA9IGNvbnRhaW5lci5jaGlsZHJlbjtcbiAgICAgICAgdmFyIHRleHQ7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgZWxlbWVudHNbaV0ucmVtb3ZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0ZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZXJyKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRleHQpO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGxhdW5jaGVyKGFwcCkge1xuICAgIHZhciBjb250YWluZXI7XG4gICAgdmFyIGFwcGxpY2F0aW9ucztcblxuICAgIGNvbnRhaW5lciA9IHB3ZFdpbmRvdy5jcmVhdGVXaW5kb3coYXBwKTtcbiAgICBhcHBsaWNhdGlvbnMgPSBuZXcgQXBwbGljYXRpb25zKCk7XG5cbiAgICB0cnkge1xuICAgICAgICBhcHBsaWNhdGlvbnNbYXBwLmlkXShjb250YWluZXIpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICBhcHBsaWNhdGlvbnMuZXJyb3IoY29udGFpbmVyLCBlcnIpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoZXIgPSBsYXVuY2hlcjtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vVE9ETyBGw7Zyc8O2ayByZW5zYSB1cHAgc8OlIG1rdCBodG1sIG9jaCBjc3MgZnLDpW4gamF2YXNjcmlwdGtvZGVuLlxuXG52YXIgZG9jayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKTtcbnZhciBidXR0b25zID0gW107XG52YXIgbGF1bmNoZXIgPSByZXF1aXJlKFwiLi9sYXVuY2hlclwiKTtcblxudmFyIGFwcGxpY2F0aW9ucyA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9uc0xpc3RcIik7XG5cbmZ1bmN0aW9uIGNlbnRyYWxpemUoKSB7XG4gICAgdmFyIHdpZHRoID0gZG9jay5vZmZzZXRXaWR0aDtcbiAgICBkb2NrLnN0eWxlLm1hcmdpbkxlZnQgPSAod2lkdGggLyAyKSAqIC0xO1xufVxuXG5mdW5jdGlvbiBkb2NrSGlkZVNob3coKSB7XG4gICAgdmFyIGk7XG5cbiAgICBkb2NrLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCI2MHB4XCI7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRvY2suYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGlkZURvY2sgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpLmhpZGVEb2NrO1xuXG4gICAgICAgIGlmIChoaWRlRG9jayA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBidXR0b25zW2ldLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkQnV0dG9uKGFwcCkge1xuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB2YXIgYnV0dG9uO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FwcEJ1dHRvblRlbXBsYXRlXCIpO1xuICAgIGJ1dHRvbiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgZmFsc2UpO1xuXG4gICAgYnV0dG9uLmNsYXNzTmFtZSA9IFwiYXBwQnV0dG9uXCI7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFwcC5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgYXBwLmltZyArIFwiKVwiO1xuICAgIGRvY2suYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICBkb2NrLnN0eWxlLndpZHRoID0gZG9jay5vZmZzZXRXaWR0aCArIDQ1O1xuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVtdCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsYXVuY2hlci5sYXVuY2hlcihhcHApO1xuICAgIH0pO1xuXG4gICAgYnV0dG9ucy5wdXNoKGJ1dHRvbik7XG59XG5cbmZ1bmN0aW9uIGxvYWRTZXR0aW5ncygpIHtcbiAgICB2YXIgc2V0dGluZ3M7XG4gICAgaWYgKCFsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIlBXRFNldHRpbmdzXCIpKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiUFdEU2V0dGluZ3NcIiwgSlNPTi5zdHJpbmdpZnkocmVxdWlyZShcIi4vZGVmYXVsdFNldHRpbmdzLmpzb25cIikpKTtcbiAgICB9XG5cbiAgICBzZXR0aW5ncyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXCIgKyBzZXR0aW5ncy53YWxscGFwZXIgKyBcIilcIjtcblxuICAgIGlmIChzZXR0aW5ncy5kb2NrUG9zaXRpb24gPT09IFwidG9wXCIpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNsYXNzTGlzdC5hZGQoXCJkb2NrVG9wXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jbGFzc0xpc3QuYWRkKFwiZG9ja0JvdHRvbVwiKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXBwbGljYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGFkZEJ1dHRvbihhcHBsaWNhdGlvbnNbaV0pO1xuICAgIH1cblxuICAgIGxvYWRTZXR0aW5ncygpO1xuICAgIGNlbnRyYWxpemUoKTtcbiAgICBkb2NrSGlkZVNob3coKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gaW5pdDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbGFzdEluZGV4ID0gMDtcbnZhciBvZmZzZXRYID0gMDtcbnZhciBvZmZzZXRZID0gMDtcbnZhciBwb3NpdGlvblggPSAwO1xudmFyIHBvc2l0aW9uWSA9IDA7XG52YXIgZWxlbWVudDtcblxuZnVuY3Rpb24gZ3JhYkVsZW1lbnQodGFyZ2V0KSB7XG4gICAgZWxlbWVudCA9IHRhcmdldDtcbiAgICBvZmZzZXRYID0gcG9zaXRpb25YIC0gZWxlbWVudC5vZmZzZXRMZWZ0O1xuICAgIG9mZnNldFkgPSBwb3NpdGlvblkgLSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbn1cblxuZnVuY3Rpb24gbW92ZUVsZW1lbnQoZXZlbnQpIHtcbiAgICBwb3NpdGlvblggPSBldmVudC5jbGllbnRYO1xuICAgIHBvc2l0aW9uWSA9IGV2ZW50LmNsaWVudFk7XG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIG5ld0xlZnQgPSBwb3NpdGlvblggLSAob2Zmc2V0WCArIDIpO1xuICAgICAgICB2YXIgbmV3VG9wID0gcG9zaXRpb25ZIC0gKG9mZnNldFkgKyAyKTtcblxuICAgICAgICBuZXdMZWZ0ID0gbmV3TGVmdCA8IDAgPyAwIDogbmV3TGVmdDtcbiAgICAgICAgbmV3VG9wID0gbmV3VG9wIDwgMCA/IDAgOiBuZXdUb3A7XG5cbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gbmV3TGVmdCArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSBuZXdUb3AgKyBcInB4XCI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZWxlYXNlRWxlbWVudCgpIHtcbiAgICBlbGVtZW50ID0gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBhZGRUZW1wbGF0ZSh0ZW1wbGF0ZU5hbWUsIGNvbnRhaW5lck5hbWUpIHtcbiAgICB2YXIgY29udGFpbmVyO1xuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB2YXIgbm9kZTtcblxuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyTmFtZSk7XG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRlbXBsYXRlTmFtZSk7XG4gICAgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUpO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVXaW5kb3coYXBwKSB7XG4gICAgdmFyIHRvcGJhcjtcbiAgICB2YXIgYXBwV2luZG93O1xuXG4gICAgYWRkVGVtcGxhdGUoXCIjYXBwV2luZG93VGVtcGxhdGVcIiwgXCJib2R5XCIpO1xuXG4gICAgYXBwV2luZG93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5hcHBXaW5kb3dcIilbZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5hcHBXaW5kb3dcIikubGVuZ3RoIC0gMV07XG4gICAgdG9wYmFyID0gYXBwV2luZG93LnF1ZXJ5U2VsZWN0b3IoXCIudG9wYmFyXCIpO1xuXG4gICAgbGFzdEluZGV4ICs9IDE7XG4gICAgYXBwV2luZG93LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcblxuICAgIHRvcGJhci5xdWVyeVNlbGVjdG9yKFwiLmFwcEljb25cIikuc2V0QXR0cmlidXRlKFwic3JjXCIsIGFwcC5pbWcpO1xuICAgIHRvcGJhci5xdWVyeVNlbGVjdG9yKFwiLmFwcFRpdGxlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcC5pZCkpO1xuXG4gICAgYXBwV2luZG93LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFwcC5iYWNrZ3JvdW5kQ29sb3I7XG5cbiAgICB0b3BiYXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZ3JhYkVsZW1lbnQoYXBwV2luZG93KTtcbiAgICB9KTtcblxuICAgIGFwcFdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVFbGVtZW50KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCByZWxlYXNlRWxlbWVudCk7XG5cbiAgICBhcHBXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBsYXN0SW5kZXggKz0gMTtcbiAgICAgICAgYXBwV2luZG93LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbiAgICB9KTtcblxuICAgIHRvcGJhci5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlV2luZG93QnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBhcHBXaW5kb3cucmVtb3ZlKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gYXBwV2luZG93O1xufVxuXG5tb2R1bGUuZXhwb3J0cy5jcmVhdGVXaW5kb3cgPSBjcmVhdGVXaW5kb3c7XG4iXX0=
