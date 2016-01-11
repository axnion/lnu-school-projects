(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var dock = require("./pwd");
dock.initialize();

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

/**
 * This is the main settings function. This creates a the settings application inside the container.
 * @param container The HTML element the application is created in.
 */
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

    form.addEventListener("change", function() {
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

    /**
     * Takes the settings saved in the local storage and fills the form with that information. Is used when the
     * application is launched and when we want to reset settings instead of applying.
     */
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

    /**
     * This creates an object and fills it with the data from the form and puts it in the local storage. useSettings
     * is then called to put the settings to use.
     */
    function apply(){
        var newSetting = {
            wallpaper: inputs[0].value,
            hideDock: inputs[1].checked ? "true" : "false",
            dockPosition: inputs[3].checked ? "top" : "bottom"
        };
        localStorage.setItem("PWDSettings", JSON.stringify(newSetting));
        useSettings();
    }

    /**
     * Is used when we want to return to our default settings. It loads settings from defaultSettings.json and puts it
     * in the local storage. fillFormWithData is then used to fill the form, and useSettings to use our new settings.
     */
    function resetToDefault() {
        localStorage.setItem("PWDSettings", JSON.stringify(require("../../defaultSettings.json")));
        fillFormWithData();
        useSettings();
    }

    /**
     * useSettings is when we want our settings to be changed visually in the application. It takes the settings out of
     * local storage and then depending on the values of the objects members different settings is set.
     */
    function useSettings() {
        var i;
        var settings = JSON.parse(localStorage.getItem("PWDSettings"));
        var buttons;

        //Set wallpaper
        document.querySelector("body").style.backgroundImage = "url(" + settings.wallpaper + ")";

        //Hide/Show Dock
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

        //Dock Position
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
    {"id": "memoryGame", "img": "../image/testApp.png", "backgroundColor": "Gold"},
    {"id": "settings", "img": "../image/settings.png", "backgroundColor": "cornflowerBlue"}
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

/**
 * A constrictor function creating an object containing methods. These methods are called when launching an application.
 * The mathod of the application has to have the same name as in the applicationsList.json. Inside one of these methods
 * you can either create and application or call a function to create an application.
 * @constructor
 */
function Applications() {

    /**
     * Is called when we want to launch an instance of the instaChat application.
     * @param container An HTML element where the application will be created.
     */
    this.instaChat = function(container) {
        var app = require("./applications/instaChat/app");
        app.launch(container);
    };

    /**
     * Is called when we want to launch an instance of the instaChat application.
     * @param container An HTML element where the application will be created.
     */
    this.memoryGame = function(container) {
        var app = require("./applications/memoryGame/app");
        app.launch(container);
    };

    /**
     * Is called when we want to launch an instance of the instaChat application.
     * @param container An HTML element where the application will be created.
     */
    this.settings = function(container) {
        var app = require("./applications/settings/app");
        app.launch(container);
    };

    /**
     * Is called when we want to launch an instance of the instaChat application.
     * @param container An HTML element where the application will be created.
     * @param err       An error message.
     */
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

/**
 * Starts by creating a new window. Then an object of Applications with all the functions to launch the applications.
 * The id member in app has the name of the method we want to call in the Applications object. We try calling that and
 * if we succeed we will have an application. If something fails during the launch of the application the error
 * application is called instead.
 * @param app An object containing information about the application to be launched.
 */
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

/**
 * Takes the dock and places it in the center of the screen.
 */
function centralize() {
    var width = dock.offsetWidth;
    dock.style.marginLeft = (width / 2) * -1;
}

/**
 * Adds two event listeners on the dock. If the mouse is over the dock an event is triggered so the dock is visible. If
 * the mouse moves out of the dock and hideDock is set to true, the dock will hide.
 */
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

/**
 * Adds a button to the dock. Loads the template, adds style to it and an event listener to launch the app.
 * @param app An object containing information about an application.
 */
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

    button.addEventListener("click", function(event) {
        event.preventDefault();
        launcher.launcher(app);
    });

    buttons.push(button);
}

/**
 * Checks if there are settings in the localstorage, if not data is loaded from defaultSettings.json and uploaded to
 * localstorage. Settings are then applied to the web application.
 */
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

/**
 * Prepares and starts the fundamental functionalities of the PWD. Creates the dock and the buttons and links them to
 * an application, loads settings and applies them.
 */
function initialize() {
    var i;

    loadSettings();

    for (i = 0; i < applications.length; i += 1) {
        addButton(applications[i]);
    }

    centralize();
    dockHideShow();
}

module.exports.initialize = initialize;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvc2V0dGluZ3MvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnNMaXN0Lmpzb24iLCJjbGllbnQvc291cmNlL2pzL2RlZmF1bHRTZXR0aW5ncy5qc29uIiwiY2xpZW50L3NvdXJjZS9qcy9sYXVuY2hlci5qcyIsImNsaWVudC9zb3VyY2UvanMvcHdkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy93aW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbk9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZG9jayA9IHJlcXVpcmUoXCIuL3B3ZFwiKTtcbmRvY2suaW5pdGlhbGl6ZSgpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIGluc3RhQ2hhdChjb250YWluZXIpIHtcblxuICAgIHZhciBzb2NrZXQgPSBudWxsO1xuICAgIHZhciBjb25maWcgPSB7XG4gICAgICAgIGFkcmVzczogXCJ3czovL3Zob3N0My5sbnUuc2U6MjAwODAvc29ja2V0L1wiLFxuICAgICAgICBrZXk6IFwiZURCRTc2ZGVVN0wwSDltRUJneFVLVlIwVkNucTBYQmRcIixcbiAgICAgICAgY2hhbm5lbDogXCJcIlxuICAgIH07XG5cbiAgICBsb2dpbigpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIGNvbm5lY3QoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcHJpbnRPcGVyYXRpb25zU2NyZWVuKCk7XG4gICAgICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi50ZXh0QXJlYVwiKS5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VuZChldmVudC50YXJnZXQudmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC50YXJnZXQudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIHByaW50TG9naW5TY3JlZW4oKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIG5vZGU7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdExvZ2luVGVtcGxhdGVcIik7XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRPcGVyYXRpb25zU2NyZWVuKCkge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBub2RlO1xuICAgICAgICB2YXIgb3B0aW9ucztcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5zdGFDaGF0VGVtcGxhdGVcIik7XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYW5uZWxTZWxlY3RUZW1wYWx0ZVwiKTtcbiAgICAgICAgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIudG9wYmFyXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZDtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBub2RlLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICBzZWxlY3RlZCA9IG5vZGUub3B0aW9uc1tub2RlLnNlbGVjdGVkSW5kZXhdO1xuXG4gICAgICAgICAgICBjb25maWcuY2hhbm5lbCA9IHNlbGVjdGVkLnZhbHVlO1xuICAgICAgICAgICAgcHJpbnROb3RpZmljYXRpb24oXCJTd2l0Y2hlZCB0byBcIiArIHNlbGVjdGVkLmZpcnN0Q2hpbGQuZGF0YSArIFwiIGNoYW5uZWxcIiwgZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludE1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBmcmFnbWVudDtcbiAgICAgICAgdmFyIG1lc3NhZ2VFbGVtZW50O1xuICAgICAgICB2YXIgdXNlcm5hbWVFbGVtZW50O1xuICAgICAgICB2YXIgY2hhdEJveCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmNoYXRCb3hcIik7XG4gICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgdmFyIHRpbWUgPSBkYXRlLmdldEhvdXJzKCkgKyBcIjpcIjtcbiAgICAgICAgaWYgKGRhdGUuZ2V0TWludXRlcygpIDwgMTApIHtcbiAgICAgICAgICAgIHRpbWUgKz0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpbWUgKz0gZGF0ZS5nZXRNaW51dGVzKCk7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lc3NhZ2VUZW1wbGF0ZVwiKTtcbiAgICAgICAgZnJhZ21lbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuXG4gICAgICAgIHVzZXJuYW1lRWxlbWVudCA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudXNlcm5hbWVcIik7XG4gICAgICAgIG1lc3NhZ2VFbGVtZW50ID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlXCIpO1xuXG4gICAgICAgIGlmIChtZXNzYWdlLnVzZXJuYW1lID09PSBzZXNzaW9uU3RvcmFnZS51c2VybmFtZSkge1xuICAgICAgICAgICAgbWVzc2FnZS51c2VybmFtZSA9IFwiWW91XCI7XG4gICAgICAgICAgICB1c2VybmFtZUVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIHVzZXJuYW1lU2VudFwiO1xuICAgICAgICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIG1lc3NhZ2VTZW50XCI7XG4gICAgICAgIH1cblxuICAgICAgICB1c2VybmFtZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZS51c2VybmFtZSArIFwiIFwiICsgdGltZSkpO1xuICAgICAgICBtZXNzYWdlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlLmRhdGEpKTtcblxuICAgICAgICBjaGF0Qm94LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmludE5vdGlmaWNhdGlvbihtZXNzYWdlLCB0ZW1wb3JhcnkpIHtcbiAgICAgICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNub3RpZmljYXRpb25UZW1wbGF0ZVwiKTtcbiAgICAgICAgdmFyIG5vdGlmaWNhdGlvbiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG4gICAgICAgIHZhciB0ZXh0O1xuXG4gICAgICAgIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKTtcblxuICAgICAgICBub3RpZmljYXRpb24uYXBwZW5kQ2hpbGQodGV4dCk7XG5cbiAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuY2hhdEJveFwiKS5hcHBlbmRDaGlsZChub3RpZmljYXRpb24pO1xuXG4gICAgICAgIGlmICh0ZW1wb3JhcnkpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uLnJlbW92ZSgpO1xuICAgICAgICAgICAgfSwgNTAwMCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2dpbigpIHtcbiAgICAgICAgcHJpbnRMb2dpblNjcmVlbigpO1xuICAgICAgICB2YXIgbG9naW5EaXYgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5pbnN0YUNoYXRMb2dpblwiKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSkge1xuXG4gICAgICAgICAgICBpZiAoc2Vzc2lvblN0b3JhZ2UudXNlcm5hbWUpIHtcbiAgICAgICAgICAgICAgICBsb2dpbkRpdi5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsb2dpbkRpdi5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQua2V5Q29kZSA9PT0gMTMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGV2ZW50LnRhcmdldC52YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2Vzc2lvblN0b3JhZ2UudXNlcm5hbWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBsb2dpbkRpdi5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmFsZXJ0VGV4dFwiKS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlBsZWFzZSBlbnRlciBhIHVzZXJuYW1lIVwiKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY29ubmVjdCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldChjb25maWcuYWRyZXNzKTtcbiAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jbG9zZVdpbmRvd0J1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNvY2tldC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBzb2NrZXQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJlamVjdChcIkFuIGVycm9yIGhhcyBvY2N1cmVkXCIpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwibWVzc2FnZVwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gSlNPTi5wYXJzZShldmVudC5kYXRhKTtcblxuICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLnR5cGUgPT09IFwibWVzc2FnZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChtZXNzYWdlLmNoYW5uZWwgPT09IGNvbmZpZy5jaGFubmVsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcmludE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJub3RpZmljYXRpb25cIikge1xuICAgICAgICAgICAgICAgICAgICBwcmludE5vdGlmaWNhdGlvbihtZXNzYWdlLmRhdGEgKyBcIiBXZWxjb21lIFwiICsgc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcInVzZXJuYW1lXCIpLCB0cnVlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBjb250YWluZXIuc2Nyb2xsVG8oMCwgMTAwKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBzZW5kKHRleHQpIHtcbiAgICAgICAgdmFyIGRhdGEgPSB7XG4gICAgICAgICAgICB0eXBlOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgICAgIGRhdGE6IHRleHQsXG4gICAgICAgICAgICB1c2VybmFtZTogc2Vzc2lvblN0b3JhZ2UudXNlcm5hbWUsXG4gICAgICAgICAgICBjaGFubmVsOiBjb25maWcuY2hhbm5lbCxcbiAgICAgICAgICAgIGtleTogY29uZmlnLmtleVxuICAgICAgICB9O1xuICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBpbnN0YUNoYXQ7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gbWVtb3J5R2FtZShjb250YWluZXIpIHtcbiAgICB2YXIgZ2FtZUJvYXJkO1xuICAgIHZhciByb3dzO1xuICAgIHZhciBjb2xzO1xuICAgIHZhciB0dXJuMTtcbiAgICB2YXIgdHVybjI7XG4gICAgdmFyIGxhc3RUaWxlO1xuICAgIHZhciBwYWlycyA9IDA7XG4gICAgdmFyIHRyaWVzID0gMDtcblxuICAgIHByaW50U3RhcnRTY3JlZW4oKS50aGVuKGZ1bmN0aW9uKGJvYXJkU2l6ZSkge1xuICAgICAgICB2YXIgc2l6ZTtcbiAgICAgICAgc2l6ZSA9IGJvYXJkU2l6ZS5zcGxpdChcInhcIik7XG4gICAgICAgIHJvd3MgPSBwYXJzZUludChzaXplWzBdKTtcbiAgICAgICAgY29scyA9IHBhcnNlSW50KHNpemVbMV0pO1xuICAgICAgICBwbGF5R2FtZSgpO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gcGxheUdhbWUoKSB7XG4gICAgICAgIHZhciB0aWxlcyA9IGdldEJyaWNrc0FycmF5KCk7XG4gICAgICAgIGdhbWVCb2FyZCA9IHByaW50R2FtZVNjcmVlbih0aWxlcyk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChnYW1lQm9hcmQpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50U3RhcnRTY3JlZW4oKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIGRpdjtcbiAgICAgICAgdmFyIGNyZWRpdHM7XG4gICAgICAgIHZhciBpO1xuICAgICAgICB2YXIgYm9hcmRTaXplO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlHYW1lU3RhcnRUZW1wbGF0ZVwiKTtcbiAgICAgICAgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRpdi5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUNyZWRpdHNUZW1wbGF0ZVwiKTtcbiAgICAgICAgY3JlZGl0cyA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgIGRpdi5hcHBlbmRDaGlsZChjcmVkaXRzKTtcblxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZGl2KTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UgKGZ1bmN0aW9uKHJlc29sdmUpIHtcbiAgICAgICAgICAgIGZvciAoaSA9IDE7IGkgPCA0OyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBkaXYuY2hpbGRyZW5baV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIGJvYXJkU2l6ZSA9IHRoaXMuZmlyc3RDaGlsZC5sYXN0Q2hpbGQubm9kZVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBkaXYucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoYm9hcmRTaXplKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcHJpbnRHYW1lU2NyZWVuKHRpbGVzKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIHRlbXBsYXRlQ29udGVudDtcbiAgICAgICAgdmFyIGRpdjtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5QnJpY2tUZW1wbGF0ZVwiKTtcbiAgICAgICAgdGVtcGxhdGVDb250ZW50ID0gdGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5R2FtZVRlbXBsYXRlXCIpO1xuICAgICAgICBkaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgIHRpbGVzLmZvckVhY2goZnVuY3Rpb24odGlsZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciBhO1xuXG4gICAgICAgICAgICBhID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZUNvbnRlbnQsIHRydWUpO1xuICAgICAgICAgICAgYWRkR2FtZU1lY2hhbmljcyhhLCB0aWxlLCBpbmRleCk7XG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYSk7XG5cbiAgICAgICAgICAgIGlmIChjb2xzID09PSAyKSB7XG4gICAgICAgICAgICAgICAgYS5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc05hbWUgPSBcImJyaWNrV2lkdGgyXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNvbHMgPT09IDQpIHtcbiAgICAgICAgICAgICAgICBhLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTmFtZSA9IFwiYnJpY2tXaWR0aDRcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKChpbmRleCArIDEpICUgY29scyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGl2O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFkZEdhbWVNZWNoYW5pY3MoYSwgdGlsZSwgaW5kZXgpIHtcbiAgICAgICAgYS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIHZhciBpbWc7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpbWcgPSBldmVudC50YXJnZXQubm9kZU5hbWUgPT09IFwiSU1HXCIgPyBldmVudC50YXJnZXQgOiBldmVudC50YXJnZXQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICAgICAgICAgIGdhbWVMb2dpYyh0aWxlLCBpbmRleCwgaW1nKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0QnJpY2tzQXJyYXkoKSB7XG4gICAgICAgIHZhciBhcnIgPSBbXTtcbiAgICAgICAgdmFyIHRlbXA7XG4gICAgICAgIHZhciBpO1xuXG4gICAgICAgIGZvciAoaSA9IDE7IGkgPD0gKHJvd3MgKiBjb2xzKSAvIDI7IGkgKz0gMSkge1xuICAgICAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgICAgICAgICBhcnIucHVzaChpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoaSA9IGFyci5sZW5ndGggLSAxOyBpID4gMDsgaSAtPSAxKSB7XG4gICAgICAgICAgICB2YXIgcmFuZG9tTnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogaSk7XG4gICAgICAgICAgICB0ZW1wID0gYXJyW2ldO1xuICAgICAgICAgICAgYXJyW2ldID0gYXJyW3JhbmRvbU51bWJlcl07XG4gICAgICAgICAgICBhcnJbcmFuZG9tTnVtYmVyXSA9IHRlbXA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGdhbWVMb2dpYyh0aWxlLCBpbmRleCwgaW1nKSB7XG4gICAgICAgIGlmICh0dXJuMikge3JldHVybjt9XG5cbiAgICAgICAgaW1nLnNyYyA9IFwiaW1hZ2UvXCIgKyB0aWxlICsgXCIucG5nXCI7XG5cbiAgICAgICAgaWYgKCF0dXJuMSkge1xuICAgICAgICAgICAgdHVybjEgPSBpbWc7XG4gICAgICAgICAgICBsYXN0VGlsZSA9IHRpbGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoaW1nID09PSB0dXJuMSkge3JldHVybjt9XG5cbiAgICAgICAgICAgIHRyaWVzICs9IDE7XG5cbiAgICAgICAgICAgIHR1cm4yID0gaW1nO1xuICAgICAgICAgICAgaWYgKHRpbGUgPT09IGxhc3RUaWxlKSB7XG4gICAgICAgICAgICAgICAgcGFpcnMgKz0gMTtcblxuICAgICAgICAgICAgICAgIGlmIChwYWlycyA9PT0gKGNvbHMgKiByb3dzKSAvIDIpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2FtZUJvYXJkLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICBwcmludEhpZ2hTY29yZVNjcmVlbigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEucGFyZW50Tm9kZS5jbGFzc0xpc3QuYWRkKFwicmVtb3ZlXCIpO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMi5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJyZW1vdmVcIik7XG5cbiAgICAgICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5zcmMgPSBcImltYWdlLzAucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnNyYyA9IFwiaW1hZ2UvMC5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIHByaW50SGlnaFNjb3JlU2NyZWVuKCkge1xuICAgICAgICB2YXIgc3RvcmFnZU5hbWUgPSBcIm1lbW9yeVwiICsgcm93cyArIFwieFwiICsgY29scztcbiAgICAgICAgdmFyIHRlbXBsYXRlO1xuICAgICAgICB2YXIgZ2FtZUVuZERpdjtcbiAgICAgICAgdmFyIGhpZ2hTY29yZTtcbiAgICAgICAgdmFyIGNyZWRpdHM7XG5cbiAgICAgICAgaGlnaFNjb3JlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShzdG9yYWdlTmFtZSkpO1xuXG4gICAgICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlHYW1lRW5kVGVtcGxhdGVcIik7XG4gICAgICAgIGdhbWVFbmREaXYgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgIGdhbWVFbmREaXYucXVlcnlTZWxlY3RvcihcIi5zYXZlSGlnaHNjb3JlRm9ybVwiKS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgc2F2ZUhpZ2hTY29yZShnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKVswXS52YWx1ZSk7XG4gICAgICAgICAgICBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuc2F2ZUhpZ2hzY29yZUZvcm1cIikucmVtb3ZlKCk7XG4gICAgICAgICAgICBwcmludEhpZ2hTY29yZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBwcmludEhpZ2hTY29yZSgpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ2FtZUVuZERpdik7XG5cbiAgICAgICAgZnVuY3Rpb24gcHJpbnRIaWdoU2NvcmUoKSB7XG4gICAgICAgICAgICBoaWdoU2NvcmUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKHN0b3JhZ2VOYW1lKSk7XG4gICAgICAgICAgICB2YXIgb2xkU2NvcmUgPSBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5oaWdoU2NvcmVcIik7XG4gICAgICAgICAgICBpZiAob2xkU2NvcmUpIHtcbiAgICAgICAgICAgICAgICBvbGRTY29yZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGhpZ2hTY29yZSkge1xuICAgICAgICAgICAgICAgIHZhciBpO1xuICAgICAgICAgICAgICAgIHZhciBzY29yZTtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IGdhbWVFbmREaXYucXVlcnlTZWxlY3RvcihcIiNoaWdoU2NvcmVUZW1wYXRlXCIpO1xuICAgICAgICAgICAgICAgIHZhciBzY29yZUJvYXJkID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBoaWdoU2NvcmUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcmUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIk5pY2tuYW1lOiBcIiArIGhpZ2hTY29yZVtpXS5uaWNrbmFtZSArIFwiIHwgVHJpZXM6IFwiICsgaGlnaFNjb3JlW2ldLnRyaWVzKTtcbiAgICAgICAgICAgICAgICAgICAgc2NvcmVCb2FyZC5jaGlsZHJlbltpXS5hcHBlbmRDaGlsZChzY29yZSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZ2FtZUVuZERpdi5hcHBlbmRDaGlsZChzY29yZUJvYXJkKTtcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZSA9IGdhbWVFbmREaXYucXVlcnlTZWxlY3RvcihcIiNub0hpZ2hTY29yZVRlbXBhdGVcIik7XG4gICAgICAgICAgICAgICAgZ2FtZUVuZERpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNhdmVIaWdoU2NvcmUobmlja25hbWUpIHtcbiAgICAgICAgICAgIGlmIChoaWdoU2NvcmUpIHtcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmUucHVzaCh7bmlja25hbWU6IG5pY2tuYW1lLCB0cmllczogdHJpZXN9KTtcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmUuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIoYS50cmllcykgLSBOdW1iZXIoYi50cmllcyk7XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBoaWdoU2NvcmUuc3BsaWNlKDUsIDEpO1xuXG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZU5hbWUsIEpTT04uc3RyaW5naWZ5KGhpZ2hTY29yZSkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmUgPSBbXG4gICAgICAgICAgICAgICAgICAgIHtuaWNrbmFtZTogbmlja25hbWUsIHRyaWVzOiB0cmllc31cbiAgICAgICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oc3RvcmFnZU5hbWUsIEpTT04uc3RyaW5naWZ5KGhpZ2hTY29yZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBtZW1vcnlHYW1lO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgbWFpbiBzZXR0aW5ncyBmdW5jdGlvbi4gVGhpcyBjcmVhdGVzIGEgdGhlIHNldHRpbmdzIGFwcGxpY2F0aW9uIGluc2lkZSB0aGUgY29udGFpbmVyLlxuICogQHBhcmFtIGNvbnRhaW5lciBUaGUgSFRNTCBlbGVtZW50IHRoZSBhcHBsaWNhdGlvbiBpcyBjcmVhdGVkIGluLlxuICovXG5mdW5jdGlvbiBzZXR0aW5ncyhjb250YWluZXIpIHtcbiAgICB2YXIgZm9ybTtcbiAgICB2YXIgaW5wdXRzO1xuICAgIHZhciB0ZW1wbGF0ZTtcblxuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzZXR0aW5nc1RlbXBsYXRlXCIpO1xuICAgIGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuICAgIGlucHV0cyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpO1xuXG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xuXG4gICAgZmlsbEZvcm1XaXRoRGF0YSgpO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGFwcGx5KCk7XG4gICAgfSk7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlucHV0c1s1XS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICBpbnB1dHNbNl0uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIGlucHV0c1s1XS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFwcGx5KCk7XG4gICAgfSk7XG4gICAgaW5wdXRzWzZdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZmlsbEZvcm1XaXRoRGF0YSgpO1xuICAgIH0pO1xuICAgIGlucHV0c1s3XS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHJlc2V0VG9EZWZhdWx0KCk7XG4gICAgfSk7XG5cbiAgICAvKipcbiAgICAgKiBUYWtlcyB0aGUgc2V0dGluZ3Mgc2F2ZWQgaW4gdGhlIGxvY2FsIHN0b3JhZ2UgYW5kIGZpbGxzIHRoZSBmb3JtIHdpdGggdGhhdCBpbmZvcm1hdGlvbi4gSXMgdXNlZCB3aGVuIHRoZVxuICAgICAqIGFwcGxpY2F0aW9uIGlzIGxhdW5jaGVkIGFuZCB3aGVuIHdlIHdhbnQgdG8gcmVzZXQgc2V0dGluZ3MgaW5zdGVhZCBvZiBhcHBseWluZy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBmaWxsRm9ybVdpdGhEYXRhKCkge1xuICAgICAgICB2YXIgc2V0dGluZ3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpO1xuXG4gICAgICAgIGlucHV0c1swXS52YWx1ZSA9IHNldHRpbmdzLndhbGxwYXBlcjtcblxuICAgICAgICBpZiAoc2V0dGluZ3MuaGlkZURvY2sgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgICAgICBpbnB1dHNbMV0uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dHNbMl0uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc2V0dGluZ3MuZG9ja1Bvc2l0aW9uID09PSBcInRvcFwiKSB7XG4gICAgICAgICAgICBpbnB1dHNbM10uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnB1dHNbNF0uY2hlY2tlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpbnB1dHNbNV0uZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICBpbnB1dHNbNl0uZGlzYWJsZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgY3JlYXRlcyBhbiBvYmplY3QgYW5kIGZpbGxzIGl0IHdpdGggdGhlIGRhdGEgZnJvbSB0aGUgZm9ybSBhbmQgcHV0cyBpdCBpbiB0aGUgbG9jYWwgc3RvcmFnZS4gdXNlU2V0dGluZ3NcbiAgICAgKiBpcyB0aGVuIGNhbGxlZCB0byBwdXQgdGhlIHNldHRpbmdzIHRvIHVzZS5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBhcHBseSgpe1xuICAgICAgICB2YXIgbmV3U2V0dGluZyA9IHtcbiAgICAgICAgICAgIHdhbGxwYXBlcjogaW5wdXRzWzBdLnZhbHVlLFxuICAgICAgICAgICAgaGlkZURvY2s6IGlucHV0c1sxXS5jaGVja2VkID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIsXG4gICAgICAgICAgICBkb2NrUG9zaXRpb246IGlucHV0c1szXS5jaGVja2VkID8gXCJ0b3BcIiA6IFwiYm90dG9tXCJcbiAgICAgICAgfTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJQV0RTZXR0aW5nc1wiLCBKU09OLnN0cmluZ2lmeShuZXdTZXR0aW5nKSk7XG4gICAgICAgIHVzZVNldHRpbmdzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSXMgdXNlZCB3aGVuIHdlIHdhbnQgdG8gcmV0dXJuIHRvIG91ciBkZWZhdWx0IHNldHRpbmdzLiBJdCBsb2FkcyBzZXR0aW5ncyBmcm9tIGRlZmF1bHRTZXR0aW5ncy5qc29uIGFuZCBwdXRzIGl0XG4gICAgICogaW4gdGhlIGxvY2FsIHN0b3JhZ2UuIGZpbGxGb3JtV2l0aERhdGEgaXMgdGhlbiB1c2VkIHRvIGZpbGwgdGhlIGZvcm0sIGFuZCB1c2VTZXR0aW5ncyB0byB1c2Ugb3VyIG5ldyBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXNldFRvRGVmYXVsdCgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJQV0RTZXR0aW5nc1wiLCBKU09OLnN0cmluZ2lmeShyZXF1aXJlKFwiLi4vLi4vZGVmYXVsdFNldHRpbmdzLmpzb25cIikpKTtcbiAgICAgICAgZmlsbEZvcm1XaXRoRGF0YSgpO1xuICAgICAgICB1c2VTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHVzZVNldHRpbmdzIGlzIHdoZW4gd2Ugd2FudCBvdXIgc2V0dGluZ3MgdG8gYmUgY2hhbmdlZCB2aXN1YWxseSBpbiB0aGUgYXBwbGljYXRpb24uIEl0IHRha2VzIHRoZSBzZXR0aW5ncyBvdXQgb2ZcbiAgICAgKiBsb2NhbCBzdG9yYWdlIGFuZCB0aGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVzIG9mIHRoZSBvYmplY3RzIG1lbWJlcnMgZGlmZmVyZW50IHNldHRpbmdzIGlzIHNldC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1c2VTZXR0aW5ncygpIHtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSk7XG4gICAgICAgIHZhciBidXR0b25zO1xuXG4gICAgICAgIC8vU2V0IHdhbGxwYXBlclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIHNldHRpbmdzLndhbGxwYXBlciArIFwiKVwiO1xuXG4gICAgICAgIC8vSGlkZS9TaG93IERvY2tcbiAgICAgICAgaWYgKHNldHRpbmdzLmhpZGVEb2NrID09PSBcImZhbHNlXCIpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5zdHlsZS5oZWlnaHQgPSBcIjYwcHhcIjtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuY2hpbGRyZW47XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5zdHlsZS5oZWlnaHQgPSBcIjBweFwiO1xuICAgICAgICAgICAgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jaGlsZHJlbjtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBidXR0b25zW2ldLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL0RvY2sgUG9zaXRpb25cbiAgICAgICAgaWYgKHNldHRpbmdzLmRvY2tQb3NpdGlvbiA9PT0gXCJ0b3BcIikge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNsYXNzTmFtZSA9IFwiZG9ja1RvcFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNsYXNzTmFtZSA9IFwiZG9ja0JvdHRvbVwiO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBzZXR0aW5ncztcbiIsIm1vZHVsZS5leHBvcnRzPVtcbiAgICB7XCJpZFwiOiBcImluc3RhQ2hhdFwiLCBcImltZ1wiOiBcIi4uL2ltYWdlL2luc3RhQ2hhdC5wbmdcIiwgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCJ5ZWxsb3dncmVlblwifSxcbiAgICB7XCJpZFwiOiBcIm1lbW9yeUdhbWVcIiwgXCJpbWdcIjogXCIuLi9pbWFnZS90ZXN0QXBwLnBuZ1wiLCBcImJhY2tncm91bmRDb2xvclwiOiBcIkdvbGRcIn0sXG4gICAge1wiaWRcIjogXCJzZXR0aW5nc1wiLCBcImltZ1wiOiBcIi4uL2ltYWdlL3NldHRpbmdzLnBuZ1wiLCBcImJhY2tncm91bmRDb2xvclwiOiBcImNvcm5mbG93ZXJCbHVlXCJ9XG5dXG5cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcIndhbGxwYXBlclwiOiBcIi4uL2ltYWdlL3dhbGxwYXBlci5qcGdcIixcbiAgICBcImhpZGVEb2NrXCI6IFwiZmFsc2VcIixcbiAgICBcImRvY2tQb3NpdGlvblwiOiBcImJvdHRvbVwiXG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHB3ZFdpbmRvdyA9IHJlcXVpcmUoXCIuL3dpbmRvd1wiKTtcblxuLyoqXG4gKiBBIGNvbnN0cmljdG9yIGZ1bmN0aW9uIGNyZWF0aW5nIGFuIG9iamVjdCBjb250YWluaW5nIG1ldGhvZHMuIFRoZXNlIG1ldGhvZHMgYXJlIGNhbGxlZCB3aGVuIGxhdW5jaGluZyBhbiBhcHBsaWNhdGlvbi5cbiAqIFRoZSBtYXRob2Qgb2YgdGhlIGFwcGxpY2F0aW9uIGhhcyB0byBoYXZlIHRoZSBzYW1lIG5hbWUgYXMgaW4gdGhlIGFwcGxpY2F0aW9uc0xpc3QuanNvbi4gSW5zaWRlIG9uZSBvZiB0aGVzZSBtZXRob2RzXG4gKiB5b3UgY2FuIGVpdGhlciBjcmVhdGUgYW5kIGFwcGxpY2F0aW9uIG9yIGNhbGwgYSBmdW5jdGlvbiB0byBjcmVhdGUgYW4gYXBwbGljYXRpb24uXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gQXBwbGljYXRpb25zKCkge1xuXG4gICAgLyoqXG4gICAgICogSXMgY2FsbGVkIHdoZW4gd2Ugd2FudCB0byBsYXVuY2ggYW4gaW5zdGFuY2Ugb2YgdGhlIGluc3RhQ2hhdCBhcHBsaWNhdGlvbi5cbiAgICAgKiBAcGFyYW0gY29udGFpbmVyIEFuIEhUTUwgZWxlbWVudCB3aGVyZSB0aGUgYXBwbGljYXRpb24gd2lsbCBiZSBjcmVhdGVkLlxuICAgICAqL1xuICAgIHRoaXMuaW5zdGFDaGF0ID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcFwiKTtcbiAgICAgICAgYXBwLmxhdW5jaChjb250YWluZXIpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBJcyBjYWxsZWQgd2hlbiB3ZSB3YW50IHRvIGxhdW5jaCBhbiBpbnN0YW5jZSBvZiB0aGUgaW5zdGFDaGF0IGFwcGxpY2F0aW9uLlxuICAgICAqIEBwYXJhbSBjb250YWluZXIgQW4gSFRNTCBlbGVtZW50IHdoZXJlIHRoZSBhcHBsaWNhdGlvbiB3aWxsIGJlIGNyZWF0ZWQuXG4gICAgICovXG4gICAgdGhpcy5tZW1vcnlHYW1lID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvbWVtb3J5R2FtZS9hcHBcIik7XG4gICAgICAgIGFwcC5sYXVuY2goY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSXMgY2FsbGVkIHdoZW4gd2Ugd2FudCB0byBsYXVuY2ggYW4gaW5zdGFuY2Ugb2YgdGhlIGluc3RhQ2hhdCBhcHBsaWNhdGlvbi5cbiAgICAgKiBAcGFyYW0gY29udGFpbmVyIEFuIEhUTUwgZWxlbWVudCB3aGVyZSB0aGUgYXBwbGljYXRpb24gd2lsbCBiZSBjcmVhdGVkLlxuICAgICAqL1xuICAgIHRoaXMuc2V0dGluZ3MgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9zZXR0aW5ncy9hcHBcIik7XG4gICAgICAgIGFwcC5sYXVuY2goY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSXMgY2FsbGVkIHdoZW4gd2Ugd2FudCB0byBsYXVuY2ggYW4gaW5zdGFuY2Ugb2YgdGhlIGluc3RhQ2hhdCBhcHBsaWNhdGlvbi5cbiAgICAgKiBAcGFyYW0gY29udGFpbmVyIEFuIEhUTUwgZWxlbWVudCB3aGVyZSB0aGUgYXBwbGljYXRpb24gd2lsbCBiZSBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSBlcnIgICAgICAgQW4gZXJyb3IgbWVzc2FnZS5cbiAgICAgKi9cbiAgICB0aGlzLmVycm9yID0gZnVuY3Rpb24oY29udGFpbmVyLCBlcnIpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gY29udGFpbmVyLmNoaWxkcmVuO1xuICAgICAgICB2YXIgdGV4dDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBlbGVtZW50c1tpXS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShlcnIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBTdGFydHMgYnkgY3JlYXRpbmcgYSBuZXcgd2luZG93LiBUaGVuIGFuIG9iamVjdCBvZiBBcHBsaWNhdGlvbnMgd2l0aCBhbGwgdGhlIGZ1bmN0aW9ucyB0byBsYXVuY2ggdGhlIGFwcGxpY2F0aW9ucy5cbiAqIFRoZSBpZCBtZW1iZXIgaW4gYXBwIGhhcyB0aGUgbmFtZSBvZiB0aGUgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCBpbiB0aGUgQXBwbGljYXRpb25zIG9iamVjdC4gV2UgdHJ5IGNhbGxpbmcgdGhhdCBhbmRcbiAqIGlmIHdlIHN1Y2NlZWQgd2Ugd2lsbCBoYXZlIGFuIGFwcGxpY2F0aW9uLiBJZiBzb21ldGhpbmcgZmFpbHMgZHVyaW5nIHRoZSBsYXVuY2ggb2YgdGhlIGFwcGxpY2F0aW9uIHRoZSBlcnJvclxuICogYXBwbGljYXRpb24gaXMgY2FsbGVkIGluc3RlYWQuXG4gKiBAcGFyYW0gYXBwIEFuIG9iamVjdCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoZSBhcHBsaWNhdGlvbiB0byBiZSBsYXVuY2hlZC5cbiAqL1xuZnVuY3Rpb24gbGF1bmNoZXIoYXBwKSB7XG4gICAgdmFyIGNvbnRhaW5lcjtcbiAgICB2YXIgYXBwbGljYXRpb25zO1xuXG4gICAgY29udGFpbmVyID0gcHdkV2luZG93LmNyZWF0ZVdpbmRvdyhhcHApO1xuICAgIGFwcGxpY2F0aW9ucyA9IG5ldyBBcHBsaWNhdGlvbnMoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGFwcGxpY2F0aW9uc1thcHAuaWRdKGNvbnRhaW5lcik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGFwcGxpY2F0aW9ucy5lcnJvcihjb250YWluZXIsIGVycik7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2hlciA9IGxhdW5jaGVyO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy9UT0RPIEbDtnJzw7ZrIHJlbnNhIHVwcCBzw6UgbWt0IGh0bWwgb2NoIGNzcyBmcsOlbiBqYXZhc2NyaXB0a29kZW4uXG5cbnZhciBkb2NrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpO1xudmFyIGJ1dHRvbnMgPSBbXTtcbnZhciBsYXVuY2hlciA9IHJlcXVpcmUoXCIuL2xhdW5jaGVyXCIpO1xudmFyIGFwcGxpY2F0aW9ucyA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9uc0xpc3RcIik7XG5cbi8qKlxuICogVGFrZXMgdGhlIGRvY2sgYW5kIHBsYWNlcyBpdCBpbiB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW4uXG4gKi9cbmZ1bmN0aW9uIGNlbnRyYWxpemUoKSB7XG4gICAgdmFyIHdpZHRoID0gZG9jay5vZmZzZXRXaWR0aDtcbiAgICBkb2NrLnN0eWxlLm1hcmdpbkxlZnQgPSAod2lkdGggLyAyKSAqIC0xO1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIGV2ZW50IGxpc3RlbmVycyBvbiB0aGUgZG9jay4gSWYgdGhlIG1vdXNlIGlzIG92ZXIgdGhlIGRvY2sgYW4gZXZlbnQgaXMgdHJpZ2dlcmVkIHNvIHRoZSBkb2NrIGlzIHZpc2libGUuIElmXG4gKiB0aGUgbW91c2UgbW92ZXMgb3V0IG9mIHRoZSBkb2NrIGFuZCBoaWRlRG9jayBpcyBzZXQgdG8gdHJ1ZSwgdGhlIGRvY2sgd2lsbCBoaWRlLlxuICovXG5mdW5jdGlvbiBkb2NrSGlkZVNob3coKSB7XG4gICAgdmFyIGk7XG5cbiAgICBkb2NrLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCI2MHB4XCI7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRvY2suYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGlkZURvY2sgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpLmhpZGVEb2NrO1xuXG4gICAgICAgIGlmIChoaWRlRG9jayA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBidXR0b25zW2ldLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBBZGRzIGEgYnV0dG9uIHRvIHRoZSBkb2NrLiBMb2FkcyB0aGUgdGVtcGxhdGUsIGFkZHMgc3R5bGUgdG8gaXQgYW5kIGFuIGV2ZW50IGxpc3RlbmVyIHRvIGxhdW5jaCB0aGUgYXBwLlxuICogQHBhcmFtIGFwcCBBbiBvYmplY3QgY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCBhbiBhcHBsaWNhdGlvbi5cbiAqL1xuZnVuY3Rpb24gYWRkQnV0dG9uKGFwcCkge1xuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB2YXIgYnV0dG9uO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FwcEJ1dHRvblRlbXBsYXRlXCIpO1xuICAgIGJ1dHRvbiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgZmFsc2UpO1xuXG4gICAgYnV0dG9uLmNsYXNzTmFtZSA9IFwiYXBwQnV0dG9uXCI7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFwcC5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgYXBwLmltZyArIFwiKVwiO1xuICAgIGRvY2suYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICBkb2NrLnN0eWxlLndpZHRoID0gZG9jay5vZmZzZXRXaWR0aCArIDQ1O1xuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsYXVuY2hlci5sYXVuY2hlcihhcHApO1xuICAgIH0pO1xuXG4gICAgYnV0dG9ucy5wdXNoKGJ1dHRvbik7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZXJlIGFyZSBzZXR0aW5ncyBpbiB0aGUgbG9jYWxzdG9yYWdlLCBpZiBub3QgZGF0YSBpcyBsb2FkZWQgZnJvbSBkZWZhdWx0U2V0dGluZ3MuanNvbiBhbmQgdXBsb2FkZWQgdG9cbiAqIGxvY2Fsc3RvcmFnZS4gU2V0dGluZ3MgYXJlIHRoZW4gYXBwbGllZCB0byB0aGUgd2ViIGFwcGxpY2F0aW9uLlxuICovXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3MoKSB7XG4gICAgdmFyIHNldHRpbmdzO1xuICAgIGlmICghbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIlBXRFNldHRpbmdzXCIsIEpTT04uc3RyaW5naWZ5KHJlcXVpcmUoXCIuL2RlZmF1bHRTZXR0aW5ncy5qc29uXCIpKSk7XG4gICAgfVxuXG4gICAgc2V0dGluZ3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgc2V0dGluZ3Mud2FsbHBhcGVyICsgXCIpXCI7XG5cbiAgICBpZiAoc2V0dGluZ3MuZG9ja1Bvc2l0aW9uID09PSBcInRvcFwiKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jbGFzc0xpc3QuYWRkKFwiZG9ja1RvcFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuY2xhc3NMaXN0LmFkZChcImRvY2tCb3R0b21cIik7XG4gICAgfVxufVxuXG4vKipcbiAqIFByZXBhcmVzIGFuZCBzdGFydHMgdGhlIGZ1bmRhbWVudGFsIGZ1bmN0aW9uYWxpdGllcyBvZiB0aGUgUFdELiBDcmVhdGVzIHRoZSBkb2NrIGFuZCB0aGUgYnV0dG9ucyBhbmQgbGlua3MgdGhlbSB0b1xuICogYW4gYXBwbGljYXRpb24sIGxvYWRzIHNldHRpbmdzIGFuZCBhcHBsaWVzIHRoZW0uXG4gKi9cbmZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgdmFyIGk7XG5cbiAgICBsb2FkU2V0dGluZ3MoKTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBhcHBsaWNhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYWRkQnV0dG9uKGFwcGxpY2F0aW9uc1tpXSk7XG4gICAgfVxuXG4gICAgY2VudHJhbGl6ZSgpO1xuICAgIGRvY2tIaWRlU2hvdygpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0aWFsaXplID0gaW5pdGlhbGl6ZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbGFzdEluZGV4ID0gMDtcbnZhciBvZmZzZXRYID0gMDtcbnZhciBvZmZzZXRZID0gMDtcbnZhciBwb3NpdGlvblggPSAwO1xudmFyIHBvc2l0aW9uWSA9IDA7XG52YXIgZWxlbWVudDtcblxuLyoqXG4gKiBJcyBjYWxsZWQgd2hlbiBhIG1vdXNlIGJ1dHRvbiB3YXMgcHJlc3NlZCBkb3duIGluIHRoZSB0b3AgYmFyIG9mIGEgd2luZG93LiBJdCBnaXZlcyBlbGVtZW50IGFuIHJlZmVyZW5jZSB0byB0YXJnZXRcbiAqICh0aGUgZWxlbWVudCBwcmVzc2VkKS4gSXQgYWxzbyBzZXQncyB0aGUgb2Zmc2V0IG9mIHRoZSBtb3VzZSBpbiB0aGUgd2luZG93LiBBbmQgYWRkcyAxIHRvIHRoZSBsYXN0SW5kZXggYW5kIHNldCdzXG4gKiB0aGUgd2luZG93cyB6SW5kZXggdG8gbGFzdEluZGV4LCB0aGlzIGlzIHNvIHRoZSBsYXN0IHdpbmRvdyBwcmVzc2VkIGhhcyB0aGUgaGlnaGVzdCB6SW5kZXguXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgd2luZG93IHByZXNzZWQuXG4gKi9cbmZ1bmN0aW9uIGdyYWJFbGVtZW50KHRhcmdldCkge1xuICAgIGVsZW1lbnQgPSB0YXJnZXQ7XG4gICAgb2Zmc2V0WCA9IHBvc2l0aW9uWCAtIGVsZW1lbnQub2Zmc2V0TGVmdDtcbiAgICBvZmZzZXRZID0gcG9zaXRpb25ZIC0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgbGFzdEluZGV4ICs9IDE7XG4gICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG59XG5cbi8qKlxuICogSXMgY2FsbGVkIHdoZW4gdGhlIG1vdXNlIG1vdmVzLiBDaGVja3MgaWYgZWxlbWVudCBoYXMgYSB2YWx1ZS4gSWYgc28gYSB3aW5kb3cgaGFzIGJlZW4gcHJlc3NlZCBhbmQgd2Uga25vdyB3aGF0XG4gKiB3aW5kb3cgdG8gbW92ZS4gSWYgbm90IG5vdGhpbmcgd2lsbCBoYXBwZW4uXG4gKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZ290IHRyaWdnZXJlZCBhbmQgY2FsbGVkIHRoZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gbW92ZUVsZW1lbnQoZXZlbnQpIHtcbiAgICBwb3NpdGlvblggPSBldmVudC5jbGllbnRYO1xuICAgIHBvc2l0aW9uWSA9IGV2ZW50LmNsaWVudFk7XG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIG5ld0xlZnQgPSBwb3NpdGlvblggLSAob2Zmc2V0WCArIDIpO1xuICAgICAgICB2YXIgbmV3VG9wID0gcG9zaXRpb25ZIC0gKG9mZnNldFkgKyAyKTtcblxuICAgICAgICBuZXdMZWZ0ID0gbmV3TGVmdCA8IDAgPyAwIDogbmV3TGVmdDtcbiAgICAgICAgbmV3VG9wID0gbmV3VG9wIDwgMCA/IDAgOiBuZXdUb3A7XG5cbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gbmV3TGVmdCArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSBuZXdUb3AgKyBcInB4XCI7XG4gICAgfVxufVxuXG4vKipcbiAqIElzIGNhbGxlZCBpZiB0aGUgbW91c2UgYnV0dG9uIGlzIHJlbGVhc2VkLiBTZXQncyBlbGVtZW50IHRvIHVuZGVmaW5lZCBzbyBhIHdpbmRvdyB3b24ndCBiZSBtb3ZlZCBhcm91bmQuXG4gKi9cbmZ1bmN0aW9uIHJlbGVhc2VFbGVtZW50KCkge1xuICAgIGVsZW1lbnQgPSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogVGFrZXMgdGhlIG5hbWUgb2YgdGhlIHRlbXBsYXRlIGFuZCB0aGUgbmFtZSBvZiB0aGUgY29udGFpbmVyIGFuZCBsb2FkcyB0aGUgY29udGVudCBvZiB0aGUgdGVtcGxhdGUgaW50byB0aGVcbiAqIGNvbnRhaW5lci5cbiAqIEBwYXJhbSB0ZW1wbGF0ZU5hbWVcbiAqIEBwYXJhbSBjb250YWluZXJOYW1lXG4gKi9cbmZ1bmN0aW9uIGFkZFRlbXBsYXRlKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgIHZhciBjb250YWluZXI7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJOYW1lKTtcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGVtcGxhdGVOYW1lKTtcbiAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG5cbi8qKlxuICogQSB3aW5kb3cgaXMgY3JlYXRlZC4gVW5pdmVyc2FsIGNvbnRlbnQgbGlrZSB0b3AgYmFyIGlzIGFkZGVkIGFuZCBzb21lIHBpZWNlcyBvZiBzdHlsZSBpcyBhZGRlZCBsaWtlIGljb25zIGFuZFxuICogYmFja2dyb3VuZCBjb2xvci4gRXZlbnRsaXN0ZW5lcnMgZm9yIG1vdmluZyB0aGUgd2luZG93IGFuZCBjbG9zaW5nIGl0IGlzIGFsc28gYWRkZWQuXG4gKiBAcGFyYW0gYXBwIEFuIG9iamVjdCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoZSBhcHBsaWNhdGlvbiBsb2FkZWQgaW50byB0aGUgd2luZG93LlxuICogQHJldHVybnMgSFRNTCBFbGVtZW50IFRoZSB3aW5kb3cgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlV2luZG93KGFwcCkge1xuICAgIHZhciB0b3BiYXI7XG4gICAgdmFyIGFwcFdpbmRvdztcblxuICAgIGFkZFRlbXBsYXRlKFwiI2FwcFdpbmRvd1RlbXBsYXRlXCIsIFwiYm9keVwiKTtcbiAgICBhcHBXaW5kb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKVtkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKS5sZW5ndGggLSAxXTtcbiAgICBhcHBXaW5kb3cuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYXBwLmJhY2tncm91bmRDb2xvcjtcbiAgICB0b3BiYXIgPSBhcHBXaW5kb3cucXVlcnlTZWxlY3RvcihcIi50b3BiYXJcIik7XG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuYXBwSWNvblwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgYXBwLmltZyk7XG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuYXBwVGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwLmlkKSk7XG5cbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBhcHBXaW5kb3cuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xuXG4gICAgLy8gR3JhYiB3aW5kb3dcbiAgICB0b3BiYXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZ3JhYkVsZW1lbnQoYXBwV2luZG93KTtcbiAgICB9KTtcblxuICAgIC8vIE1vdmUgd2luZG93XG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZUVsZW1lbnQpO1xuXG4gICAgLy8gUmVsZWFzZSB3aW5kb3dcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCByZWxlYXNlRWxlbWVudCk7XG5cbiAgICAvLyBGb2N1cyBvbiB3aW5kb3cgYW5kIG1vdmUgdG8gdG9wXG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgbGFzdEluZGV4ICs9IDE7XG4gICAgICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgfSk7XG5cbiAgICAvLyBDbG9zZSB3aW5kb3dcbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5jbG9zZVdpbmRvd0J1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYXBwV2luZG93LnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGFwcFdpbmRvdztcbn1cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlV2luZG93ID0gY3JlYXRlV2luZG93O1xuIl19
