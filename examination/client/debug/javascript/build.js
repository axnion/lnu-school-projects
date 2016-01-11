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

    topbar.querySelector(".closeWindowButton").addEventListener("click", function(event) {
        event.preventDefault();
        appWindow.remove();
    });

    return appWindow;
}

module.exports.createWindow = createWindow;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvc2V0dGluZ3MvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnNMaXN0Lmpzb24iLCJjbGllbnQvc291cmNlL2pzL2RlZmF1bHRTZXR0aW5ncy5qc29uIiwiY2xpZW50L3NvdXJjZS9qcy9kb2NrLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9sYXVuY2hlci5qcyIsImNsaWVudC9zb3VyY2UvanMvd2luZG93LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGRvY2sgPSByZXF1aXJlKFwiLi9kb2NrXCIpO1xuZG9jay5pbml0KCk7XG4iLCIvL09tIGphZyBoYXIgdGlkIGzDpGdnIHRpbGwgc8OlIGthbiBrYW4gbMOkZ2dhIHRpbGwgb2NoIHRhIGJvcnQga2FuYWxlciBpIGVuIG9vbmZpZyBmaWxcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIGluc3RhQ2hhdChjb250YWluZXIpIHtcblxuICAgIHZhciBzb2NrZXQgPSBudWxsO1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFkcmVzczogXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiLFxuICAgICAgICBrZXk6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIixcbiAgICAgICAgY2hhbm5lbDogXCJcIlxuICAgIH07XG5cbiAgICBsb2dpbigpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcHJpbnRPcGVyYXRpb25zU2NyZWVuKCk7XG4gICAgICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi50ZXh0QXJlYVwiKS5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VuZChldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHByaW50TG9naW5TY3JlZW4oKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIG5vZGU7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdExvZ2luVGVtcGxhdGVcIik7XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRPcGVyYXRpb25zU2NyZWVuKCkge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBub2RlO1xuICAgICAgICB2YXIgb3B0aW9ucztcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdFRlbXBsYXRlXCIpO1xuICAgICAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNjaGFubmVsU2VsZWN0VGVtcGFsdGVcIik7XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLnRvcGJhclwiKS5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgc2VsZWN0ZWRcbiAgICAgICAgICAgIG9wdGlvbnMgPSBub2RlLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICBzZWxlY3RlZCA9IG5vZGUub3B0aW9uc1tub2RlLnNlbGVjdGVkSW5kZXhdO1xuXG4gICAgICAgICAgICBkZWJ1Z2dlcjtcblxuICAgICAgICAgICAgY29uZmlnLmNoYW5uZWwgPSBzZWxlY3RlZC52YWx1ZTtcbiAgICAgICAgICAgIHByaW50Tm90aWZpY2F0aW9uKFwiU3dpdGNoZWQgdG8gXCIgKyBzZWxlY3RlZC5maXJzdENoaWxkLmRhdGEgKyBcIiBjaGFubmVsXCIsIGZhbHNlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRNZXNzYWdlKG1lc3NhZ2UpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgZnJhZ21lbnQ7XG4gICAgICAgIHZhciBtZXNzYWdlRWxlbWVudDtcbiAgICAgICAgdmFyIHVzZXJuYW1lRWxlbWVudDtcbiAgICAgICAgdmFyIGNoYXRCb3ggPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jaGF0Qm94XCIpO1xuICAgICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIHZhciB0aW1lID0gZGF0ZS5nZXRIb3VycygpICsgXCI6XCI7XG4gICAgICAgIGlmIChkYXRlLmdldE1pbnV0ZXMoKSA8IDEwKSB7XG4gICAgICAgICAgICB0aW1lICs9IDA7XG4gICAgICAgIH1cblxuICAgICAgICB0aW1lICs9IGRhdGUuZ2V0TWludXRlcygpO1xuXG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lc3NhZ2VUZW1wbGF0ZVwiKTtcbiAgICAgICAgZnJhZ21lbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuXG4gICAgICAgIHVzZXJuYW1lRWxlbWVudCA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudXNlcm5hbWVcIik7XG4gICAgICAgIG1lc3NhZ2VFbGVtZW50ID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlXCIpO1xuXG4gICAgICAgIGlmIChtZXNzYWdlLnVzZXJuYW1lID09PSBzZXNzaW9uU3RvcmFnZS51c2VybmFtZSkge1xuICAgICAgICAgICAgbWVzc2FnZS51c2VybmFtZSA9IFwiWW91XCI7XG4gICAgICAgICAgICB1c2VybmFtZUVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIHVzZXJuYW1lU2VudFwiO1xuICAgICAgICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIG1lc3NhZ2VTZW50XCI7XG4gICAgICAgIH1cblxuICAgICAgICB1c2VybmFtZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZS51c2VybmFtZSArIFwiIFwiICsgdGltZSkpO1xuICAgICAgICBtZXNzYWdlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlLmRhdGEpKTtcblxuICAgICAgICBjaGF0Qm94LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludE5vdGlmaWNhdGlvbihtZXNzYWdlLCB0ZW1wb3JhcnkpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNub3RpZmljYXRpb25UZW1wbGF0ZVwiKTtcbiAgICAgICAgdmFyIG5vdGlmaWNhdGlvbiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgICAgIHZhciB0ZXh0O1xuXG4gICAgICAgIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKTtcblxuICAgICAgICBub3RpZmljYXRpb24uYXBwZW5kQ2hpbGQodGV4dCk7XG5cbiAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdEJveFwiKS5hcHBlbmRDaGlsZChub3RpZmljYXRpb24pO1xuXG4gICAgICAgIGlmICh0ZW1wb3JhcnkpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2dpbigpIHtcbiAgICAgICAgcHJpbnRMb2dpblNjcmVlbigpO1xuICAgICAgICB2YXIgbG9naW5EaXYgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5pbnN0YUNoYXRMb2dpblwiKTtcblxuICAgICAgICAvL1RPRE8gTMOkZ2cgdGlsbCBlbiByZWplY3QhXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG5cbiAgICAgICAgICAgIGlmIChzZXNzaW9uU3RvcmFnZS51c2VybmFtZSkge1xuICAgICAgICAgICAgICAgIGxvZ2luRGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZ2luRGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS51c2VybmFtZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2luRGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuYWxlcnRUZXh0XCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiUGxlYXNlIGVudGVyIGEgdXNlcm5hbWUhXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25uZWN0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5hZHJlc3MpO1xuICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlV2luZG93QnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgLy9UT0RPIERlbm5hIGtvZGVuIGLDtnIgdGVzdGFzXG4gICAgICAgICAgICAgICAgcmVqZWN0KFwiRGV0IGdpY2sgZmVsXCIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcblxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IFwibWVzc2FnZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLmNoYW5uZWwgPT09IGNvbmZpZy5jaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmludE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJub3RpZmljYXRpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBwcmludE5vdGlmaWNhdGlvbihtZXNzYWdlLmRhdGErIFwiIFdlbGNvbWUgXCIgKyBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIiksIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZW5kKHRleHQpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgICAgIGRhdGE6IHRleHQsXG4gICAgICAgICAgICB1c2VybmFtZTogc2Vzc2lvblN0b3JhZ2UudXNlcm5hbWUsXG4gICAgICAgICAgICBjaGFubmVsOiBjb25maWcuY2hhbm5lbCxcbiAgICAgICAgICAgIGtleTogY29uZmlnLmtleVxuICAgICAgICB9O1xuICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBpbnN0YUNoYXQ7XG4iLCIvL1RPRE8gTGl0ZSBtZXIgZmx1ZmYgb2NoIENTU1xuLy9UT0RPIEJ5dGEgYmlsZGVybmFcblxuZnVuY3Rpb24gbWVtb3J5R2FtZShjb250YWluZXIpIHtcbiAgICB2YXIgZ2FtZUJvYXJkO1xuICAgIHZhciByb3dzO1xuICAgIHZhciBjb2xzO1xuICAgIHZhciB0dXJuMTtcbiAgICB2YXIgdHVybjI7XG4gICAgdmFyIGxhc3RUaWxlO1xuICAgIHZhciBwYWlycyA9IDA7XG4gICAgdmFyIHRyaWVzID0gMDtcblxuICAgIHByaW50U3RhcnRTY3JlZW4oKS50aGVuKGZ1bmN0aW9uKGJvYXJkU2l6ZSkge1xuICAgICAgICB2YXIgc2l6ZTtcbiAgICAgICAgc2l6ZSA9IGJvYXJkU2l6ZS5zcGxpdChcInhcIik7XG4gICAgICAgIHJvd3MgPSBwYXJzZUludChzaXplWzBdKTtcbiAgICAgICAgY29scyA9IHBhcnNlSW50KHNpemVbMV0pO1xuICAgICAgICBwbGF5R2FtZSgpO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gcGxheUdhbWUoKSB7XG4gICAgICAgIHZhciB0aWxlcyA9IGdldEJyaWNrc0FycmF5KCk7XG4gICAgICAgIGdhbWVCb2FyZCA9IHByaW50R2FtZVNjcmVlbih0aWxlcyk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChnYW1lQm9hcmQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50U3RhcnRTY3JlZW4oKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIGRpdjtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB2YXIgYm9hcmRTaXplO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlHYW1lU3RhcnRUZW1wbGF0ZVwiKTtcbiAgICAgICAgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgICAgICAvL1RPRE8gTMOkZ2cgdGlsbCBlbiByZWplY3QhXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgICAgZm9yIChpID0gMTsgaSA8IDQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGRpdi5jaGlsZHJlbltpXS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgYm9hcmRTaXplID0gdGhpcy5maXJzdENoaWxkLmxhc3RDaGlsZC5ub2RlVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShib2FyZFNpemUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludEdhbWVTY3JlZW4odGlsZXMpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgdGVtcGxhdGVDb250ZW50O1xuICAgICAgICB2YXIgZGl2O1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlCcmlja1RlbXBsYXRlXCIpO1xuICAgICAgICB0ZW1wbGF0ZUNvbnRlbnQgPSB0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlHYW1lVGVtcGxhdGVcIik7XG4gICAgICAgIGRpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICAgICAgdGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGE7XG5cbiAgICAgICAgICAgIGEgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlQ29udGVudCwgdHJ1ZSk7XG4gICAgICAgICAgICBhZGRHYW1lTWVjaGFuaWNzKGEsIHRpbGUsIGluZGV4KTtcbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgICAgICAgICAgaWYgKGNvbHMgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBhLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTmFtZSA9IFwiYnJpY2tXaWR0aDJcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29scyA9PT0gNCkge1xuICAgICAgICAgICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuY2xhc3NOYW1lID0gXCJicmlja1dpZHRoNFwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKGluZGV4ICsgMSkgJSBjb2xzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkaXY7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkR2FtZU1lY2hhbmljcyhhLCB0aWxlLCBpbmRleCkge1xuICAgICAgICBhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGltZztcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGltZyA9IGV2ZW50LnRhcmdldC5ub2RlTmFtZSA9PT0gXCJJTUdcIiA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgICAgICAgICAgZ2FtZUxvZ2ljKHRpbGUsIGluZGV4LCBpbWcpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCcmlja3NBcnJheSgpIHtcbiAgICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgICB2YXIgdGVtcDtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgZm9yIChpID0gMTsgaSA8PSAocm93cyAqIGNvbHMpIC8gMjsgaSArPSAxKSB7XG4gICAgICAgICAgICBhcnIucHVzaChpKTtcbiAgICAgICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gYXJyLmxlbmd0aCAtIDE7IGkgPiAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgIHZhciByYW5kb21OdW1iZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKTtcbiAgICAgICAgICAgIHRlbXAgPSBhcnJbaV07XG4gICAgICAgICAgICBhcnJbaV0gPSBhcnJbcmFuZG9tTnVtYmVyXTtcbiAgICAgICAgICAgIGFycltyYW5kb21OdW1iZXJdID0gdGVtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2FtZUxvZ2ljKHRpbGUsIGluZGV4LCBpbWcpIHtcbiAgICAgICAgaWYgKHR1cm4yKSB7cmV0dXJuO31cblxuICAgICAgICBpbWcuc3JjID0gXCJpbWFnZS9cIiArIHRpbGUgKyBcIi5wbmdcIjtcblxuICAgICAgICBpZiAoIXR1cm4xKSB7XG4gICAgICAgICAgICB0dXJuMSA9IGltZztcbiAgICAgICAgICAgIGxhc3RUaWxlID0gdGlsZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbWcgPT09IHR1cm4xKSB7cmV0dXJuO31cblxuICAgICAgICAgICAgdHJpZXMgKz0gMTtcblxuICAgICAgICAgICAgdHVybjIgPSBpbWc7XG4gICAgICAgICAgICBpZiAodGlsZSA9PT0gbGFzdFRpbGUpIHtcbiAgICAgICAgICAgICAgICBwYWlycyArPSAxO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhaXJzID09PSAoY29scyAqIHJvd3MpIC8gMikge1xuICAgICAgICAgICAgICAgICAgICBnYW1lQm9hcmQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHByaW50SGlnaFNjb3JlU2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJyZW1vdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcInJlbW92ZVwiKTtcblxuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnNyYyA9IFwiaW1hZ2UvMC5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIuc3JjID0gXCJpbWFnZS8wLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRIaWdoU2NvcmVTY3JlZW4oKSB7XG4gICAgICAgIHZhciBzdG9yYWdlTmFtZSA9IFwibWVtb3J5XCIgKyByb3dzICsgXCJ4XCIgKyBjb2xzO1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBnYW1lRW5kRGl2O1xuICAgICAgICB2YXIgaGlnaFNjb3JlO1xuXG4gICAgICAgIGhpZ2hTY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZU5hbWUpKTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5R2FtZUVuZFRlbXBsYXRlXCIpO1xuICAgICAgICBnYW1lRW5kRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuc2F2ZUhpZ2hzY29yZUZvcm1cIikuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHNhdmVIaWdoU2NvcmUoZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRcIilbMF0udmFsdWUpO1xuICAgICAgICAgICAgZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiLnNhdmVIaWdoc2NvcmVGb3JtXCIpLnJlbW92ZSgpO1xuICAgICAgICAgICAgcHJpbnRIaWdoU2NvcmUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJpbnRIaWdoU2NvcmUoKTtcblxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ2FtZUVuZERpdik7XG5cbiAgICAgICAgZnVuY3Rpb24gcHJpbnRIaWdoU2NvcmUoKSB7XG4gICAgICAgICAgICBoaWdoU2NvcmUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VOYW1lKSk7XG4gICAgICAgICAgICB2YXIgb2xkU2NvcmUgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5oaWdoU2NvcmVcIik7XG4gICAgICAgICAgICBpZiAob2xkU2NvcmUpIHtcbiAgICAgICAgICAgICAgICBvbGRTY29yZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhpZ2hTY29yZSkge1xuICAgICAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgICAgIHZhciBzY29yZTtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IGdhbWVFbmREaXYucXVlcnlTZWxlY3RvcihcIiNoaWdoU2NvcmVUZW1wYXRlXCIpO1xuICAgICAgICAgICAgICAgIHZhciBzY29yZUJvYXJkID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBoaWdoU2NvcmUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcmUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIk5pY2tuYW1lOiBcIiArIGhpZ2hTY29yZVtpXS5uaWNrbmFtZSArIFwiIHwgVHJpZXM6IFwiICsgaGlnaFNjb3JlW2ldLnRyaWVzKTtcbiAgICAgICAgICAgICAgICAgICAgc2NvcmVCb2FyZC5jaGlsZHJlbltpXS5hcHBlbmRDaGlsZChzY29yZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZ2FtZUVuZERpdi5hcHBlbmRDaGlsZChzY29yZUJvYXJkKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IGdhbWVFbmREaXYucXVlcnlTZWxlY3RvcihcIiNub0hpZ2hTY29yZVRlbXBhdGVcIik7XG4gICAgICAgICAgICAgICAgZ2FtZUVuZERpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNhdmVIaWdoU2NvcmUobmlja25hbWUpIHtcbiAgICAgICAgICAgIGlmIChoaWdoU2NvcmUpIHtcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmUucHVzaCh7bmlja25hbWU6IG5pY2tuYW1lLCB0cmllczogdHJpZXN9KTtcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmUuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIoYS50cmllcykgLSBOdW1iZXIoYi50cmllcyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBoaWdoU2NvcmUuc3BsaWNlKDUsIDEpO1xuXG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZU5hbWUsIEpTT04uc3RyaW5naWZ5KGhpZ2hTY29yZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmUgPSBbXG4gICAgICAgICAgICAgICAgICAgIHtuaWNrbmFtZTogbmlja25hbWUsIHRyaWVzOiB0cmllc31cbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZU5hbWUsIEpTT04uc3RyaW5naWZ5KGhpZ2hTY29yZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBtZW1vcnlHYW1lO1xuIiwiXG5mdW5jdGlvbiBzZXR0aW5ncyhjb250YWluZXIpIHtcbiAgICB2YXIgZm9ybTtcbiAgICB2YXIgaW5wdXRzO1xuICAgIHZhciB0ZW1wbGF0ZTtcblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZXR0aW5nc1RlbXBsYXRlXCIpO1xuICAgIGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGlucHV0cyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xuXG4gICAgZmlsbEZvcm1XaXRoRGF0YSgpO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGFwcGx5KCk7XG4gICAgfSk7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgaW5wdXRzWzVdLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGlucHV0c1s2XS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgaW5wdXRzWzVdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgYXBwbHkoKTtcbiAgICB9KTtcbiAgICBpbnB1dHNbNl0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBmaWxsRm9ybVdpdGhEYXRhKCk7XG4gICAgfSk7XG4gICAgaW5wdXRzWzddLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzZXRUb0RlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGZpbGxGb3JtV2l0aERhdGEoKSB7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSk7XG5cbiAgICAgICAgaW5wdXRzWzBdLnZhbHVlID0gc2V0dGluZ3Mud2FsbHBhcGVyO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5oaWRlRG9jayA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIGlucHV0c1sxXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0c1syXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncy5kb2NrUG9zaXRpb24gPT09IFwidG9wXCIpIHtcbiAgICAgICAgICAgIGlucHV0c1szXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0c1s0XS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlucHV0c1s1XS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIGlucHV0c1s2XS5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXBwbHkoKXtcbiAgICAgICAgdmFyIG5ld1NldHRpbmcgPSB7XG4gICAgICAgICAgICB3YWxscGFwZXI6IGlucHV0c1swXS52YWx1ZSxcbiAgICAgICAgICAgIGhpZGVEb2NrOiBpbnB1dHNbMV0uY2hlY2tlZCA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiLFxuICAgICAgICAgICAgZG9ja1Bvc2l0aW9uOiBpbnB1dHNbM10uY2hlY2tlZCA/IFwidG9wXCIgOiBcImJvdHRvbVwiXG4gICAgICAgIH07XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiUFdEU2V0dGluZ3NcIiwgSlNPTi5zdHJpbmdpZnkobmV3U2V0dGluZykpO1xuICAgICAgICB1c2VOZXdTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0VG9EZWZhdWx0KCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIlBXRFNldHRpbmdzXCIsIEpTT04uc3RyaW5naWZ5KHJlcXVpcmUoXCIuLi8uLi9kZWZhdWx0U2V0dGluZ3MuanNvblwiKSkpO1xuICAgICAgICBmaWxsRm9ybVdpdGhEYXRhKCk7XG4gICAgICAgIHVzZU5ld1NldHRpbmdzKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXNlTmV3U2V0dGluZ3MoKSB7XG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpO1xuICAgICAgICB2YXIgYnV0dG9ucztcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIHNldHRpbmdzLndhbGxwYXBlciArIFwiKVwiO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5oaWRlRG9jayA9PT0gXCJmYWxzZVwiKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuc3R5bGUuaGVpZ2h0ID0gXCI2MHB4XCI7XG4gICAgICAgICAgICBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuY2hpbGRyZW47XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjBweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNldHRpbmdzLmRvY2tQb3NpdGlvbiA9PT0gXCJ0b3BcIikge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNsYXNzTmFtZSA9IFwiZG9ja1RvcFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNsYXNzTmFtZSA9IFwiZG9ja0JvdHRvbVwiO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBzZXR0aW5ncztcbiIsIm1vZHVsZS5leHBvcnRzPVtcbiAgICB7XCJpZFwiOiBcImluc3RhQ2hhdFwiLCBcImltZ1wiOiBcIi4uL2ltYWdlL2luc3RhQ2hhdC5wbmdcIiwgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCJ5ZWxsb3dncmVlblwifSxcbiAgICB7XCJpZFwiOiBcIm1lbW9yeUdhbWVcIiwgXCJpbWdcIjogXCIuLi9pbWFnZS90ZXN0QXBwLnBuZ1wiLCBcImJhY2tncm91bmRDb2xvclwiOiBcImxpZ2h0Ymx1ZVwifSxcbiAgICB7XCJpZFwiOiBcInNldHRpbmdzXCIsIFwiaW1nXCI6IFwiLi4vaW1hZ2Uvc2V0dGluZ3MucG5nXCIsIFwiYmFja2dyb3VuZENvbG9yXCI6IFwieWVsbG93XCJ9XG5dXG5cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcIndhbGxwYXBlclwiOiBcIi4uL2ltYWdlL3dhbGxwYXBlci5qcGdcIixcbiAgICBcImhpZGVEb2NrXCI6IFwiZmFsc2VcIixcbiAgICBcImRvY2tQb3NpdGlvblwiOiBcImJvdHRvbVwiXG59XG4iLCJcInVzZSBzdHJpY3RcIjtcbi8vVE9ETyBTdMOkZGEgdXBwIHPDpSBVUkxlbiBpbnRlIGbDtnLDpG5kcmFzLlxuLy9UT0RPIEbDtnJzw7ZrIHJlbnNhIHVwcCBzw6UgbWt0IGh0bWwgb2NoIGNzcyBmcsOlbiBqYXZhc2NyaXB0a29kZW4uXG4vL1RPRE8gS29sbGEgdmFyIGTDpHIga2FuIGJlaMO2dmFzIG1lZCBmZWVkYmFja1xuXG52YXIgZG9jayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKTtcbnZhciBidXR0b25zID0gW107XG52YXIgbGF1bmNoZXIgPSByZXF1aXJlKFwiLi9sYXVuY2hlclwiKTtcblxudmFyIGFwcGxpY2F0aW9ucyA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9uc0xpc3RcIik7XG5cbmZ1bmN0aW9uIGNlbnRyYWxpemUoKSB7XG4gICAgdmFyIHdpZHRoID0gZG9jay5vZmZzZXRXaWR0aDtcbiAgICBkb2NrLnN0eWxlLm1hcmdpbkxlZnQgPSAod2lkdGggLyAyKSAqIC0xO1xufVxuXG5mdW5jdGlvbiBkb2NrSGlkZVNob3coKSB7XG4gICAgdmFyIGk7XG5cbiAgICBkb2NrLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCI2MHB4XCI7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRvY2suYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGlkZURvY2sgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpLmhpZGVEb2NrO1xuXG4gICAgICAgIGlmIChoaWRlRG9jayA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBidXR0b25zW2ldLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkQnV0dG9uKGFwcCkge1xuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB2YXIgYnV0dG9uO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FwcEJ1dHRvblRlbXBsYXRlXCIpO1xuICAgIGJ1dHRvbiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgZmFsc2UpO1xuXG4gICAgYnV0dG9uLmNsYXNzTmFtZSA9IFwiYXBwQnV0dG9uXCI7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFwcC5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgYXBwLmltZyArIFwiKVwiO1xuICAgIGRvY2suYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICBkb2NrLnN0eWxlLndpZHRoID0gZG9jay5vZmZzZXRXaWR0aCArIDQ1O1xuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVtdCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsYXVuY2hlci5sYXVuY2hlcihhcHApO1xuICAgIH0pO1xuXG4gICAgYnV0dG9ucy5wdXNoKGJ1dHRvbik7XG59XG5cbmZ1bmN0aW9uIGxvYWRTZXR0aW5ncygpIHtcbiAgICB2YXIgc2V0dGluZ3M7XG4gICAgaWYgKCFsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIlBXRFNldHRpbmdzXCIpKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiUFdEU2V0dGluZ3NcIiwgSlNPTi5zdHJpbmdpZnkocmVxdWlyZShcIi4vZGVmYXVsdFNldHRpbmdzLmpzb25cIikpKTtcbiAgICB9XG5cbiAgICBzZXR0aW5ncyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXCIgKyBzZXR0aW5ncy53YWxscGFwZXIgKyBcIilcIjtcblxuICAgIGlmIChzZXR0aW5ncy5kb2NrUG9zaXRpb24gPT09IFwidG9wXCIpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNsYXNzTGlzdC5hZGQoXCJkb2NrVG9wXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jbGFzc0xpc3QuYWRkKFwiZG9ja0JvdHRvbVwiKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXBwbGljYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGFkZEJ1dHRvbihhcHBsaWNhdGlvbnNbaV0pO1xuICAgIH1cblxuICAgIGxvYWRTZXR0aW5ncygpO1xuICAgIGNlbnRyYWxpemUoKTtcbiAgICBkb2NrSGlkZVNob3coKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gaW5pdDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgcHdkV2luZG93ID0gcmVxdWlyZShcIi4vd2luZG93XCIpO1xuXG5mdW5jdGlvbiBBcHBsaWNhdGlvbnMoKSB7XG4gICAgdGhpcy5pbnN0YUNoYXQgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9pbnN0YUNoYXQvYXBwXCIpO1xuICAgICAgICBhcHAubGF1bmNoKGNvbnRhaW5lcik7XG4gICAgfTtcblxuICAgIHRoaXMubWVtb3J5R2FtZSA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgYXBwID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwXCIpO1xuICAgICAgICBhcHAubGF1bmNoKGNvbnRhaW5lcik7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0dGluZ3MgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9zZXR0aW5ncy9hcHBcIik7XG4gICAgICAgIGFwcC5sYXVuY2goY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgLy9UT0RPIFRhIGJvcnQgYWxsdCBpIGbDtm5zdHJldCBpbm5hblxuICAgIHRoaXMuZXJyb3IgPSBmdW5jdGlvbihjb250YWluZXIsIGVycikge1xuICAgICAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGVycik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBsYXVuY2hlcihhcHApIHtcbiAgICB2YXIgY29udGFpbmVyO1xuICAgIHZhciBhcHBsaWNhdGlvbnM7XG5cbiAgICBjb250YWluZXIgPSBwd2RXaW5kb3cuY3JlYXRlV2luZG93KGFwcCk7XG4gICAgYXBwbGljYXRpb25zID0gbmV3IEFwcGxpY2F0aW9ucygpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgYXBwbGljYXRpb25zW2FwcC5pZF0oY29udGFpbmVyKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgYXBwbGljYXRpb25zLmVycm9yKGNvbnRhaW5lciwgZXJyKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaGVyID0gbGF1bmNoZXI7XG5cbiIsIi8vVE9ETyBHw7ZyIHPDpSBhdHQgZsO2bnN0ZXJuYSBpbnRlIGthbiBnw6UgdXRhbmbDtnIgc2vDpHJtZW4uXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgbGFzdEluZGV4ID0gMDtcbnZhciBvZmZzZXRYID0gMDtcbnZhciBvZmZzZXRZID0gMDtcbnZhciBwb3NpdGlvblggPSAwO1xudmFyIHBvc2l0aW9uWSA9IDA7XG52YXIgZWxlbWVudDtcblxuZnVuY3Rpb24gZ3JhYkVsZW1lbnQodGFyZ2V0KSB7XG4gICAgZWxlbWVudCA9IHRhcmdldDtcbiAgICBvZmZzZXRYID0gcG9zaXRpb25YIC0gZWxlbWVudC5vZmZzZXRMZWZ0O1xuICAgIG9mZnNldFkgPSBwb3NpdGlvblkgLSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbn1cblxuZnVuY3Rpb24gbW92ZUVsZW1lbnQoZXZlbnQpIHtcbiAgICBwb3NpdGlvblggPSBldmVudC5jbGllbnRYO1xuICAgIHBvc2l0aW9uWSA9IGV2ZW50LmNsaWVudFk7XG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gcG9zaXRpb25YIC0gKG9mZnNldFggKyAyKSArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSBwb3NpdGlvblkgLSAob2Zmc2V0WSArIDIpICsgXCJweFwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVsZWFzZUVsZW1lbnQoKSB7XG4gICAgZWxlbWVudCA9IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gYWRkVGVtcGxhdGUodGVtcGxhdGVOYW1lLCBjb250YWluZXJOYW1lKSB7XG4gICAgdmFyIGNvbnRhaW5lcjtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIG5vZGU7XG5cbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lck5hbWUpO1xuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0ZW1wbGF0ZU5hbWUpO1xuICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub2RlKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlV2luZG93KGFwcCkge1xuICAgIHZhciB0b3BiYXI7XG4gICAgdmFyIGFwcFdpbmRvdztcblxuICAgIGFkZFRlbXBsYXRlKFwiI2FwcFdpbmRvd1RlbXBsYXRlXCIsIFwiYm9keVwiKTtcblxuICAgIGFwcFdpbmRvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXBwV2luZG93XCIpW2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXBwV2luZG93XCIpLmxlbmd0aCAtIDFdO1xuICAgIHRvcGJhciA9IGFwcFdpbmRvdy5xdWVyeVNlbGVjdG9yKFwiLnRvcGJhclwiKTtcblxuICAgIGxhc3RJbmRleCArPSAxO1xuICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG5cbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5hcHBJY29uXCIpLnNldEF0dHJpYnV0ZShcInNyY1wiLCBhcHAuaW1nKTtcbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5hcHBUaXRsZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhcHAuaWQpKTtcblxuICAgIGFwcFdpbmRvdy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhcHAuYmFja2dyb3VuZENvbG9yO1xuXG4gICAgdG9wYmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGdyYWJFbGVtZW50KGFwcFdpbmRvdyk7XG4gICAgfSk7XG5cbiAgICBhcHBXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlRWxlbWVudCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgcmVsZWFzZUVsZW1lbnQpO1xuXG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgbGFzdEluZGV4ICs9IDE7XG4gICAgICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgfSk7XG5cbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5jbG9zZVdpbmRvd0J1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYXBwV2luZG93LnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGFwcFdpbmRvdztcbn1cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlV2luZG93ID0gY3JlYXRlV2luZG93O1xuIl19
