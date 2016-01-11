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

/**
 * Is called when a mouse button was pressed down in the top bar of a window. It gives element an reference to target
 * (the element pressed). It also set's the offset of the mouse in the window. And adds 1 to the lastIndex and set's
 * the windows zIndex to lastIndex, this is so the last window pressed has the highest zIndex.
 * @param target The target window pressed.
 */
function grabElement(target) {
    element = target;
    offsetX = positionX - element.offsetLeft;
    offsetY = positionY - element.offsetTop;
    lastIndex += 1;
    element.style.zIndex = lastIndex;
}

/**
 * Is called when the mouse moves. Checks if element has a value. If so a window has been pressed and we know what
 * window to move. If not nothing will happen.
 * @param event The event that got triggered and called the function.
 */
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

/**
 * Is called if the mouse button is released. Set's element to undefined so a window won't be moved around.
 */
function releaseElement() {
    element = undefined;
}

/**
 * Takes the name of the template and the name of the container and loads the content of the template into the
 * container.
 * @param templateName
 * @param containerName
 */
function addTemplate(templateName, containerName) {
    var container;
    var template;
    var node;

    container = document.querySelector(containerName);
    template = document.querySelector(templateName);
    node = document.importNode(template.content, true);
    container.appendChild(node);
}

/**
 * A window is created. Universal content like top bar is added and some pieces of style is added like icons and
 * background color. Eventlisteners for moving the window and closing it is also added.
 * @param app An object containing information about the application loaded into the window.
 * @returns HTML Element The window element.
 */
function createWindow(app) {
    var topbar;
    var appWindow;

    addTemplate("#appWindowTemplate", "body");
    appWindow = document.querySelectorAll(".appWindow")[document.querySelectorAll(".appWindow").length - 1];
    appWindow.style.backgroundColor = app.backgroundColor;
    topbar = appWindow.querySelector(".topbar");
    topbar.querySelector(".appIcon").setAttribute("src", app.img);
    topbar.querySelector(".appTitle").appendChild(document.createTextNode(app.id));

    lastIndex += 1;
    appWindow.style.zIndex = lastIndex;

    // Grab window
    topbar.addEventListener("mousedown", function() {
        grabElement(appWindow);
    });

    // Move window
    appWindow.addEventListener("mousemove", moveElement);

    // Release window
    document.addEventListener("mouseup", releaseElement);

    // Focus on window and move to top
    appWindow.addEventListener("click", function(event) {
        event.stopPropagation();
        lastIndex += 1;
        appWindow.style.zIndex = lastIndex;
    });

    // Close window
    topbar.querySelector(".closeWindowButton").addEventListener("click", function(event) {
        event.preventDefault();
        appWindow.remove();
    });

    return appWindow;
}

module.exports.createWindow = createWindow;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvc2V0dGluZ3MvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnNMaXN0Lmpzb24iLCJjbGllbnQvc291cmNlL2pzL2RlZmF1bHRTZXR0aW5ncy5qc29uIiwiY2xpZW50L3NvdXJjZS9qcy9sYXVuY2hlci5qcyIsImNsaWVudC9zb3VyY2UvanMvcHdkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy93aW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBkb2NrID0gcmVxdWlyZShcIi4vcHdkXCIpO1xuZG9jay5pbml0KCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gaW5zdGFDaGF0KGNvbnRhaW5lcikge1xuXG4gICAgdmFyIHNvY2tldCA9IG51bGw7XG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgICAgYWRyZXNzOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXG4gICAgICAgIGtleTogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiLFxuICAgICAgICBjaGFubmVsOiBcIlwiXG4gICAgfTtcblxuICAgIGxvZ2luKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwcmludE9wZXJhdGlvbnNTY3JlZW4oKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLnRleHRBcmVhXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICBzZW5kKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gcHJpbnRMb2dpblNjcmVlbigpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgbm9kZTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5zdGFDaGF0TG9naW5UZW1wbGF0ZVwiKTtcbiAgICAgICAgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub2RlKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludE9wZXJhdGlvbnNTY3JlZW4oKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIG5vZGU7XG4gICAgICAgIHZhciBvcHRpb25zO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNpbnN0YUNoYXRUZW1wbGF0ZVwiKTtcbiAgICAgICAgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChub2RlKTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjY2hhbm5lbFNlbGVjdFRlbXBhbHRlXCIpO1xuICAgICAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi50b3BiYXJcIikuYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHNlbGVjdGVkO1xuICAgICAgICAgICAgb3B0aW9ucyA9IG5vZGUuY2hpbGRyZW47XG5cbiAgICAgICAgICAgIHNlbGVjdGVkID0gbm9kZS5vcHRpb25zW25vZGUuc2VsZWN0ZWRJbmRleF07XG5cbiAgICAgICAgICAgIGNvbmZpZy5jaGFubmVsID0gc2VsZWN0ZWQudmFsdWU7XG4gICAgICAgICAgICBwcmludE5vdGlmaWNhdGlvbihcIlN3aXRjaGVkIHRvIFwiICsgc2VsZWN0ZWQuZmlyc3RDaGlsZC5kYXRhICsgXCIgY2hhbm5lbFwiLCBmYWxzZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50TWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIGZyYWdtZW50O1xuICAgICAgICB2YXIgbWVzc2FnZUVsZW1lbnQ7XG4gICAgICAgIHZhciB1c2VybmFtZUVsZW1lbnQ7XG4gICAgICAgIHZhciBjaGF0Qm94ID0gY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdEJveFwiKTtcbiAgICAgICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgpO1xuICAgICAgICB2YXIgdGltZSA9IGRhdGUuZ2V0SG91cnMoKSArIFwiOlwiO1xuICAgICAgICBpZiAoZGF0ZS5nZXRNaW51dGVzKCkgPCAxMCkge1xuICAgICAgICAgICAgdGltZSArPSAwO1xuICAgICAgICB9XG5cbiAgICAgICAgdGltZSArPSBkYXRlLmdldE1pbnV0ZXMoKTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVRlbXBsYXRlXCIpO1xuICAgICAgICBmcmFnbWVudCA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgICAgICAgdXNlcm5hbWVFbGVtZW50ID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvcihcIi51c2VybmFtZVwiKTtcbiAgICAgICAgbWVzc2FnZUVsZW1lbnQgPSBmcmFnbWVudC5xdWVyeVNlbGVjdG9yKFwiLm1lc3NhZ2VcIik7XG5cbiAgICAgICAgaWYgKG1lc3NhZ2UudXNlcm5hbWUgPT09IHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lKSB7XG4gICAgICAgICAgICBtZXNzYWdlLnVzZXJuYW1lID0gXCJZb3VcIjtcbiAgICAgICAgICAgIHVzZXJuYW1lRWxlbWVudC5jbGFzc05hbWUgKz0gXCIgdXNlcm5hbWVTZW50XCI7XG4gICAgICAgICAgICBtZXNzYWdlRWxlbWVudC5jbGFzc05hbWUgKz0gXCIgbWVzc2FnZVNlbnRcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIHVzZXJuYW1lRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlLnVzZXJuYW1lICsgXCIgXCIgKyB0aW1lKSk7XG4gICAgICAgIG1lc3NhZ2VFbGVtZW50LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UuZGF0YSkpO1xuXG4gICAgICAgIGNoYXRCb3guYXBwZW5kQ2hpbGQoZnJhZ21lbnQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50Tm90aWZpY2F0aW9uKG1lc3NhZ2UsIHRlbXBvcmFyeSkge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25vdGlmaWNhdGlvblRlbXBsYXRlXCIpO1xuICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgdmFyIHRleHQ7XG5cbiAgICAgICAgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpO1xuXG4gICAgICAgIG5vdGlmaWNhdGlvbi5hcHBlbmRDaGlsZCh0ZXh0KTtcblxuICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jaGF0Qm94XCIpLmFwcGVuZENoaWxkKG5vdGlmaWNhdGlvbik7XG5cbiAgICAgICAgaWYgKHRlbXBvcmFyeSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGxvZ2luKCkge1xuICAgICAgICBwcmludExvZ2luU2NyZWVuKCk7XG4gICAgICAgIHZhciBsb2dpbkRpdiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmluc3RhQ2hhdExvZ2luXCIpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG5cbiAgICAgICAgICAgIGlmIChzZXNzaW9uU3RvcmFnZS51c2VybmFtZSkge1xuICAgICAgICAgICAgICAgIGxvZ2luRGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZ2luRGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS51c2VybmFtZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2luRGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuYWxlcnRUZXh0XCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiUGxlYXNlIGVudGVyIGEgdXNlcm5hbWUhXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjb25uZWN0KCkge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgICAgICBzb2NrZXQgPSBuZXcgV2ViU29ja2V0KGNvbmZpZy5hZHJlc3MpO1xuICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJvcGVuXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlV2luZG93QnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgc29ja2V0LmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KFwiQW4gZXJyb3IgaGFzIG9jY3VyZWRcIik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuY2hhbm5lbCA9PT0gY29uZmlnLmNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50TWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS50eXBlID09PSBcIm5vdGlmaWNhdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHByaW50Tm90aWZpY2F0aW9uKG1lc3NhZ2UuZGF0YSArIFwiIFdlbGNvbWUgXCIgKyBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIiksIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUbygwLCAxMDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbmQodGV4dCkge1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIHR5cGU6IFwibWVzc2FnZVwiLFxuICAgICAgICAgICAgZGF0YTogdGV4dCxcbiAgICAgICAgICAgIHVzZXJuYW1lOiBzZXNzaW9uU3RvcmFnZS51c2VybmFtZSxcbiAgICAgICAgICAgIGNoYW5uZWw6IGNvbmZpZy5jaGFubmVsLFxuICAgICAgICAgICAga2V5OiBjb25maWcua2V5XG4gICAgICAgIH07XG4gICAgICAgIHNvY2tldC5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaCA9IGluc3RhQ2hhdDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBtZW1vcnlHYW1lKGNvbnRhaW5lcikge1xuICAgIHZhciBnYW1lQm9hcmQ7XG4gICAgdmFyIHJvd3M7XG4gICAgdmFyIGNvbHM7XG4gICAgdmFyIHR1cm4xO1xuICAgIHZhciB0dXJuMjtcbiAgICB2YXIgbGFzdFRpbGU7XG4gICAgdmFyIHBhaXJzID0gMDtcbiAgICB2YXIgdHJpZXMgPSAwO1xuXG4gICAgcHJpbnRTdGFydFNjcmVlbigpLnRoZW4oZnVuY3Rpb24oYm9hcmRTaXplKSB7XG4gICAgICAgIHZhciBzaXplO1xuICAgICAgICBzaXplID0gYm9hcmRTaXplLnNwbGl0KFwieFwiKTtcbiAgICAgICAgcm93cyA9IHBhcnNlSW50KHNpemVbMF0pO1xuICAgICAgICBjb2xzID0gcGFyc2VJbnQoc2l6ZVsxXSk7XG4gICAgICAgIHBsYXlHYW1lKCk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBwbGF5R2FtZSgpIHtcbiAgICAgICAgdmFyIHRpbGVzID0gZ2V0QnJpY2tzQXJyYXkoKTtcbiAgICAgICAgZ2FtZUJvYXJkID0gcHJpbnRHYW1lU2NyZWVuKHRpbGVzKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdhbWVCb2FyZCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRTdGFydFNjcmVlbigpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgZGl2O1xuICAgICAgICB2YXIgY3JlZGl0cztcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciBib2FyZFNpemU7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUdhbWVTdGFydFRlbXBsYXRlXCIpO1xuICAgICAgICBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZGl2LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5Q3JlZGl0c1RlbXBsYXRlXCIpO1xuICAgICAgICBjcmVkaXRzID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKGNyZWRpdHMpO1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChkaXYpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSAoZnVuY3Rpb24ocmVzb2x2ZSkge1xuICAgICAgICAgICAgZm9yIChpID0gMTsgaSA8IDQ7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGRpdi5jaGlsZHJlbltpXS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgYm9hcmRTaXplID0gdGhpcy5maXJzdENoaWxkLmxhc3RDaGlsZC5ub2RlVmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShib2FyZFNpemUpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludEdhbWVTY3JlZW4odGlsZXMpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgdGVtcGxhdGVDb250ZW50O1xuICAgICAgICB2YXIgZGl2O1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlCcmlja1RlbXBsYXRlXCIpO1xuICAgICAgICB0ZW1wbGF0ZUNvbnRlbnQgPSB0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlHYW1lVGVtcGxhdGVcIik7XG4gICAgICAgIGRpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICAgICAgdGlsZXMuZm9yRWFjaChmdW5jdGlvbih0aWxlLCBpbmRleCkge1xuICAgICAgICAgICAgdmFyIGE7XG5cbiAgICAgICAgICAgIGEgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlQ29udGVudCwgdHJ1ZSk7XG4gICAgICAgICAgICBhZGRHYW1lTWVjaGFuaWNzKGEsIHRpbGUsIGluZGV4KTtcbiAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChhKTtcblxuICAgICAgICAgICAgaWYgKGNvbHMgPT09IDIpIHtcbiAgICAgICAgICAgICAgICBhLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTmFtZSA9IFwiYnJpY2tXaWR0aDJcIjtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY29scyA9PT0gNCkge1xuICAgICAgICAgICAgICAgIGEuZmlyc3RFbGVtZW50Q2hpbGQuY2xhc3NOYW1lID0gXCJicmlja1dpZHRoNFwiO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoKGluZGV4ICsgMSkgJSBjb2xzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiclwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkaXY7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYWRkR2FtZU1lY2hhbmljcyhhLCB0aWxlLCBpbmRleCkge1xuICAgICAgICBhLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgdmFyIGltZztcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIGltZyA9IGV2ZW50LnRhcmdldC5ub2RlTmFtZSA9PT0gXCJJTUdcIiA/IGV2ZW50LnRhcmdldCA6IGV2ZW50LnRhcmdldC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgICAgICAgICAgZ2FtZUxvZ2ljKHRpbGUsIGluZGV4LCBpbWcpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRCcmlja3NBcnJheSgpIHtcbiAgICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgICB2YXIgdGVtcDtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgZm9yIChpID0gMTsgaSA8PSAocm93cyAqIGNvbHMpIC8gMjsgaSArPSAxKSB7XG4gICAgICAgICAgICBhcnIucHVzaChpKTtcbiAgICAgICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChpID0gYXJyLmxlbmd0aCAtIDE7IGkgPiAwOyBpIC09IDEpIHtcbiAgICAgICAgICAgIHZhciByYW5kb21OdW1iZXIgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBpKTtcbiAgICAgICAgICAgIHRlbXAgPSBhcnJbaV07XG4gICAgICAgICAgICBhcnJbaV0gPSBhcnJbcmFuZG9tTnVtYmVyXTtcbiAgICAgICAgICAgIGFycltyYW5kb21OdW1iZXJdID0gdGVtcDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnI7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2FtZUxvZ2ljKHRpbGUsIGluZGV4LCBpbWcpIHtcbiAgICAgICAgaWYgKHR1cm4yKSB7cmV0dXJuO31cblxuICAgICAgICBpbWcuc3JjID0gXCJpbWFnZS9cIiArIHRpbGUgKyBcIi5wbmdcIjtcblxuICAgICAgICBpZiAoIXR1cm4xKSB7XG4gICAgICAgICAgICB0dXJuMSA9IGltZztcbiAgICAgICAgICAgIGxhc3RUaWxlID0gdGlsZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChpbWcgPT09IHR1cm4xKSB7cmV0dXJuO31cblxuICAgICAgICAgICAgdHJpZXMgKz0gMTtcblxuICAgICAgICAgICAgdHVybjIgPSBpbWc7XG4gICAgICAgICAgICBpZiAodGlsZSA9PT0gbGFzdFRpbGUpIHtcbiAgICAgICAgICAgICAgICBwYWlycyArPSAxO1xuXG4gICAgICAgICAgICAgICAgaWYgKHBhaXJzID09PSAoY29scyAqIHJvd3MpIC8gMikge1xuICAgICAgICAgICAgICAgICAgICBnYW1lQm9hcmQucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHByaW50SGlnaFNjb3JlU2NyZWVuKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJyZW1vdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcInJlbW92ZVwiKTtcblxuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4xLnNyYyA9IFwiaW1hZ2UvMC5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgdHVybjIuc3JjID0gXCJpbWFnZS8wLnBuZ1wiO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRIaWdoU2NvcmVTY3JlZW4oKSB7XG4gICAgICAgIHZhciBzdG9yYWdlTmFtZSA9IFwibWVtb3J5XCIgKyByb3dzICsgXCJ4XCIgKyBjb2xzO1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBnYW1lRW5kRGl2O1xuICAgICAgICB2YXIgaGlnaFNjb3JlO1xuICAgICAgICB2YXIgY3JlZGl0cztcblxuICAgICAgICBoaWdoU2NvcmUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VOYW1lKSk7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUdhbWVFbmRUZW1wbGF0ZVwiKTtcbiAgICAgICAgZ2FtZUVuZERpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICAgICAgZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiLnNhdmVIaWdoc2NvcmVGb3JtXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBzYXZlSGlnaFNjb3JlKGdhbWVFbmREaXYucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpWzBdLnZhbHVlKTtcbiAgICAgICAgICAgIGdhbWVFbmREaXYucXVlcnlTZWxlY3RvcihcIi5zYXZlSGlnaHNjb3JlRm9ybVwiKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHByaW50SGlnaFNjb3JlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByaW50SGlnaFNjb3JlKCk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChnYW1lRW5kRGl2KTtcblxuICAgICAgICBmdW5jdGlvbiBwcmludEhpZ2hTY29yZSgpIHtcbiAgICAgICAgICAgIGhpZ2hTY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZU5hbWUpKTtcbiAgICAgICAgICAgIHZhciBvbGRTY29yZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmhpZ2hTY29yZVwiKTtcbiAgICAgICAgICAgIGlmIChvbGRTY29yZSkge1xuICAgICAgICAgICAgICAgIG9sZFNjb3JlLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaGlnaFNjb3JlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICAgICAgdmFyIHNjb3JlO1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiI2hpZ2hTY29yZVRlbXBhdGVcIik7XG4gICAgICAgICAgICAgICAgdmFyIHNjb3JlQm9hcmQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGhpZ2hTY29yZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzY29yZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTmlja25hbWU6IFwiICsgaGlnaFNjb3JlW2ldLm5pY2tuYW1lICsgXCIgfCBUcmllczogXCIgKyBoaWdoU2NvcmVbaV0udHJpZXMpO1xuICAgICAgICAgICAgICAgICAgICBzY29yZUJvYXJkLmNoaWxkcmVuW2ldLmFwcGVuZENoaWxkKHNjb3JlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBnYW1lRW5kRGl2LmFwcGVuZENoaWxkKHNjb3JlQm9hcmQpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiI25vSGlnaFNjb3JlVGVtcGF0ZVwiKTtcbiAgICAgICAgICAgICAgICBnYW1lRW5kRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gc2F2ZUhpZ2hTY29yZShuaWNrbmFtZSkge1xuICAgICAgICAgICAgaWYgKGhpZ2hTY29yZSkge1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZS5wdXNoKHtuaWNrbmFtZTogbmlja25hbWUsIHRyaWVzOiB0cmllc30pO1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIE51bWJlcihhLnRyaWVzKSAtIE51bWJlcihiLnRyaWVzKTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIGhpZ2hTY29yZS5zcGxpY2UoNSwgMSk7XG5cbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdG9yYWdlTmFtZSwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZSA9IFtcbiAgICAgICAgICAgICAgICAgICAge25pY2tuYW1lOiBuaWNrbmFtZSwgdHJpZXM6IHRyaWVzfVxuICAgICAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShzdG9yYWdlTmFtZSwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaCA9IG1lbW9yeUdhbWU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gc2V0dGluZ3MoY29udGFpbmVyKSB7XG4gICAgdmFyIGZvcm07XG4gICAgdmFyIGlucHV0cztcbiAgICB2YXIgdGVtcGxhdGU7XG5cbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2V0dGluZ3NUZW1wbGF0ZVwiKTtcbiAgICBmb3JtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICBpbnB1dHMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcblxuICAgIGZpbGxGb3JtV2l0aERhdGEoKTtcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBhcHBseSgpO1xuICAgIH0pO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGlucHV0c1s1XS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICBpbnB1dHNbNl0uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIGlucHV0c1s1XS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFwcGx5KCk7XG4gICAgfSk7XG4gICAgaW5wdXRzWzZdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZmlsbEZvcm1XaXRoRGF0YSgpO1xuICAgIH0pO1xuICAgIGlucHV0c1s3XS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc2V0VG9EZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBmaWxsRm9ybVdpdGhEYXRhKCkge1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpO1xuXG4gICAgICAgIGlucHV0c1swXS52YWx1ZSA9IHNldHRpbmdzLndhbGxwYXBlcjtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuaGlkZURvY2sgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICBpbnB1dHNbMV0uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dHNbMl0uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MuZG9ja1Bvc2l0aW9uID09PSBcInRvcFwiKSB7XG4gICAgICAgICAgICBpbnB1dHNbM10uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dHNbNF0uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpbnB1dHNbNV0uZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICBpbnB1dHNbNl0uZGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFwcGx5KCl7XG4gICAgICAgIHZhciBuZXdTZXR0aW5nID0ge1xuICAgICAgICAgICAgd2FsbHBhcGVyOiBpbnB1dHNbMF0udmFsdWUsXG4gICAgICAgICAgICBoaWRlRG9jazogaW5wdXRzWzFdLmNoZWNrZWQgPyBcInRydWVcIiA6IFwiZmFsc2VcIixcbiAgICAgICAgICAgIGRvY2tQb3NpdGlvbjogaW5wdXRzWzNdLmNoZWNrZWQgPyBcInRvcFwiIDogXCJib3R0b21cIlxuICAgICAgICB9O1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIlBXRFNldHRpbmdzXCIsIEpTT04uc3RyaW5naWZ5KG5ld1NldHRpbmcpKTtcbiAgICAgICAgdXNlTmV3U2V0dGluZ3MoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldFRvRGVmYXVsdCgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJQV0RTZXR0aW5nc1wiLCBKU09OLnN0cmluZ2lmeShyZXF1aXJlKFwiLi4vLi4vZGVmYXVsdFNldHRpbmdzLmpzb25cIikpKTtcbiAgICAgICAgZmlsbEZvcm1XaXRoRGF0YSgpO1xuICAgICAgICB1c2VOZXdTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHVzZU5ld1NldHRpbmdzKCkge1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgdmFyIHNldHRpbmdzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIlBXRFNldHRpbmdzXCIpKTtcbiAgICAgICAgdmFyIGJ1dHRvbnM7XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImJvZHlcIikuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXCIgKyBzZXR0aW5ncy53YWxscGFwZXIgKyBcIilcIjtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuaGlkZURvY2sgPT09IFwiZmFsc2VcIikge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLnN0eWxlLmhlaWdodCA9IFwiNjBweFwiO1xuICAgICAgICAgICAgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jaGlsZHJlbjtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBidXR0b25zW2ldLnN0eWxlLmhlaWdodCA9IFwiNTBweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG4gICAgICAgICAgICBidXR0b25zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncy5kb2NrUG9zaXRpb24gPT09IFwidG9wXCIpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jbGFzc05hbWUgPSBcImRvY2tUb3BcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jbGFzc05hbWUgPSBcImRvY2tCb3R0b21cIjtcbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoID0gc2V0dGluZ3M7XG4iLCJtb2R1bGUuZXhwb3J0cz1bXG4gICAge1wiaWRcIjogXCJpbnN0YUNoYXRcIiwgXCJpbWdcIjogXCIuLi9pbWFnZS9pbnN0YUNoYXQucG5nXCIsIFwiYmFja2dyb3VuZENvbG9yXCI6IFwieWVsbG93Z3JlZW5cIn0sXG4gICAge1wiaWRcIjogXCJtZW1vcnlHYW1lXCIsIFwiaW1nXCI6IFwiLi4vaW1hZ2UvdGVzdEFwcC5wbmdcIiwgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCJjb3JuZmxvd2VyQmx1ZVwifSxcbiAgICB7XCJpZFwiOiBcInNldHRpbmdzXCIsIFwiaW1nXCI6IFwiLi4vaW1hZ2Uvc2V0dGluZ3MucG5nXCIsIFwiYmFja2dyb3VuZENvbG9yXCI6IFwiR29sZFwifVxuXVxuXG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gICAgXCJ3YWxscGFwZXJcIjogXCIuLi9pbWFnZS93YWxscGFwZXIuanBnXCIsXG4gICAgXCJoaWRlRG9ja1wiOiBcImZhbHNlXCIsXG4gICAgXCJkb2NrUG9zaXRpb25cIjogXCJib3R0b21cIlxufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBwd2RXaW5kb3cgPSByZXF1aXJlKFwiLi93aW5kb3dcIik7XG5cbmZ1bmN0aW9uIEFwcGxpY2F0aW9ucygpIHtcbiAgICB0aGlzLmluc3RhQ2hhdCA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgYXBwID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zL2luc3RhQ2hhdC9hcHBcIik7XG4gICAgICAgIGFwcC5sYXVuY2goY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgdGhpcy5tZW1vcnlHYW1lID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvbWVtb3J5R2FtZS9hcHBcIik7XG4gICAgICAgIGFwcC5sYXVuY2goY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zZXR0aW5ncyA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgICAgICB2YXIgYXBwID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zL3NldHRpbmdzL2FwcFwiKTtcbiAgICAgICAgYXBwLmxhdW5jaChjb250YWluZXIpO1xuICAgIH07XG5cblxuICAgIHRoaXMuZXJyb3IgPSBmdW5jdGlvbihjb250YWluZXIsIGVycikge1xuICAgICAgICB2YXIgZWxlbWVudHMgPSBjb250YWluZXIuY2hpbGRyZW47XG4gICAgICAgIHZhciB0ZXh0O1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGVsZW1lbnRzW2ldLnJlbW92ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGVycik7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZCh0ZXh0KTtcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBsYXVuY2hlcihhcHApIHtcbiAgICB2YXIgY29udGFpbmVyO1xuICAgIHZhciBhcHBsaWNhdGlvbnM7XG5cbiAgICBjb250YWluZXIgPSBwd2RXaW5kb3cuY3JlYXRlV2luZG93KGFwcCk7XG4gICAgYXBwbGljYXRpb25zID0gbmV3IEFwcGxpY2F0aW9ucygpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgYXBwbGljYXRpb25zW2FwcC5pZF0oY29udGFpbmVyKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgYXBwbGljYXRpb25zLmVycm9yKGNvbnRhaW5lciwgZXJyKTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzLmxhdW5jaGVyID0gbGF1bmNoZXI7XG5cbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vL1RPRE8gRsO2cnPDtmsgcmVuc2EgdXBwIHPDpSBta3QgaHRtbCBvY2ggY3NzIGZyw6VuIGphdmFzY3JpcHRrb2Rlbi5cblxudmFyIGRvY2sgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIik7XG52YXIgYnV0dG9ucyA9IFtdO1xudmFyIGxhdW5jaGVyID0gcmVxdWlyZShcIi4vbGF1bmNoZXJcIik7XG5cbnZhciBhcHBsaWNhdGlvbnMgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnNMaXN0XCIpO1xuXG5mdW5jdGlvbiBjZW50cmFsaXplKCkge1xuICAgIHZhciB3aWR0aCA9IGRvY2sub2Zmc2V0V2lkdGg7XG4gICAgZG9jay5zdHlsZS5tYXJnaW5MZWZ0ID0gKHdpZHRoIC8gMikgKiAtMTtcbn1cblxuZnVuY3Rpb24gZG9ja0hpZGVTaG93KCkge1xuICAgIHZhciBpO1xuXG4gICAgZG9jay5hZGRFdmVudExpc3RlbmVyKFwibW91c2VvdmVyXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBkb2NrLnN0eWxlLmhlaWdodCA9IFwiNjBweFwiO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBidXR0b25zW2ldLnN0eWxlLmhlaWdodCA9IFwiNTBweFwiO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBkb2NrLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGhpZGVEb2NrID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIlBXRFNldHRpbmdzXCIpKS5oaWRlRG9jaztcblxuICAgICAgICBpZiAoaGlkZURvY2sgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICBkb2NrLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjBweFwiO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGFkZEJ1dHRvbihhcHApIHtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIGJ1dHRvbjtcblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhcHBCdXR0b25UZW1wbGF0ZVwiKTtcbiAgICBidXR0b24gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIGZhbHNlKTtcblxuICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBcImFwcEJ1dHRvblwiO1xuICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBhcHAuYmFja2dyb3VuZENvbG9yO1xuICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIGFwcC5pbWcgKyBcIilcIjtcbiAgICBkb2NrLmFwcGVuZENoaWxkKGJ1dHRvbik7XG4gICAgZG9jay5zdHlsZS53aWR0aCA9IGRvY2sub2Zmc2V0V2lkdGggKyA0NTtcblxuICAgIGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbXQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbGF1bmNoZXIubGF1bmNoZXIoYXBwKTtcbiAgICB9KTtcblxuICAgIGJ1dHRvbnMucHVzaChidXR0b24pO1xufVxuXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3MoKSB7XG4gICAgdmFyIHNldHRpbmdzO1xuICAgIGlmICghbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIlBXRFNldHRpbmdzXCIsIEpTT04uc3RyaW5naWZ5KHJlcXVpcmUoXCIuL2RlZmF1bHRTZXR0aW5ncy5qc29uXCIpKSk7XG4gICAgfVxuXG4gICAgc2V0dGluZ3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgc2V0dGluZ3Mud2FsbHBhcGVyICsgXCIpXCI7XG5cbiAgICBpZiAoc2V0dGluZ3MuZG9ja1Bvc2l0aW9uID09PSBcInRvcFwiKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jbGFzc0xpc3QuYWRkKFwiZG9ja1RvcFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuY2xhc3NMaXN0LmFkZChcImRvY2tCb3R0b21cIik7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpbml0KCkge1xuICAgIHZhciBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGFwcGxpY2F0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhZGRCdXR0b24oYXBwbGljYXRpb25zW2ldKTtcbiAgICB9XG5cbiAgICBsb2FkU2V0dGluZ3MoKTtcbiAgICBjZW50cmFsaXplKCk7XG4gICAgZG9ja0hpZGVTaG93KCk7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMuaW5pdCA9IGluaXQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGxhc3RJbmRleCA9IDA7XG52YXIgb2Zmc2V0WCA9IDA7XG52YXIgb2Zmc2V0WSA9IDA7XG52YXIgcG9zaXRpb25YID0gMDtcbnZhciBwb3NpdGlvblkgPSAwO1xudmFyIGVsZW1lbnQ7XG5cbi8qKlxuICogSXMgY2FsbGVkIHdoZW4gYSBtb3VzZSBidXR0b24gd2FzIHByZXNzZWQgZG93biBpbiB0aGUgdG9wIGJhciBvZiBhIHdpbmRvdy4gSXQgZ2l2ZXMgZWxlbWVudCBhbiByZWZlcmVuY2UgdG8gdGFyZ2V0XG4gKiAodGhlIGVsZW1lbnQgcHJlc3NlZCkuIEl0IGFsc28gc2V0J3MgdGhlIG9mZnNldCBvZiB0aGUgbW91c2UgaW4gdGhlIHdpbmRvdy4gQW5kIGFkZHMgMSB0byB0aGUgbGFzdEluZGV4IGFuZCBzZXQnc1xuICogdGhlIHdpbmRvd3MgekluZGV4IHRvIGxhc3RJbmRleCwgdGhpcyBpcyBzbyB0aGUgbGFzdCB3aW5kb3cgcHJlc3NlZCBoYXMgdGhlIGhpZ2hlc3QgekluZGV4LlxuICogQHBhcmFtIHRhcmdldCBUaGUgdGFyZ2V0IHdpbmRvdyBwcmVzc2VkLlxuICovXG5mdW5jdGlvbiBncmFiRWxlbWVudCh0YXJnZXQpIHtcbiAgICBlbGVtZW50ID0gdGFyZ2V0O1xuICAgIG9mZnNldFggPSBwb3NpdGlvblggLSBlbGVtZW50Lm9mZnNldExlZnQ7XG4gICAgb2Zmc2V0WSA9IHBvc2l0aW9uWSAtIGVsZW1lbnQub2Zmc2V0VG9wO1xuICAgIGxhc3RJbmRleCArPSAxO1xuICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xufVxuXG4vKipcbiAqIElzIGNhbGxlZCB3aGVuIHRoZSBtb3VzZSBtb3Zlcy4gQ2hlY2tzIGlmIGVsZW1lbnQgaGFzIGEgdmFsdWUuIElmIHNvIGEgd2luZG93IGhhcyBiZWVuIHByZXNzZWQgYW5kIHdlIGtub3cgd2hhdFxuICogd2luZG93IHRvIG1vdmUuIElmIG5vdCBub3RoaW5nIHdpbGwgaGFwcGVuLlxuICogQHBhcmFtIGV2ZW50IFRoZSBldmVudCB0aGF0IGdvdCB0cmlnZ2VyZWQgYW5kIGNhbGxlZCB0aGUgZnVuY3Rpb24uXG4gKi9cbmZ1bmN0aW9uIG1vdmVFbGVtZW50KGV2ZW50KSB7XG4gICAgcG9zaXRpb25YID0gZXZlbnQuY2xpZW50WDtcbiAgICBwb3NpdGlvblkgPSBldmVudC5jbGllbnRZO1xuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgIHZhciBuZXdMZWZ0ID0gcG9zaXRpb25YIC0gKG9mZnNldFggKyAyKTtcbiAgICAgICAgdmFyIG5ld1RvcCA9IHBvc2l0aW9uWSAtIChvZmZzZXRZICsgMik7XG5cbiAgICAgICAgbmV3TGVmdCA9IG5ld0xlZnQgPCAwID8gMCA6IG5ld0xlZnQ7XG4gICAgICAgIG5ld1RvcCA9IG5ld1RvcCA8IDAgPyAwIDogbmV3VG9wO1xuXG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IG5ld0xlZnQgKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gbmV3VG9wICsgXCJweFwiO1xuICAgIH1cbn1cblxuLyoqXG4gKiBJcyBjYWxsZWQgaWYgdGhlIG1vdXNlIGJ1dHRvbiBpcyByZWxlYXNlZC4gU2V0J3MgZWxlbWVudCB0byB1bmRlZmluZWQgc28gYSB3aW5kb3cgd29uJ3QgYmUgbW92ZWQgYXJvdW5kLlxuICovXG5mdW5jdGlvbiByZWxlYXNlRWxlbWVudCgpIHtcbiAgICBlbGVtZW50ID0gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIFRha2VzIHRoZSBuYW1lIG9mIHRoZSB0ZW1wbGF0ZSBhbmQgdGhlIG5hbWUgb2YgdGhlIGNvbnRhaW5lciBhbmQgbG9hZHMgdGhlIGNvbnRlbnQgb2YgdGhlIHRlbXBsYXRlIGludG8gdGhlXG4gKiBjb250YWluZXIuXG4gKiBAcGFyYW0gdGVtcGxhdGVOYW1lXG4gKiBAcGFyYW0gY29udGFpbmVyTmFtZVxuICovXG5mdW5jdGlvbiBhZGRUZW1wbGF0ZSh0ZW1wbGF0ZU5hbWUsIGNvbnRhaW5lck5hbWUpIHtcbiAgICB2YXIgY29udGFpbmVyO1xuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB2YXIgbm9kZTtcblxuICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoY29udGFpbmVyTmFtZSk7XG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHRlbXBsYXRlTmFtZSk7XG4gICAgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG5vZGUpO1xufVxuXG4vKipcbiAqIEEgd2luZG93IGlzIGNyZWF0ZWQuIFVuaXZlcnNhbCBjb250ZW50IGxpa2UgdG9wIGJhciBpcyBhZGRlZCBhbmQgc29tZSBwaWVjZXMgb2Ygc3R5bGUgaXMgYWRkZWQgbGlrZSBpY29ucyBhbmRcbiAqIGJhY2tncm91bmQgY29sb3IuIEV2ZW50bGlzdGVuZXJzIGZvciBtb3ZpbmcgdGhlIHdpbmRvdyBhbmQgY2xvc2luZyBpdCBpcyBhbHNvIGFkZGVkLlxuICogQHBhcmFtIGFwcCBBbiBvYmplY3QgY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgYXBwbGljYXRpb24gbG9hZGVkIGludG8gdGhlIHdpbmRvdy5cbiAqIEByZXR1cm5zIEhUTUwgRWxlbWVudCBUaGUgd2luZG93IGVsZW1lbnQuXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZVdpbmRvdyhhcHApIHtcbiAgICB2YXIgdG9wYmFyO1xuICAgIHZhciBhcHBXaW5kb3c7XG5cbiAgICBhZGRUZW1wbGF0ZShcIiNhcHBXaW5kb3dUZW1wbGF0ZVwiLCBcImJvZHlcIik7XG4gICAgYXBwV2luZG93ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5hcHBXaW5kb3dcIilbZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5hcHBXaW5kb3dcIikubGVuZ3RoIC0gMV07XG4gICAgYXBwV2luZG93LnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFwcC5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgdG9wYmFyID0gYXBwV2luZG93LnF1ZXJ5U2VsZWN0b3IoXCIudG9wYmFyXCIpO1xuICAgIHRvcGJhci5xdWVyeVNlbGVjdG9yKFwiLmFwcEljb25cIikuc2V0QXR0cmlidXRlKFwic3JjXCIsIGFwcC5pbWcpO1xuICAgIHRvcGJhci5xdWVyeVNlbGVjdG9yKFwiLmFwcFRpdGxlXCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFwcC5pZCkpO1xuXG4gICAgbGFzdEluZGV4ICs9IDE7XG4gICAgYXBwV2luZG93LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcblxuICAgIC8vIEdyYWIgd2luZG93XG4gICAgdG9wYmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGdyYWJFbGVtZW50KGFwcFdpbmRvdyk7XG4gICAgfSk7XG5cbiAgICAvLyBNb3ZlIHdpbmRvd1xuICAgIGFwcFdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVFbGVtZW50KTtcblxuICAgIC8vIFJlbGVhc2Ugd2luZG93XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgcmVsZWFzZUVsZW1lbnQpO1xuXG4gICAgLy8gRm9jdXMgb24gd2luZG93IGFuZCBtb3ZlIHRvIHRvcFxuICAgIGFwcFdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGxhc3RJbmRleCArPSAxO1xuICAgICAgICBhcHBXaW5kb3cuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xuICAgIH0pO1xuXG4gICAgLy8gQ2xvc2Ugd2luZG93XG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VXaW5kb3dCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGFwcFdpbmRvdy5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhcHBXaW5kb3c7XG59XG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZVdpbmRvdyA9IGNyZWF0ZVdpbmRvdztcbiJdfQ==
