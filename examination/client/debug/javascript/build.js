(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var dock = require("./dock");
dock.init();

},{"./dock":7}],2:[function(require,module,exports){
//TODO Lägg till loged in as.
//TODO Extragrejen får bli kanaler och kanske byta namn

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvc2V0dGluZ3MvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnNMaXN0Lmpzb24iLCJjbGllbnQvc291cmNlL2pzL2RlZmF1bHRTZXR0aW5ncy5qc29uIiwiY2xpZW50L3NvdXJjZS9qcy9kb2NrLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9sYXVuY2hlci5qcyIsImNsaWVudC9zb3VyY2UvanMvd2luZG93LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZG9jayA9IHJlcXVpcmUoXCIuL2RvY2tcIik7XG5kb2NrLmluaXQoKTtcbiIsIi8vVE9ETyBMw6RnZyB0aWxsIGxvZ2VkIGluIGFzLlxuLy9UT0RPIEV4dHJhZ3JlamVuIGbDpXIgYmxpIGthbmFsZXIgb2NoIGthbnNrZSBieXRhIG5hbW5cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBzb2NrZXQgPSBudWxsO1xudmFyIGNvbmZpZyA9IHtcbiAgICBhZHJlc3M6IFwid3M6Ly92aG9zdDMubG51LnNlOjIwMDgwL3NvY2tldC9cIixcbiAgICBrZXk6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIlxufTtcblxuZnVuY3Rpb24gcHJpbnRMb2dpblNjcmVlbihjb250YWluZXIpIHtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIG5vZGU7XG5cbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5zdGFDaGF0TG9naW5UZW1wbGF0ZVwiKTtcbiAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG5cbmZ1bmN0aW9uIHByaW50T3BlcmF0aW9uc1NjcmVlbihjb250YWluZXIpIHtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIG5vZGU7XG5cbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5zdGFDaGF0VGVtcGxhdGVcIik7XG4gICAgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUpO1xufVxuXG5mdW5jdGlvbiBwcmludE1lc3NhZ2UoY29udGFpbmVyLCBtZXNzYWdlKSB7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBmcmFnbWVudDtcbiAgICB2YXIgbWVzc2FnZUVsZW1lbnQ7XG4gICAgdmFyIHVzZXJuYW1lRWxlbWVudDtcbiAgICB2YXIgY2hhdEJveCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmNoYXRCb3hcIik7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgIHZhciB0aW1lID0gZGF0ZS5nZXRIb3VycygpICsgXCI6XCIgKyBkYXRlLmdldE1pbnV0ZXMoKTtcblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZXNzYWdlVGVtcGxhdGVcIik7XG4gICAgZnJhZ21lbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuXG4gICAgdXNlcm5hbWVFbGVtZW50ID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvcihcIi51c2VybmFtZVwiKTtcbiAgICBtZXNzYWdlRWxlbWVudCA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoXCIubWVzc2FnZVwiKTtcblxuICAgIGlmIChtZXNzYWdlLnVzZXJuYW1lID09PSBzZXNzaW9uU3RvcmFnZS51c2VybmFtZSkge1xuICAgICAgICBtZXNzYWdlLnVzZXJuYW1lID0gXCJZb3VcIjtcbiAgICAgICAgdXNlcm5hbWVFbGVtZW50LmNsYXNzTmFtZSArPSBcIiB1c2VybmFtZVNlbnRcIjtcbiAgICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIG1lc3NhZ2VTZW50XCI7XG4gICAgfVxuXG4gICAgdXNlcm5hbWVFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UudXNlcm5hbWUgKyBcIiBcIiArIHRpbWUpKTtcbiAgICBtZXNzYWdlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlLmRhdGEpKTtcblxuICAgIGNoYXRCb3guYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xufVxuXG5mdW5jdGlvbiBsb2dpbihjb250YWluZXIpIHtcbiAgICBwcmludExvZ2luU2NyZWVuKGNvbnRhaW5lcik7XG4gICAgdmFyIGxvZ2luRGl2ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuaW5zdGFDaGF0TG9naW5cIik7XG5cbiAgICAvL1RPRE8gTMOkZ2cgdGlsbCBlbiByZWplY3QhXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUpIHtcblxuICAgICAgICBpZiAoc2Vzc2lvblN0b3JhZ2UudXNlcm5hbWUpIHtcbiAgICAgICAgICAgIGxvZ2luRGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9naW5EaXYuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBsb2dpbkRpdi5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmFsZXJ0VGV4dFwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlBsZWFzZSBlbnRlciBhIHVzZXJuYW1lIVwiKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY29ubmVjdChjb250YWluZXIpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHNvY2tldCA9IG5ldyBXZWJTb2NrZXQoY29uZmlnLmFkcmVzcyk7XG4gICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlV2luZG93QnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzb2NrZXQuY2xvc2UoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy9UT0RPIERlbm5hIGtvZGVuIGLDtnIgdGVzdGFzXG4gICAgICAgICAgICByZWplY3QoXCJEZXQgZ2ljayBmZWxcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgICAgICBpZiAobWVzc2FnZS50eXBlID09PSBcIm1lc3NhZ2VcIikge1xuICAgICAgICAgICAgICAgIHByaW50TWVzc2FnZShjb250YWluZXIsIG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gc2VuZCh0ZXh0KSB7XG4gICAgdmFyIGRhdGEgPSB7XG4gICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICBkYXRhOiB0ZXh0LFxuICAgICAgICB1c2VybmFtZTogc2Vzc2lvblN0b3JhZ2UudXNlcm5hbWUsXG4gICAgICAgIGNoYW5uZWw6IFwiXCIsXG4gICAgICAgIGtleTogY29uZmlnLmtleVxuICAgIH07XG4gICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xufVxuXG5mdW5jdGlvbiBsYXVuY2goY29udGFpbmVyKSB7XG4gICAgbG9naW4oY29udGFpbmVyKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBjb25uZWN0KGNvbnRhaW5lcikudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHByaW50T3BlcmF0aW9uc1NjcmVlbihjb250YWluZXIpO1xuICAgICAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIudGV4dEFyZWFcIikuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IDEzKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbmQoZXZlbnQudGFyZ2V0LnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaCA9IGxhdW5jaDtcbiIsIi8vVE9ETyBMaXRlIG1lciBmbHVmZiBvY2ggQ1NTXG4vL1RPRE8gQnl0YSBiaWxkZXJuYVxuXG5mdW5jdGlvbiBtZW1vcnlHYW1lKGNvbnRhaW5lcikge1xuICAgIHZhciBnYW1lQm9hcmQ7XG4gICAgdmFyIHJvd3M7XG4gICAgdmFyIGNvbHM7XG4gICAgdmFyIHR1cm4xO1xuICAgIHZhciB0dXJuMjtcbiAgICB2YXIgbGFzdFRpbGU7XG4gICAgdmFyIHBhaXJzID0gMDtcbiAgICB2YXIgdHJpZXMgPSAwO1xuXG4gICAgcHJpbnRTdGFydFNjcmVlbigpLnRoZW4oZnVuY3Rpb24oYm9hcmRTaXplKSB7XG4gICAgICAgIHZhciBzaXplO1xuICAgICAgICBzaXplID0gYm9hcmRTaXplLnNwbGl0KFwieFwiKTtcbiAgICAgICAgcm93cyA9IHBhcnNlSW50KHNpemVbMF0pO1xuICAgICAgICBjb2xzID0gcGFyc2VJbnQoc2l6ZVsxXSk7XG4gICAgICAgIHBsYXlHYW1lKCk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBwbGF5R2FtZSgpIHtcbiAgICAgICAgdmFyIHRpbGVzID0gZ2V0QnJpY2tzQXJyYXkoKTtcbiAgICAgICAgZ2FtZUJvYXJkID0gcHJpbnRHYW1lU2NyZWVuKHRpbGVzKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdhbWVCb2FyZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRTdGFydFNjcmVlbigpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgZGl2O1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHZhciBib2FyZFNpemU7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUdhbWVTdGFydFRlbXBsYXRlXCIpO1xuICAgICAgICBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuXG4gICAgICAgIC8vVE9ETyBMw6RnZyB0aWxsIGVuIHJlamVjdCFcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlIChmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAxOyBpIDwgNDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgZGl2LmNoaWxkcmVuW2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBib2FyZFNpemUgPSB0aGlzLmZpcnN0Q2hpbGQubGFzdENoaWxkLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgZGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGJvYXJkU2l6ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50R2FtZVNjcmVlbih0aWxlcykge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciB0ZW1wbGF0ZUNvbnRlbnQ7XG4gICAgICAgIHZhciBkaXY7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUJyaWNrVGVtcGxhdGVcIik7XG4gICAgICAgIHRlbXBsYXRlQ29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUdhbWVUZW1wbGF0ZVwiKTtcbiAgICAgICAgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICB0aWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHRpbGUsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgYTtcblxuICAgICAgICAgICAgYSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVDb250ZW50LCB0cnVlKTtcblxuICAgICAgICAgICAgYWRkR2FtZU1lY2hhbmljcyhhLCB0aWxlLCBpbmRleCk7XG5cbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgICAgICAgICAgaWYgKChpbmRleCArIDEpICUgY29scyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGl2O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZEdhbWVNZWNoYW5pY3MoYSwgdGlsZSwgaW5kZXgpIHtcbiAgICAgICAgYS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBpbWc7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpbWcgPSBldmVudC50YXJnZXQubm9kZU5hbWUgPT09IFwiSU1HXCIgPyBldmVudC50YXJnZXQgOiBldmVudC50YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgICAgICBnYW1lTG9naWModGlsZSwgaW5kZXgsIGltZyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdldEJyaWNrc0FycmF5KCkge1xuICAgICAgICB2YXIgYXJyID0gW107XG4gICAgICAgIHZhciB0ZW1wO1xuICAgICAgICB2YXIgaTtcblxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IChyb3dzICogY29scykgLyAyOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSBhcnIubGVuZ3RoIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgdmFyIHJhbmRvbU51bWJlciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpO1xuICAgICAgICAgICAgdGVtcCA9IGFycltpXTtcbiAgICAgICAgICAgIGFycltpXSA9IGFycltyYW5kb21OdW1iZXJdO1xuICAgICAgICAgICAgYXJyW3JhbmRvbU51bWJlcl0gPSB0ZW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnYW1lTG9naWModGlsZSwgaW5kZXgsIGltZykge1xuICAgICAgICBpZiAodHVybjIpIHtyZXR1cm47fVxuXG4gICAgICAgIGltZy5zcmMgPSBcImltYWdlL1wiICsgdGlsZSArIFwiLnBuZ1wiO1xuXG4gICAgICAgIGlmICghdHVybjEpIHtcbiAgICAgICAgICAgIHR1cm4xID0gaW1nO1xuICAgICAgICAgICAgbGFzdFRpbGUgPSB0aWxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGltZyA9PT0gdHVybjEpIHtyZXR1cm47fVxuXG4gICAgICAgICAgICB0cmllcyArPSAxO1xuXG4gICAgICAgICAgICB0dXJuMiA9IGltZztcbiAgICAgICAgICAgIGlmICh0aWxlID09PSBsYXN0VGlsZSkge1xuICAgICAgICAgICAgICAgIHBhaXJzICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFpcnMgPT09IChjb2xzICogcm93cykgLyAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVCb2FyZC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbnRIaWdoU2NvcmVTY3JlZW4oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcInJlbW92ZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwicmVtb3ZlXCIpO1xuXG4gICAgICAgICAgICAgICAgICAgIHR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEuc3JjID0gXCJpbWFnZS8wLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMi5zcmMgPSBcImltYWdlLzAucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIgPSBudWxsO1xuICAgICAgICAgICAgICAgIH0sIDUwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludEhpZ2hTY29yZVNjcmVlbigpIHtcbiAgICAgICAgdmFyIHN0b3JhZ2VOYW1lID0gXCJtZW1vcnlcIiArIHJvd3MgKyBcInhcIiArIGNvbHM7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIGdhbWVFbmREaXY7XG4gICAgICAgIHZhciBoaWdoU2NvcmU7XG5cbiAgICAgICAgaGlnaFNjb3JlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShzdG9yYWdlTmFtZSkpO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlHYW1lRW5kVGVtcGxhdGVcIik7XG4gICAgICAgIGdhbWVFbmREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgIGdhbWVFbmREaXYucXVlcnlTZWxlY3RvcihcIi5zYXZlSGlnaHNjb3JlRm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgc2F2ZUhpZ2hTY29yZShnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKVswXS52YWx1ZSk7XG4gICAgICAgICAgICBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuc2F2ZUhpZ2hzY29yZUZvcm1cIikucmVtb3ZlKCk7XG4gICAgICAgICAgICBwcmludEhpZ2hTY29yZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcmludEhpZ2hTY29yZSgpO1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChnYW1lRW5kRGl2KTtcblxuICAgICAgICBmdW5jdGlvbiBwcmludEhpZ2hTY29yZSgpIHtcbiAgICAgICAgICAgIGhpZ2hTY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZU5hbWUpKTtcbiAgICAgICAgICAgIHZhciBvbGRTY29yZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmhpZ2hTY29yZVwiKTtcbiAgICAgICAgICAgIGlmIChvbGRTY29yZSkge1xuICAgICAgICAgICAgICAgIG9sZFNjb3JlLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaGlnaFNjb3JlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICAgICAgdmFyIHNjb3JlO1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiI2hpZ2hTY29yZVRlbXBhdGVcIik7XG4gICAgICAgICAgICAgICAgdmFyIHNjb3JlQm9hcmQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGhpZ2hTY29yZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzY29yZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTmlja25hbWU6IFwiICsgaGlnaFNjb3JlW2ldLm5pY2tuYW1lICsgXCIgfCBUcmllczogXCIgKyBoaWdoU2NvcmVbaV0udHJpZXMpO1xuICAgICAgICAgICAgICAgICAgICBzY29yZUJvYXJkLmNoaWxkcmVuW2ldLmFwcGVuZENoaWxkKHNjb3JlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBnYW1lRW5kRGl2LmFwcGVuZENoaWxkKHNjb3JlQm9hcmQpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiI25vSGlnaFNjb3JlVGVtcGF0ZVwiKTtcbiAgICAgICAgICAgICAgICBnYW1lRW5kRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2F2ZUhpZ2hTY29yZShuaWNrbmFtZSkge1xuICAgICAgICAgICAgaWYgKGhpZ2hTY29yZSkge1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZS5wdXNoKHtuaWNrbmFtZTogbmlja25hbWUsIHRyaWVzOiB0cmllc30pO1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE51bWJlcihhLnRyaWVzKSAtIE51bWJlcihiLnRyaWVzKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGhpZ2hTY29yZS5zcGxpY2UoNSwgMSk7XG5cbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdG9yYWdlTmFtZSwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZSA9IFtcbiAgICAgICAgICAgICAgICAgICAge25pY2tuYW1lOiBuaWNrbmFtZSwgdHJpZXM6IHRyaWVzfVxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdG9yYWdlTmFtZSwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaCA9IG1lbW9yeUdhbWU7XG4iLCIvL1RPRE8gU3BhcmEgc2V0dGluZ3MgaSBsb2NhbHN0b3JhZ2UuXG4vL1RPRE8gSGlkZSB0YXNrYmFyXG5cbmZ1bmN0aW9uIHNldHRpbmdzKGNvbnRhaW5lcikge1xuICAgIHZhciBmb3JtO1xuICAgIHZhciBpbnB1dHM7XG4gICAgdmFyIHRlbXBsYXRlO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3NldHRpbmdzVGVtcGxhdGVcIik7XG4gICAgZm9ybSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgaW5wdXRzID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRcIik7XG5cbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG5cbiAgICBmaWxsRm9ybVdpdGhEYXRhKCk7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgaW5wdXRzWzVdLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGlucHV0c1s2XS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgIH0pO1xuXG4gICAgaW5wdXRzWzVdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgYXBwbHkoKTtcbiAgICB9KTtcbiAgICBpbnB1dHNbNl0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBmaWxsRm9ybVdpdGhEYXRhKCk7XG4gICAgfSk7XG4gICAgaW5wdXRzWzddLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzZXRUb0RlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIGZpbGxGb3JtV2l0aERhdGEoKSB7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSk7XG5cbiAgICAgICAgaW5wdXRzWzBdLnZhbHVlID0gc2V0dGluZ3Mud2FsbHBhcGVyO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5oaWRlRG9jayA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIGlucHV0c1sxXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0c1syXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncy5kb2NrUG9zaXRpb24gPT09IFwidG9wXCIpIHtcbiAgICAgICAgICAgIGlucHV0c1szXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0c1s0XS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlucHV0c1s1XS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIGlucHV0c1s2XS5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYXBwbHkoKXtcbiAgICAgICAgdmFyIG5ld1NldHRpbmcgPSB7XG4gICAgICAgICAgICB3YWxscGFwZXI6IGlucHV0c1swXS52YWx1ZSxcbiAgICAgICAgICAgIGhpZGVEb2NrOiBpbnB1dHNbMV0uY2hlY2tlZCA/IFwidHJ1ZVwiIDogXCJmYWxzZVwiLFxuICAgICAgICAgICAgZG9ja1Bvc2l0aW9uOiBpbnB1dHNbM10uY2hlY2tlZCA/IFwidG9wXCIgOiBcImJvdHRvbVwiXG4gICAgICAgIH07XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiUFdEU2V0dGluZ3NcIiwgSlNPTi5zdHJpbmdpZnkobmV3U2V0dGluZykpO1xuICAgICAgICB1c2VOZXdTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc2V0VG9EZWZhdWx0KCkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIlBXRFNldHRpbmdzXCIsIEpTT04uc3RyaW5naWZ5KHJlcXVpcmUoXCIuLi8uLi9kZWZhdWx0U2V0dGluZ3MuanNvblwiKSkpO1xuICAgICAgICB1c2VOZXdTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVzZU5ld1NldHRpbmdzKCkge1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgdmFyIHNldHRpbmdzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIlBXRFNldHRpbmdzXCIpKTtcbiAgICAgICAgdmFyIGJ1dHRvbnM7XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXCIgKyBzZXR0aW5ncy53YWxscGFwZXIgKyBcIilcIjtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuaGlkZURvY2sgPT09IFwiZmFsc2VcIikge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLnN0eWxlLmhlaWdodCA9IFwiNjBweFwiO1xuICAgICAgICAgICAgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jaGlsZHJlbjtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBidXR0b25zW2ldLnN0eWxlLmhlaWdodCA9IFwiNTBweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG4gICAgICAgICAgICBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncy5kb2NrUG9zaXRpb24gPT09IFwidG9wXCIpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jbGFzc05hbWUgPSBcImRvY2tUb3BcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jbGFzc05hbWUgPSBcImRvY2tCb3R0b21cIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoID0gc2V0dGluZ3M7XG4iLCJtb2R1bGUuZXhwb3J0cz1bXG4gICAge1wiaWRcIjogXCJpbnN0YUNoYXRcIiwgXCJpbWdcIjogXCIuLi9pbWFnZS9pbnN0YUNoYXQucG5nXCIsIFwiYmFja2dyb3VuZENvbG9yXCI6IFwieWVsbG93Z3JlZW5cIn0sXG4gICAge1wiaWRcIjogXCJtZW1vcnlHYW1lXCIsIFwiaW1nXCI6IFwiLi4vaW1hZ2UvdGVzdEFwcC5wbmdcIiwgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCJsaWdodGJsdWVcIn0sXG4gICAge1wiaWRcIjogXCJzZXR0aW5nc1wiLCBcImltZ1wiOiBcIi4uL2ltYWdlL3NldHRpbmdzLnBuZ1wiLCBcImJhY2tncm91bmRDb2xvclwiOiBcInllbGxvd1wifVxuXVxuXG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gICAgXCJ3YWxscGFwZXJcIjogXCIuLi9pbWFnZS93YWxscGFwZXIuanBnXCIsXG4gICAgXCJoaWRlRG9ja1wiOiBcImZhbHNlXCIsXG4gICAgXCJkb2NrUG9zaXRpb25cIjogXCJib3R0b21cIlxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8vVE9ETyBGw7Zyc8O2ayByZW5zYSB1cHAgc8OlIG1rdCBodG1sIG9jaCBjc3MgZnLDpW4gamF2YXNjcmlwdGtvZGVuLlxuLy9UT0RPIEtvbGxhIHZhciBkw6RyIGthbiBiZWjDtnZhcyBtZWQgZmVlZGJhY2tcblxudmFyIGRvY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIik7XG52YXIgYnV0dG9ucyA9IFtdO1xudmFyIGxhdW5jaGVyID0gcmVxdWlyZShcIi4vbGF1bmNoZXJcIik7XG5cbnZhciBhcHBsaWNhdGlvbnMgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnNMaXN0XCIpO1xuXG5mdW5jdGlvbiBjZW50cmFsaXplKCkge1xuICAgIHZhciB3aWR0aCA9IGRvY2sub2Zmc2V0V2lkdGg7XG4gICAgZG9jay5zdHlsZS5tYXJnaW5MZWZ0ID0gKHdpZHRoIC8gMikgKiAtMTtcbn1cblxuZnVuY3Rpb24gZG9ja0hpZGVTaG93KCkge1xuICAgIHZhciBpO1xuXG4gICAgZG9jay5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBkb2NrLnN0eWxlLmhlaWdodCA9IFwiNjBweFwiO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBidXR0b25zW2ldLnN0eWxlLmhlaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBkb2NrLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhpZGVEb2NrID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIlBXRFNldHRpbmdzXCIpKS5oaWRlRG9jaztcblxuICAgICAgICBpZiAoaGlkZURvY2sgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICBkb2NrLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjBweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZEJ1dHRvbihhcHApIHtcbiAgICBkb2NrLnN0eWxlLndpZHRoID0gZG9jay5vZmZzZXRXaWR0aCArIDQ1O1xuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBcImFwcEJ1dHRvblwiO1xuICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhcHAuYmFja2dyb3VuZENvbG9yO1xuICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIGFwcC5pbWcgKyBcIilcIjtcbiAgICBkb2NrLmFwcGVuZENoaWxkKGJ1dHRvbik7XG5cbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsYXVuY2hlci5sYXVuY2hlcihhcHApO1xuICAgIH0pO1xuXG4gICAgYnV0dG9ucy5wdXNoKGJ1dHRvbik7XG59XG5cbmZ1bmN0aW9uIGxvYWRTZXR0aW5ncygpIHtcbiAgICB2YXIgc2V0dGluZ3M7XG4gICAgaWYgKCFsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIlBXRFNldHRpbmdzXCIpKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiUFdEU2V0dGluZ3NcIiwgSlNPTi5zdHJpbmdpZnkocmVxdWlyZShcIi4vZGVmYXVsdFNldHRpbmdzLmpzb25cIikpKTtcbiAgICB9XG5cbiAgICBzZXR0aW5ncyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXCIgKyBzZXR0aW5ncy53YWxscGFwZXIgKyBcIilcIjtcblxuICAgIGlmIChzZXR0aW5ncy5kb2NrUG9zaXRpb24gPT09IFwidG9wXCIpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNsYXNzTGlzdC5hZGQoXCJkb2NrVG9wXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jbGFzc0xpc3QuYWRkKFwiZG9ja0JvdHRvbVwiKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgYXBwbGljYXRpb25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgIGFkZEJ1dHRvbihhcHBsaWNhdGlvbnNbaV0pO1xuICAgIH1cblxuICAgIGxvYWRTZXR0aW5ncygpO1xuICAgIGNlbnRyYWxpemUoKTtcbiAgICBkb2NrSGlkZVNob3coKTtcblxufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gaW5pdDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgcHdkV2luZG93ID0gcmVxdWlyZShcIi4vd2luZG93XCIpO1xuXG5mdW5jdGlvbiBBcHBsaWNhdGlvbnMoKSB7XG4gICAgdGhpcy5pbnN0YUNoYXQgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9pbnN0YUNoYXQvYXBwXCIpO1xuICAgICAgICBhcHAubGF1bmNoKGNvbnRhaW5lcik7XG4gICAgfTtcblxuICAgIHRoaXMubWVtb3J5R2FtZSA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgYXBwID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwXCIpO1xuICAgICAgICBhcHAubGF1bmNoKGNvbnRhaW5lcik7XG4gICAgfTtcblxuICAgIHRoaXMuc2V0dGluZ3MgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9zZXR0aW5ncy9hcHBcIik7XG4gICAgICAgIGFwcC5sYXVuY2goY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgLy9UT0RPIFRhIGJvcnQgYWxsdCBpIGbDtm5zdHJldCBpbm5hblxuICAgIHRoaXMuZXJyb3IgPSBmdW5jdGlvbihjb250YWluZXIsIGVycikge1xuICAgICAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGVycik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBsYXVuY2hlcihhcHApIHtcbiAgICB2YXIgY29udGFpbmVyO1xuICAgIHZhciBhcHBsaWNhdGlvbnM7XG5cbiAgICBjb250YWluZXIgPSBwd2RXaW5kb3cuY3JlYXRlV2luZG93KGFwcCk7XG4gICAgYXBwbGljYXRpb25zID0gbmV3IEFwcGxpY2F0aW9ucygpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgYXBwbGljYXRpb25zW2FwcC5pZF0oY29udGFpbmVyKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgYXBwbGljYXRpb25zLmVycm9yKGNvbnRhaW5lciwgZXJyKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaGVyID0gbGF1bmNoZXI7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbGFzdEluZGV4ID0gMDtcbnZhciBvZmZzZXRYID0gMDtcbnZhciBvZmZzZXRZID0gMDtcbnZhciBwb3NpdGlvblggPSAwO1xudmFyIHBvc2l0aW9uWSA9IDA7XG52YXIgZWxlbWVudDtcblxuZnVuY3Rpb24gZ3JhYkVsZW1lbnQodGFyZ2V0KSB7XG4gICAgZWxlbWVudCA9IHRhcmdldDtcbiAgICBvZmZzZXRYID0gcG9zaXRpb25YIC0gZWxlbWVudC5vZmZzZXRMZWZ0O1xuICAgIG9mZnNldFkgPSBwb3NpdGlvblkgLSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbn1cblxuZnVuY3Rpb24gbW92ZUVsZW1lbnQoZXZlbnQpIHtcbiAgICBwb3NpdGlvblggPSBldmVudC5jbGllbnRYO1xuICAgIHBvc2l0aW9uWSA9IGV2ZW50LmNsaWVudFk7XG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gcG9zaXRpb25YIC0gKG9mZnNldFggKyAyKSArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSBwb3NpdGlvblkgLSAob2Zmc2V0WSArIDIpICsgXCJweFwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVsZWFzZUVsZW1lbnQoKSB7XG4gICAgZWxlbWVudCA9IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gYWRkVGVtcGxhdGUodGVtcGxhdGVOYW1lLCBjb250YWluZXJOYW1lKSB7XG4gICAgdmFyIGNvbnRhaW5lcjtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIG5vZGU7XG5cbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lck5hbWUpO1xuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0ZW1wbGF0ZU5hbWUpO1xuICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub2RlKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlV2luZG93KGFwcCkge1xuICAgIHZhciB0b3BiYXI7XG4gICAgdmFyIGFwcFdpbmRvdztcblxuICAgIGFkZFRlbXBsYXRlKFwiI2FwcFdpbmRvd1RlbXBsYXRlXCIsIFwiYm9keVwiKTtcblxuICAgIGFwcFdpbmRvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXBwV2luZG93XCIpW2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXBwV2luZG93XCIpLmxlbmd0aCAtIDFdO1xuICAgIHRvcGJhciA9IGFwcFdpbmRvdy5xdWVyeVNlbGVjdG9yKFwiLnRvcGJhclwiKTtcblxuICAgIGxhc3RJbmRleCArPSAxO1xuICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG5cbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5hcHBJY29uXCIpLnNldEF0dHJpYnV0ZShcInNyY1wiLCBhcHAuaW1nKTtcbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5hcHBUaXRsZVwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhcHAuaWQpKTtcblxuICAgIGFwcFdpbmRvdy5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhcHAuYmFja2dyb3VuZENvbG9yO1xuXG4gICAgdG9wYmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGdyYWJFbGVtZW50KGFwcFdpbmRvdyk7XG4gICAgfSk7XG5cbiAgICBhcHBXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlRWxlbWVudCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgcmVsZWFzZUVsZW1lbnQpO1xuXG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgbGFzdEluZGV4ICs9IDE7XG4gICAgICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgfSk7XG5cbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5jbG9zZVdpbmRvd0J1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFwcFdpbmRvdy5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhcHBXaW5kb3c7XG59XG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZVdpbmRvdyA9IGNyZWF0ZVdpbmRvdztcbiJdfQ==
