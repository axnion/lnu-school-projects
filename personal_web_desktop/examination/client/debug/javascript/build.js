(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var dock = require("./pwd");
dock.initialize();

},{"./pwd":8}],2:[function(require,module,exports){
"use strict";

/**
 * This is the main instaChat function. This creates the application and displays it in the container.
 * @param container The HTML element the application is created in.
 */
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

    /**
     * Loads the template and prints the login screen in the container.
     */
    function printLoginScreen() {
        var template;
        var node;

        template = document.querySelector("#instaChatLoginTemplate");
        node = document.importNode(template.content, true);
        container.appendChild(node);
    }

    /**
     * Loads the template for operations. So the charBox and textarea is created. The select element with the channel
     * options is also added together with an event listener listening for change in the select. When there is a change
     * the new channel is used to both listen on and write to. A notification is also printed.
     */
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

    /**
     * Prints a message to the chat box. Also ads a timestamp to each message so we know when we got it. The username of
     * the person who sent it is also displayed. If the message was sent by this user then the message will have
     * a different class to look different and instead of the username it will say "you".
     * @param message An objects from the server containing a message and other information.
     */
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

    /**
     * Prints a notification in the chatBox. If temporary is true then the message will disapear after 5 seconds.
     * @param message A message we want in the notification.
     * @param temporary True if we want the message to disappear after 5 seconds. If not the false.
     */
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

    /**
     * Creates the login functionality. Returns a promise containing an if statement and an event listener. The if
     * statement checks if a username already exists in this session. If so we use that name and remove the loginDiv
     * and call resolve. The event listener is created if we can't find a username. It will listen to a press of the
     * enter key on the loginDiv. If there is nothing in the text input then a text is shows to the user. But if there
     * is a text then we save the name in session and move on.
     * @returns {Promise} A promise of a username.
     */
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

    /**
     * This functions is called to connect to the server. It returns a Promise. In this Promise we create a web socket
     * connection to the server. We then listen for the event open from the server. We also listen for an error so we
     * know if something when wrong. An event listener for messages is also added. The type of the message is checked
     * and depending on what type it is then it will be printed as a message, a notification or not printed at all.
     * @returns {Promise}
     */
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

    /**
     * This function is used to send messages to the server. We create an object and fill it with the information it
     * needs and then use send method.
     * @param text Text we want to send to the server and in turn the other users.
     */
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

/**
 * This is the main memoryGame function. It creates a new game of memory and display it in the container.
 * @param container The HTML element the application is created in.
 */
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

    /**
     * Starts the main game. Get's the randomized array of bricks, creates and prints the game to the container.
     */
    function playGame() {
        var tiles = getBricksArray();
        gameBoard = printGameScreen(tiles);
        container.appendChild(gameBoard);
    }

    /**
     * Prints the start screen for the memory game displaying the menu with the three chooses for board size. A promise
     * is returned with an event listener on each menu item. When one of the links is clicked an event is triggered and
     * the size of the board is set. The start screen is then removed and the resolve function is called with the board
     * size as an argument.
     * @returns Promise
     */
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

    /**
     * Prints the gameboard to the container. Loads templates for both game board and brick. Bricks are then loaded into
     * the game board and an event listener is added to every brick with addGameMechanics().
     * @param tiles An array of numbers representing bricks on the board.
     * @returns Node The element containing the gameboard.
     */
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
            addGameMechanics(a, tile);
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

    /**
     * Adds an event listener to look for clicks on the brick. When the event triggers it checks if the target is an
     * image or the link surrounding the image and corrects it to the image. gameLogic is then called with tile, index
     * and image as arguments.
     * @param element An element representing a brick on the board.
     * @param tile A number identifying the type of a brick.
     */
    function addGameMechanics(element, tile) {
        element.addEventListener("click", function(event) {
            var img;
            event.preventDefault();

            img = event.target.nodeName === "IMG" ? event.target : event.target.firstElementChild;

            gameLogic(tile, img);
        });
    }

    /**
     * Creates a shuffled array of number representing the bricks on the board. There is two of each number. It's
     * created, suffled and returned.
     * @returns {Array} Shuffled array of number representing the bricks in the game.
     */
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

    /**
     * Contains logic for the flow of the game. Keeps track of where in the game we are and what should happen in every
     * situation. Also keeps the user from breaking the game.
     * @param tile The number used to identify what brick we are dealing with.
     * @param img A reference to the brick on the board.
     */
    function gameLogic(tile, img) {
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

                setTimeout(function() {
                    turn1.parentNode.classList.add("remove");
                    turn2.parentNode.classList.add("remove");

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

    /**
     * Prints the scoreBoard for this board size and gives the user the option to save their score.
     */
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

        /**
         * Prints the score board. If one does not exists a different template is loaded telling the user that there is
         * no scores. If the user decides to save his/her score then one will be created and the correct scoreboard is
         * shown.
         */
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

        /**
         * Saves your nickname and amount of tries to local storage. If don't already have a stop for the score one will
         * be created. There is one for each board size.
         * @param nickname The nickname of the user.
         */
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
    function apply() {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwbGljYXRpb25zL21lbW9yeUdhbWUvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMvc2V0dGluZ3MvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnNMaXN0Lmpzb24iLCJjbGllbnQvc291cmNlL2pzL2RlZmF1bHRTZXR0aW5ncy5qc29uIiwiY2xpZW50L3NvdXJjZS9qcy9sYXVuY2hlci5qcyIsImNsaWVudC9zb3VyY2UvanMvcHdkLmpzIiwiY2xpZW50L3NvdXJjZS9qcy93aW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNU5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDclJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGRvY2sgPSByZXF1aXJlKFwiLi9wd2RcIik7XG5kb2NrLmluaXRpYWxpemUoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIG1haW4gaW5zdGFDaGF0IGZ1bmN0aW9uLiBUaGlzIGNyZWF0ZXMgdGhlIGFwcGxpY2F0aW9uIGFuZCBkaXNwbGF5cyBpdCBpbiB0aGUgY29udGFpbmVyLlxuICogQHBhcmFtIGNvbnRhaW5lciBUaGUgSFRNTCBlbGVtZW50IHRoZSBhcHBsaWNhdGlvbiBpcyBjcmVhdGVkIGluLlxuICovXG5mdW5jdGlvbiBpbnN0YUNoYXQoY29udGFpbmVyKSB7XG4gICAgdmFyIHNvY2tldCA9IG51bGw7XG4gICAgdmFyIGNvbmZpZyA9IHtcbiAgICAgICAgYWRyZXNzOiBcIndzOi8vdmhvc3QzLmxudS5zZToyMDA4MC9zb2NrZXQvXCIsXG4gICAgICAgIGtleTogXCJlREJFNzZkZVU3TDBIOW1FQmd4VUtWUjBWQ25xMFhCZFwiLFxuICAgICAgICBjaGFubmVsOiBcIlwiXG4gICAgfTtcblxuICAgIGxvZ2luKCkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBwcmludE9wZXJhdGlvbnNTY3JlZW4oKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLnRleHRBcmVhXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICBzZW5kKGV2ZW50LnRhcmdldC52YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnRhcmdldC52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhlIHRlbXBsYXRlIGFuZCBwcmludHMgdGhlIGxvZ2luIHNjcmVlbiBpbiB0aGUgY29udGFpbmVyLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHByaW50TG9naW5TY3JlZW4oKSB7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIG5vZGU7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2luc3RhQ2hhdExvZ2luVGVtcGxhdGVcIik7XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhlIHRlbXBsYXRlIGZvciBvcGVyYXRpb25zLiBTbyB0aGUgY2hhckJveCBhbmQgdGV4dGFyZWEgaXMgY3JlYXRlZC4gVGhlIHNlbGVjdCBlbGVtZW50IHdpdGggdGhlIGNoYW5uZWxcbiAgICAgKiBvcHRpb25zIGlzIGFsc28gYWRkZWQgdG9nZXRoZXIgd2l0aCBhbiBldmVudCBsaXN0ZW5lciBsaXN0ZW5pbmcgZm9yIGNoYW5nZSBpbiB0aGUgc2VsZWN0LiBXaGVuIHRoZXJlIGlzIGEgY2hhbmdlXG4gICAgICogdGhlIG5ldyBjaGFubmVsIGlzIHVzZWQgdG8gYm90aCBsaXN0ZW4gb24gYW5kIHdyaXRlIHRvLiBBIG5vdGlmaWNhdGlvbiBpcyBhbHNvIHByaW50ZWQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJpbnRPcGVyYXRpb25zU2NyZWVuKCkge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBub2RlO1xuICAgICAgICB2YXIgb3B0aW9ucztcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjaW5zdGFDaGF0VGVtcGxhdGVcIik7XG4gICAgICAgIG5vZGUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2NoYW5uZWxTZWxlY3RUZW1wYWx0ZVwiKTtcbiAgICAgICAgbm9kZSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIudG9wYmFyXCIpLmFwcGVuZENoaWxkKG5vZGUpO1xuXG4gICAgICAgIG5vZGUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBzZWxlY3RlZDtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBub2RlLmNoaWxkcmVuO1xuXG4gICAgICAgICAgICBzZWxlY3RlZCA9IG5vZGUub3B0aW9uc1tub2RlLnNlbGVjdGVkSW5kZXhdO1xuXG4gICAgICAgICAgICBjb25maWcuY2hhbm5lbCA9IHNlbGVjdGVkLnZhbHVlO1xuICAgICAgICAgICAgcHJpbnROb3RpZmljYXRpb24oXCJTd2l0Y2hlZCB0byBcIiArIHNlbGVjdGVkLmZpcnN0Q2hpbGQuZGF0YSArIFwiIGNoYW5uZWxcIiwgZmFsc2UpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmludHMgYSBtZXNzYWdlIHRvIHRoZSBjaGF0IGJveC4gQWxzbyBhZHMgYSB0aW1lc3RhbXAgdG8gZWFjaCBtZXNzYWdlIHNvIHdlIGtub3cgd2hlbiB3ZSBnb3QgaXQuIFRoZSB1c2VybmFtZSBvZlxuICAgICAqIHRoZSBwZXJzb24gd2hvIHNlbnQgaXQgaXMgYWxzbyBkaXNwbGF5ZWQuIElmIHRoZSBtZXNzYWdlIHdhcyBzZW50IGJ5IHRoaXMgdXNlciB0aGVuIHRoZSBtZXNzYWdlIHdpbGwgaGF2ZVxuICAgICAqIGEgZGlmZmVyZW50IGNsYXNzIHRvIGxvb2sgZGlmZmVyZW50IGFuZCBpbnN0ZWFkIG9mIHRoZSB1c2VybmFtZSBpdCB3aWxsIHNheSBcInlvdVwiLlxuICAgICAqIEBwYXJhbSBtZXNzYWdlIEFuIG9iamVjdHMgZnJvbSB0aGUgc2VydmVyIGNvbnRhaW5pbmcgYSBtZXNzYWdlIGFuZCBvdGhlciBpbmZvcm1hdGlvbi5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwcmludE1lc3NhZ2UobWVzc2FnZSkge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBmcmFnbWVudDtcbiAgICAgICAgdmFyIG1lc3NhZ2VFbGVtZW50O1xuICAgICAgICB2YXIgdXNlcm5hbWVFbGVtZW50O1xuICAgICAgICB2YXIgY2hhdEJveCA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmNoYXRCb3hcIik7XG4gICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoKTtcbiAgICAgICAgdmFyIHRpbWUgPSBkYXRlLmdldEhvdXJzKCkgKyBcIjpcIjtcbiAgICAgICAgaWYgKGRhdGUuZ2V0TWludXRlcygpIDwgMTApIHtcbiAgICAgICAgICAgIHRpbWUgKz0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRpbWUgKz0gZGF0ZS5nZXRNaW51dGVzKCk7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lc3NhZ2VUZW1wbGF0ZVwiKTtcbiAgICAgICAgZnJhZ21lbnQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuXG4gICAgICAgIHVzZXJuYW1lRWxlbWVudCA9IGZyYWdtZW50LnF1ZXJ5U2VsZWN0b3IoXCIudXNlcm5hbWVcIik7XG4gICAgICAgIG1lc3NhZ2VFbGVtZW50ID0gZnJhZ21lbnQucXVlcnlTZWxlY3RvcihcIi5tZXNzYWdlXCIpO1xuXG4gICAgICAgIGlmIChtZXNzYWdlLnVzZXJuYW1lID09PSBzZXNzaW9uU3RvcmFnZS51c2VybmFtZSkge1xuICAgICAgICAgICAgbWVzc2FnZS51c2VybmFtZSA9IFwiWW91XCI7XG4gICAgICAgICAgICB1c2VybmFtZUVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIHVzZXJuYW1lU2VudFwiO1xuICAgICAgICAgICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIG1lc3NhZ2VTZW50XCI7XG4gICAgICAgIH1cblxuICAgICAgICB1c2VybmFtZUVsZW1lbnQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZS51c2VybmFtZSArIFwiIFwiICsgdGltZSkpO1xuICAgICAgICBtZXNzYWdlRWxlbWVudC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlLmRhdGEpKTtcblxuICAgICAgICBjaGF0Qm94LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmludHMgYSBub3RpZmljYXRpb24gaW4gdGhlIGNoYXRCb3guIElmIHRlbXBvcmFyeSBpcyB0cnVlIHRoZW4gdGhlIG1lc3NhZ2Ugd2lsbCBkaXNhcGVhciBhZnRlciA1IHNlY29uZHMuXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgQSBtZXNzYWdlIHdlIHdhbnQgaW4gdGhlIG5vdGlmaWNhdGlvbi5cbiAgICAgKiBAcGFyYW0gdGVtcG9yYXJ5IFRydWUgaWYgd2Ugd2FudCB0aGUgbWVzc2FnZSB0byBkaXNhcHBlYXIgYWZ0ZXIgNSBzZWNvbmRzLiBJZiBub3QgdGhlIGZhbHNlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHByaW50Tm90aWZpY2F0aW9uKG1lc3NhZ2UsIHRlbXBvcmFyeSkge1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25vdGlmaWNhdGlvblRlbXBsYXRlXCIpO1xuICAgICAgICB2YXIgbm90aWZpY2F0aW9uID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICAgICAgdmFyIHRleHQ7XG5cbiAgICAgICAgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpO1xuXG4gICAgICAgIG5vdGlmaWNhdGlvbi5hcHBlbmRDaGlsZCh0ZXh0KTtcblxuICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jaGF0Qm94XCIpLmFwcGVuZENoaWxkKG5vdGlmaWNhdGlvbik7XG5cbiAgICAgICAgaWYgKHRlbXBvcmFyeSkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb24ucmVtb3ZlKCk7XG4gICAgICAgICAgICB9LCA1MDAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgdGhlIGxvZ2luIGZ1bmN0aW9uYWxpdHkuIFJldHVybnMgYSBwcm9taXNlIGNvbnRhaW5pbmcgYW4gaWYgc3RhdGVtZW50IGFuZCBhbiBldmVudCBsaXN0ZW5lci4gVGhlIGlmXG4gICAgICogc3RhdGVtZW50IGNoZWNrcyBpZiBhIHVzZXJuYW1lIGFscmVhZHkgZXhpc3RzIGluIHRoaXMgc2Vzc2lvbi4gSWYgc28gd2UgdXNlIHRoYXQgbmFtZSBhbmQgcmVtb3ZlIHRoZSBsb2dpbkRpdlxuICAgICAqIGFuZCBjYWxsIHJlc29sdmUuIFRoZSBldmVudCBsaXN0ZW5lciBpcyBjcmVhdGVkIGlmIHdlIGNhbid0IGZpbmQgYSB1c2VybmFtZS4gSXQgd2lsbCBsaXN0ZW4gdG8gYSBwcmVzcyBvZiB0aGVcbiAgICAgKiBlbnRlciBrZXkgb24gdGhlIGxvZ2luRGl2LiBJZiB0aGVyZSBpcyBub3RoaW5nIGluIHRoZSB0ZXh0IGlucHV0IHRoZW4gYSB0ZXh0IGlzIHNob3dzIHRvIHRoZSB1c2VyLiBCdXQgaWYgdGhlcmVcbiAgICAgKiBpcyBhIHRleHQgdGhlbiB3ZSBzYXZlIHRoZSBuYW1lIGluIHNlc3Npb24gYW5kIG1vdmUgb24uXG4gICAgICogQHJldHVybnMge1Byb21pc2V9IEEgcHJvbWlzZSBvZiBhIHVzZXJuYW1lLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxvZ2luKCkge1xuICAgICAgICBwcmludExvZ2luU2NyZWVuKCk7XG4gICAgICAgIHZhciBsb2dpbkRpdiA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmluc3RhQ2hhdExvZ2luXCIpO1xuXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlKSB7XG5cbiAgICAgICAgICAgIGlmIChzZXNzaW9uU3RvcmFnZS51c2VybmFtZSkge1xuICAgICAgICAgICAgICAgIGxvZ2luRGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxvZ2luRGl2LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5rZXlDb2RlID09PSAxMykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXZlbnQudGFyZ2V0LnZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXNzaW9uU3RvcmFnZS51c2VybmFtZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvZ2luRGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCIuYWxlcnRUZXh0XCIpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiUGxlYXNlIGVudGVyIGEgdXNlcm5hbWUhXCIpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGZ1bmN0aW9ucyBpcyBjYWxsZWQgdG8gY29ubmVjdCB0byB0aGUgc2VydmVyLiBJdCByZXR1cm5zIGEgUHJvbWlzZS4gSW4gdGhpcyBQcm9taXNlIHdlIGNyZWF0ZSBhIHdlYiBzb2NrZXRcbiAgICAgKiBjb25uZWN0aW9uIHRvIHRoZSBzZXJ2ZXIuIFdlIHRoZW4gbGlzdGVuIGZvciB0aGUgZXZlbnQgb3BlbiBmcm9tIHRoZSBzZXJ2ZXIuIFdlIGFsc28gbGlzdGVuIGZvciBhbiBlcnJvciBzbyB3ZVxuICAgICAqIGtub3cgaWYgc29tZXRoaW5nIHdoZW4gd3JvbmcuIEFuIGV2ZW50IGxpc3RlbmVyIGZvciBtZXNzYWdlcyBpcyBhbHNvIGFkZGVkLiBUaGUgdHlwZSBvZiB0aGUgbWVzc2FnZSBpcyBjaGVja2VkXG4gICAgICogYW5kIGRlcGVuZGluZyBvbiB3aGF0IHR5cGUgaXQgaXMgdGhlbiBpdCB3aWxsIGJlIHByaW50ZWQgYXMgYSBtZXNzYWdlLCBhIG5vdGlmaWNhdGlvbiBvciBub3QgcHJpbnRlZCBhdCBhbGwuXG4gICAgICogQHJldHVybnMge1Byb21pc2V9XG4gICAgICovXG4gICAgZnVuY3Rpb24gY29ubmVjdCgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgc29ja2V0ID0gbmV3IFdlYlNvY2tldChjb25maWcuYWRyZXNzKTtcbiAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwib3BlblwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIucXVlcnlTZWxlY3RvcihcIi5jbG9zZVdpbmRvd0J1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHNvY2tldC5jbG9zZSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHNvY2tldC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KFwiQW4gZXJyb3IgaGFzIG9jY3VyZWRcIik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgc29ja2V0LmFkZEV2ZW50TGlzdGVuZXIoXCJtZXNzYWdlXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PT0gXCJtZXNzYWdlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1lc3NhZ2UuY2hhbm5lbCA9PT0gY29uZmlnLmNoYW5uZWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW50TWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobWVzc2FnZS50eXBlID09PSBcIm5vdGlmaWNhdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHByaW50Tm90aWZpY2F0aW9uKG1lc3NhZ2UuZGF0YSArIFwiIFdlbGNvbWUgXCIgKyBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwidXNlcm5hbWVcIiksIHRydWUpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUbygwLCAxMDApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBzZW5kIG1lc3NhZ2VzIHRvIHRoZSBzZXJ2ZXIuIFdlIGNyZWF0ZSBhbiBvYmplY3QgYW5kIGZpbGwgaXQgd2l0aCB0aGUgaW5mb3JtYXRpb24gaXRcbiAgICAgKiBuZWVkcyBhbmQgdGhlbiB1c2Ugc2VuZCBtZXRob2QuXG4gICAgICogQHBhcmFtIHRleHQgVGV4dCB3ZSB3YW50IHRvIHNlbmQgdG8gdGhlIHNlcnZlciBhbmQgaW4gdHVybiB0aGUgb3RoZXIgdXNlcnMuXG4gICAgICovXG4gICAgZnVuY3Rpb24gc2VuZCh0ZXh0KSB7XG4gICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgdHlwZTogXCJtZXNzYWdlXCIsXG4gICAgICAgICAgICBkYXRhOiB0ZXh0LFxuICAgICAgICAgICAgdXNlcm5hbWU6IHNlc3Npb25TdG9yYWdlLnVzZXJuYW1lLFxuICAgICAgICAgICAgY2hhbm5lbDogY29uZmlnLmNoYW5uZWwsXG4gICAgICAgICAgICBrZXk6IGNvbmZpZy5rZXlcbiAgICAgICAgfTtcbiAgICAgICAgc29ja2V0LnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoID0gaW5zdGFDaGF0O1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVGhpcyBpcyB0aGUgbWFpbiBtZW1vcnlHYW1lIGZ1bmN0aW9uLiBJdCBjcmVhdGVzIGEgbmV3IGdhbWUgb2YgbWVtb3J5IGFuZCBkaXNwbGF5IGl0IGluIHRoZSBjb250YWluZXIuXG4gKiBAcGFyYW0gY29udGFpbmVyIFRoZSBIVE1MIGVsZW1lbnQgdGhlIGFwcGxpY2F0aW9uIGlzIGNyZWF0ZWQgaW4uXG4gKi9cbmZ1bmN0aW9uIG1lbW9yeUdhbWUoY29udGFpbmVyKSB7XG4gICAgdmFyIGdhbWVCb2FyZDtcbiAgICB2YXIgcm93cztcbiAgICB2YXIgY29scztcbiAgICB2YXIgdHVybjE7XG4gICAgdmFyIHR1cm4yO1xuICAgIHZhciBsYXN0VGlsZTtcbiAgICB2YXIgcGFpcnMgPSAwO1xuICAgIHZhciB0cmllcyA9IDA7XG5cbiAgICBwcmludFN0YXJ0U2NyZWVuKCkudGhlbihmdW5jdGlvbihib2FyZFNpemUpIHtcbiAgICAgICAgdmFyIHNpemU7XG4gICAgICAgIHNpemUgPSBib2FyZFNpemUuc3BsaXQoXCJ4XCIpO1xuICAgICAgICByb3dzID0gcGFyc2VJbnQoc2l6ZVswXSk7XG4gICAgICAgIGNvbHMgPSBwYXJzZUludChzaXplWzFdKTtcbiAgICAgICAgcGxheUdhbWUoKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFN0YXJ0cyB0aGUgbWFpbiBnYW1lLiBHZXQncyB0aGUgcmFuZG9taXplZCBhcnJheSBvZiBicmlja3MsIGNyZWF0ZXMgYW5kIHByaW50cyB0aGUgZ2FtZSB0byB0aGUgY29udGFpbmVyLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHBsYXlHYW1lKCkge1xuICAgICAgICB2YXIgdGlsZXMgPSBnZXRCcmlja3NBcnJheSgpO1xuICAgICAgICBnYW1lQm9hcmQgPSBwcmludEdhbWVTY3JlZW4odGlsZXMpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZ2FtZUJvYXJkKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBQcmludHMgdGhlIHN0YXJ0IHNjcmVlbiBmb3IgdGhlIG1lbW9yeSBnYW1lIGRpc3BsYXlpbmcgdGhlIG1lbnUgd2l0aCB0aGUgdGhyZWUgY2hvb3NlcyBmb3IgYm9hcmQgc2l6ZS4gQSBwcm9taXNlXG4gICAgICogaXMgcmV0dXJuZWQgd2l0aCBhbiBldmVudCBsaXN0ZW5lciBvbiBlYWNoIG1lbnUgaXRlbS4gV2hlbiBvbmUgb2YgdGhlIGxpbmtzIGlzIGNsaWNrZWQgYW4gZXZlbnQgaXMgdHJpZ2dlcmVkIGFuZFxuICAgICAqIHRoZSBzaXplIG9mIHRoZSBib2FyZCBpcyBzZXQuIFRoZSBzdGFydCBzY3JlZW4gaXMgdGhlbiByZW1vdmVkIGFuZCB0aGUgcmVzb2x2ZSBmdW5jdGlvbiBpcyBjYWxsZWQgd2l0aCB0aGUgYm9hcmRcbiAgICAgKiBzaXplIGFzIGFuIGFyZ3VtZW50LlxuICAgICAqIEByZXR1cm5zIFByb21pc2VcbiAgICAgKi9cbiAgICBmdW5jdGlvbiBwcmludFN0YXJ0U2NyZWVuKCkge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBkaXY7XG4gICAgICAgIHZhciBjcmVkaXRzO1xuICAgICAgICB2YXIgaTtcbiAgICAgICAgdmFyIGJvYXJkU2l6ZTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5R2FtZVN0YXJ0VGVtcGxhdGVcIik7XG4gICAgICAgIGRpdiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSk7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkaXYucXVlcnlTZWxlY3RvcihcIiNtZW1vcnlDcmVkaXRzVGVtcGxhdGVcIik7XG4gICAgICAgIGNyZWRpdHMgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoY3JlZGl0cyk7XG5cbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGRpdik7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlIChmdW5jdGlvbihyZXNvbHZlKSB7XG4gICAgICAgICAgICBmb3IgKGkgPSAxOyBpIDwgNDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgZGl2LmNoaWxkcmVuW2ldLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBib2FyZFNpemUgPSB0aGlzLmZpcnN0Q2hpbGQubGFzdENoaWxkLm5vZGVWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgZGl2LnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGJvYXJkU2l6ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByaW50cyB0aGUgZ2FtZWJvYXJkIHRvIHRoZSBjb250YWluZXIuIExvYWRzIHRlbXBsYXRlcyBmb3IgYm90aCBnYW1lIGJvYXJkIGFuZCBicmljay4gQnJpY2tzIGFyZSB0aGVuIGxvYWRlZCBpbnRvXG4gICAgICogdGhlIGdhbWUgYm9hcmQgYW5kIGFuIGV2ZW50IGxpc3RlbmVyIGlzIGFkZGVkIHRvIGV2ZXJ5IGJyaWNrIHdpdGggYWRkR2FtZU1lY2hhbmljcygpLlxuICAgICAqIEBwYXJhbSB0aWxlcyBBbiBhcnJheSBvZiBudW1iZXJzIHJlcHJlc2VudGluZyBicmlja3Mgb24gdGhlIGJvYXJkLlxuICAgICAqIEByZXR1cm5zIE5vZGUgVGhlIGVsZW1lbnQgY29udGFpbmluZyB0aGUgZ2FtZWJvYXJkLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIHByaW50R2FtZVNjcmVlbih0aWxlcykge1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciB0ZW1wbGF0ZUNvbnRlbnQ7XG4gICAgICAgIHZhciBkaXY7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUJyaWNrVGVtcGxhdGVcIik7XG4gICAgICAgIHRlbXBsYXRlQ29udGVudCA9IHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQ7XG5cbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lbW9yeUdhbWVUZW1wbGF0ZVwiKTtcbiAgICAgICAgZGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICB0aWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHRpbGUsIGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgYTtcblxuICAgICAgICAgICAgYSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGVDb250ZW50LCB0cnVlKTtcbiAgICAgICAgICAgIGFkZEdhbWVNZWNoYW5pY3MoYSwgdGlsZSk7XG4gICAgICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoYSk7XG5cbiAgICAgICAgICAgIGlmIChjb2xzID09PSAyKSB7XG4gICAgICAgICAgICAgICAgYS5maXJzdEVsZW1lbnRDaGlsZC5jbGFzc05hbWUgPSBcImJyaWNrV2lkdGgyXCI7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGNvbHMgPT09IDQpIHtcbiAgICAgICAgICAgICAgICBhLmZpcnN0RWxlbWVudENoaWxkLmNsYXNzTmFtZSA9IFwiYnJpY2tXaWR0aDRcIjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKChpbmRleCArIDEpICUgY29scyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGRpdi5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gZGl2O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYW4gZXZlbnQgbGlzdGVuZXIgdG8gbG9vayBmb3IgY2xpY2tzIG9uIHRoZSBicmljay4gV2hlbiB0aGUgZXZlbnQgdHJpZ2dlcnMgaXQgY2hlY2tzIGlmIHRoZSB0YXJnZXQgaXMgYW5cbiAgICAgKiBpbWFnZSBvciB0aGUgbGluayBzdXJyb3VuZGluZyB0aGUgaW1hZ2UgYW5kIGNvcnJlY3RzIGl0IHRvIHRoZSBpbWFnZS4gZ2FtZUxvZ2ljIGlzIHRoZW4gY2FsbGVkIHdpdGggdGlsZSwgaW5kZXhcbiAgICAgKiBhbmQgaW1hZ2UgYXMgYXJndW1lbnRzLlxuICAgICAqIEBwYXJhbSBlbGVtZW50IEFuIGVsZW1lbnQgcmVwcmVzZW50aW5nIGEgYnJpY2sgb24gdGhlIGJvYXJkLlxuICAgICAqIEBwYXJhbSB0aWxlIEEgbnVtYmVyIGlkZW50aWZ5aW5nIHRoZSB0eXBlIG9mIGEgYnJpY2suXG4gICAgICovXG4gICAgZnVuY3Rpb24gYWRkR2FtZU1lY2hhbmljcyhlbGVtZW50LCB0aWxlKSB7XG4gICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgICB2YXIgaW1nO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgaW1nID0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lID09PSBcIklNR1wiID8gZXZlbnQudGFyZ2V0IDogZXZlbnQudGFyZ2V0LmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgICAgICAgICBnYW1lTG9naWModGlsZSwgaW1nKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIHNodWZmbGVkIGFycmF5IG9mIG51bWJlciByZXByZXNlbnRpbmcgdGhlIGJyaWNrcyBvbiB0aGUgYm9hcmQuIFRoZXJlIGlzIHR3byBvZiBlYWNoIG51bWJlci4gSXQnc1xuICAgICAqIGNyZWF0ZWQsIHN1ZmZsZWQgYW5kIHJldHVybmVkLlxuICAgICAqIEByZXR1cm5zIHtBcnJheX0gU2h1ZmZsZWQgYXJyYXkgb2YgbnVtYmVyIHJlcHJlc2VudGluZyB0aGUgYnJpY2tzIGluIHRoZSBnYW1lLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGdldEJyaWNrc0FycmF5KCkge1xuICAgICAgICB2YXIgYXJyID0gW107XG4gICAgICAgIHZhciB0ZW1wO1xuICAgICAgICB2YXIgaTtcblxuICAgICAgICBmb3IgKGkgPSAxOyBpIDw9IChyb3dzICogY29scykgLyAyOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGkpO1xuICAgICAgICAgICAgYXJyLnB1c2goaSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGkgPSBhcnIubGVuZ3RoIC0gMTsgaSA+IDA7IGkgLT0gMSkge1xuICAgICAgICAgICAgdmFyIHJhbmRvbU51bWJlciA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGkpO1xuICAgICAgICAgICAgdGVtcCA9IGFycltpXTtcbiAgICAgICAgICAgIGFycltpXSA9IGFycltyYW5kb21OdW1iZXJdO1xuICAgICAgICAgICAgYXJyW3JhbmRvbU51bWJlcl0gPSB0ZW1wO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGFycjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDb250YWlucyBsb2dpYyBmb3IgdGhlIGZsb3cgb2YgdGhlIGdhbWUuIEtlZXBzIHRyYWNrIG9mIHdoZXJlIGluIHRoZSBnYW1lIHdlIGFyZSBhbmQgd2hhdCBzaG91bGQgaGFwcGVuIGluIGV2ZXJ5XG4gICAgICogc2l0dWF0aW9uLiBBbHNvIGtlZXBzIHRoZSB1c2VyIGZyb20gYnJlYWtpbmcgdGhlIGdhbWUuXG4gICAgICogQHBhcmFtIHRpbGUgVGhlIG51bWJlciB1c2VkIHRvIGlkZW50aWZ5IHdoYXQgYnJpY2sgd2UgYXJlIGRlYWxpbmcgd2l0aC5cbiAgICAgKiBAcGFyYW0gaW1nIEEgcmVmZXJlbmNlIHRvIHRoZSBicmljayBvbiB0aGUgYm9hcmQuXG4gICAgICovXG4gICAgZnVuY3Rpb24gZ2FtZUxvZ2ljKHRpbGUsIGltZykge1xuICAgICAgICBpZiAodHVybjIpIHtyZXR1cm47fVxuXG4gICAgICAgIGltZy5zcmMgPSBcImltYWdlL1wiICsgdGlsZSArIFwiLnBuZ1wiO1xuXG4gICAgICAgIGlmICghdHVybjEpIHtcbiAgICAgICAgICAgIHR1cm4xID0gaW1nO1xuICAgICAgICAgICAgbGFzdFRpbGUgPSB0aWxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGltZyA9PT0gdHVybjEpIHtyZXR1cm47fVxuXG4gICAgICAgICAgICB0cmllcyArPSAxO1xuXG4gICAgICAgICAgICB0dXJuMiA9IGltZztcbiAgICAgICAgICAgIGlmICh0aWxlID09PSBsYXN0VGlsZSkge1xuICAgICAgICAgICAgICAgIHBhaXJzICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFpcnMgPT09IChjb2xzICogcm93cykgLyAyKSB7XG4gICAgICAgICAgICAgICAgICAgIGdhbWVCb2FyZC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJpbnRIaWdoU2NvcmVTY3JlZW4oKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5wYXJlbnROb2RlLmNsYXNzTGlzdC5hZGQoXCJyZW1vdmVcIik7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnBhcmVudE5vZGUuY2xhc3NMaXN0LmFkZChcInJlbW92ZVwiKTtcblxuICAgICAgICAgICAgICAgICAgICB0dXJuMSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB0dXJuMS5zcmMgPSBcImltYWdlLzAucG5nXCI7XG4gICAgICAgICAgICAgICAgICAgIHR1cm4yLnNyYyA9IFwiaW1hZ2UvMC5wbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgdHVybjEgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICB0dXJuMiA9IG51bGw7XG4gICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFByaW50cyB0aGUgc2NvcmVCb2FyZCBmb3IgdGhpcyBib2FyZCBzaXplIGFuZCBnaXZlcyB0aGUgdXNlciB0aGUgb3B0aW9uIHRvIHNhdmUgdGhlaXIgc2NvcmUuXG4gICAgICovXG4gICAgZnVuY3Rpb24gcHJpbnRIaWdoU2NvcmVTY3JlZW4oKSB7XG4gICAgICAgIHZhciBzdG9yYWdlTmFtZSA9IFwibWVtb3J5XCIgKyByb3dzICsgXCJ4XCIgKyBjb2xzO1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBnYW1lRW5kRGl2O1xuICAgICAgICB2YXIgaGlnaFNjb3JlO1xuXG4gICAgICAgIGhpZ2hTY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZU5hbWUpKTtcblxuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVtb3J5R2FtZUVuZFRlbXBsYXRlXCIpO1xuICAgICAgICBnYW1lRW5kRGl2ID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcblxuICAgICAgICBnYW1lRW5kRGl2LnF1ZXJ5U2VsZWN0b3IoXCIuc2F2ZUhpZ2hzY29yZUZvcm1cIikuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHNhdmVIaWdoU2NvcmUoZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRcIilbMF0udmFsdWUpO1xuICAgICAgICAgICAgZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiLnNhdmVIaWdoc2NvcmVGb3JtXCIpLnJlbW92ZSgpO1xuICAgICAgICAgICAgcHJpbnRIaWdoU2NvcmUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJpbnRIaWdoU2NvcmUoKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGdhbWVFbmREaXYpO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBQcmludHMgdGhlIHNjb3JlIGJvYXJkLiBJZiBvbmUgZG9lcyBub3QgZXhpc3RzIGEgZGlmZmVyZW50IHRlbXBsYXRlIGlzIGxvYWRlZCB0ZWxsaW5nIHRoZSB1c2VyIHRoYXQgdGhlcmUgaXNcbiAgICAgICAgICogbm8gc2NvcmVzLiBJZiB0aGUgdXNlciBkZWNpZGVzIHRvIHNhdmUgaGlzL2hlciBzY29yZSB0aGVuIG9uZSB3aWxsIGJlIGNyZWF0ZWQgYW5kIHRoZSBjb3JyZWN0IHNjb3JlYm9hcmQgaXNcbiAgICAgICAgICogc2hvd24uXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBwcmludEhpZ2hTY29yZSgpIHtcbiAgICAgICAgICAgIGhpZ2hTY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oc3RvcmFnZU5hbWUpKTtcbiAgICAgICAgICAgIHZhciBvbGRTY29yZSA9IGNvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiLmhpZ2hTY29yZVwiKTtcbiAgICAgICAgICAgIGlmIChvbGRTY29yZSkge1xuICAgICAgICAgICAgICAgIG9sZFNjb3JlLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoaGlnaFNjb3JlKSB7XG4gICAgICAgICAgICAgICAgdmFyIGk7XG4gICAgICAgICAgICAgICAgdmFyIHNjb3JlO1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiI2hpZ2hTY29yZVRlbXBhdGVcIik7XG4gICAgICAgICAgICAgICAgdmFyIHNjb3JlQm9hcmQgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQuZmlyc3RFbGVtZW50Q2hpbGQsIHRydWUpO1xuXG4gICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGhpZ2hTY29yZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzY29yZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTmlja25hbWU6IFwiICsgaGlnaFNjb3JlW2ldLm5pY2tuYW1lICsgXCIgfCBUcmllczogXCIgKyBoaWdoU2NvcmVbaV0udHJpZXMpO1xuICAgICAgICAgICAgICAgICAgICBzY29yZUJvYXJkLmNoaWxkcmVuW2ldLmFwcGVuZENoaWxkKHNjb3JlKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBnYW1lRW5kRGl2LmFwcGVuZENoaWxkKHNjb3JlQm9hcmQpO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlID0gZ2FtZUVuZERpdi5xdWVyeVNlbGVjdG9yKFwiI25vSGlnaFNjb3JlVGVtcGF0ZVwiKTtcbiAgICAgICAgICAgICAgICBnYW1lRW5kRGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgdHJ1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNhdmVzIHlvdXIgbmlja25hbWUgYW5kIGFtb3VudCBvZiB0cmllcyB0byBsb2NhbCBzdG9yYWdlLiBJZiBkb24ndCBhbHJlYWR5IGhhdmUgYSBzdG9wIGZvciB0aGUgc2NvcmUgb25lIHdpbGxcbiAgICAgICAgICogYmUgY3JlYXRlZC4gVGhlcmUgaXMgb25lIGZvciBlYWNoIGJvYXJkIHNpemUuXG4gICAgICAgICAqIEBwYXJhbSBuaWNrbmFtZSBUaGUgbmlja25hbWUgb2YgdGhlIHVzZXIuXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBzYXZlSGlnaFNjb3JlKG5pY2tuYW1lKSB7XG4gICAgICAgICAgICBpZiAoaGlnaFNjb3JlKSB7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlLnB1c2goe25pY2tuYW1lOiBuaWNrbmFtZSwgdHJpZXM6IHRyaWVzfSk7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gTnVtYmVyKGEudHJpZXMpIC0gTnVtYmVyKGIudHJpZXMpO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlLnNwbGljZSg1LCAxKTtcblxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VOYW1lLCBKU09OLnN0cmluZ2lmeShoaWdoU2NvcmUpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlID0gW1xuICAgICAgICAgICAgICAgICAgICB7bmlja25hbWU6IG5pY2tuYW1lLCB0cmllczogdHJpZXN9XG4gICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKHN0b3JhZ2VOYW1lLCBKU09OLnN0cmluZ2lmeShoaWdoU2NvcmUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMubGF1bmNoID0gbWVtb3J5R2FtZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIFRoaXMgaXMgdGhlIG1haW4gc2V0dGluZ3MgZnVuY3Rpb24uIFRoaXMgY3JlYXRlcyBhIHRoZSBzZXR0aW5ncyBhcHBsaWNhdGlvbiBpbnNpZGUgdGhlIGNvbnRhaW5lci5cbiAqIEBwYXJhbSBjb250YWluZXIgVGhlIEhUTUwgZWxlbWVudCB0aGUgYXBwbGljYXRpb24gaXMgY3JlYXRlZCBpbi5cbiAqL1xuZnVuY3Rpb24gc2V0dGluZ3MoY29udGFpbmVyKSB7XG4gICAgdmFyIGZvcm07XG4gICAgdmFyIGlucHV0cztcbiAgICB2YXIgdGVtcGxhdGU7XG5cbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2V0dGluZ3NUZW1wbGF0ZVwiKTtcbiAgICBmb3JtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LmZpcnN0RWxlbWVudENoaWxkLCB0cnVlKTtcbiAgICBpbnB1dHMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKTtcblxuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcblxuICAgIGZpbGxGb3JtV2l0aERhdGEoKTtcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBhcHBseSgpO1xuICAgIH0pO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpbnB1dHNbNV0uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgaW5wdXRzWzZdLmRpc2FibGVkID0gZmFsc2U7XG4gICAgfSk7XG5cbiAgICBpbnB1dHNbNV0uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhcHBseSgpO1xuICAgIH0pO1xuXG4gICAgaW5wdXRzWzZdLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZmlsbEZvcm1XaXRoRGF0YSgpO1xuICAgIH0pO1xuXG4gICAgaW5wdXRzWzddLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgcmVzZXRUb0RlZmF1bHQoKTtcbiAgICB9KTtcblxuICAgIC8qKlxuICAgICAqIFRha2VzIHRoZSBzZXR0aW5ncyBzYXZlZCBpbiB0aGUgbG9jYWwgc3RvcmFnZSBhbmQgZmlsbHMgdGhlIGZvcm0gd2l0aCB0aGF0IGluZm9ybWF0aW9uLiBJcyB1c2VkIHdoZW4gdGhlXG4gICAgICogYXBwbGljYXRpb24gaXMgbGF1bmNoZWQgYW5kIHdoZW4gd2Ugd2FudCB0byByZXNldCBzZXR0aW5ncyBpbnN0ZWFkIG9mIGFwcGx5aW5nLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGZpbGxGb3JtV2l0aERhdGEoKSB7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSk7XG5cbiAgICAgICAgaW5wdXRzWzBdLnZhbHVlID0gc2V0dGluZ3Mud2FsbHBhcGVyO1xuXG4gICAgICAgIGlmIChzZXR0aW5ncy5oaWRlRG9jayA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIGlucHV0c1sxXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0c1syXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZXR0aW5ncy5kb2NrUG9zaXRpb24gPT09IFwidG9wXCIpIHtcbiAgICAgICAgICAgIGlucHV0c1szXS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlucHV0c1s0XS5jaGVja2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlucHV0c1s1XS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIGlucHV0c1s2XS5kaXNhYmxlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBjcmVhdGVzIGFuIG9iamVjdCBhbmQgZmlsbHMgaXQgd2l0aCB0aGUgZGF0YSBmcm9tIHRoZSBmb3JtIGFuZCBwdXRzIGl0IGluIHRoZSBsb2NhbCBzdG9yYWdlLiB1c2VTZXR0aW5nc1xuICAgICAqIGlzIHRoZW4gY2FsbGVkIHRvIHB1dCB0aGUgc2V0dGluZ3MgdG8gdXNlLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGFwcGx5KCkge1xuICAgICAgICB2YXIgbmV3U2V0dGluZyA9IHtcbiAgICAgICAgICAgIHdhbGxwYXBlcjogaW5wdXRzWzBdLnZhbHVlLFxuICAgICAgICAgICAgaGlkZURvY2s6IGlucHV0c1sxXS5jaGVja2VkID8gXCJ0cnVlXCIgOiBcImZhbHNlXCIsXG4gICAgICAgICAgICBkb2NrUG9zaXRpb246IGlucHV0c1szXS5jaGVja2VkID8gXCJ0b3BcIiA6IFwiYm90dG9tXCJcbiAgICAgICAgfTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJQV0RTZXR0aW5nc1wiLCBKU09OLnN0cmluZ2lmeShuZXdTZXR0aW5nKSk7XG4gICAgICAgIHVzZVNldHRpbmdzKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSXMgdXNlZCB3aGVuIHdlIHdhbnQgdG8gcmV0dXJuIHRvIG91ciBkZWZhdWx0IHNldHRpbmdzLiBJdCBsb2FkcyBzZXR0aW5ncyBmcm9tIGRlZmF1bHRTZXR0aW5ncy5qc29uIGFuZCBwdXRzIGl0XG4gICAgICogaW4gdGhlIGxvY2FsIHN0b3JhZ2UuIGZpbGxGb3JtV2l0aERhdGEgaXMgdGhlbiB1c2VkIHRvIGZpbGwgdGhlIGZvcm0sIGFuZCB1c2VTZXR0aW5ncyB0byB1c2Ugb3VyIG5ldyBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiByZXNldFRvRGVmYXVsdCgpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJQV0RTZXR0aW5nc1wiLCBKU09OLnN0cmluZ2lmeShyZXF1aXJlKFwiLi4vLi4vZGVmYXVsdFNldHRpbmdzLmpzb25cIikpKTtcbiAgICAgICAgZmlsbEZvcm1XaXRoRGF0YSgpO1xuICAgICAgICB1c2VTZXR0aW5ncygpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHVzZVNldHRpbmdzIGlzIHdoZW4gd2Ugd2FudCBvdXIgc2V0dGluZ3MgdG8gYmUgY2hhbmdlZCB2aXN1YWxseSBpbiB0aGUgYXBwbGljYXRpb24uIEl0IHRha2VzIHRoZSBzZXR0aW5ncyBvdXQgb2ZcbiAgICAgKiBsb2NhbCBzdG9yYWdlIGFuZCB0aGVuIGRlcGVuZGluZyBvbiB0aGUgdmFsdWVzIG9mIHRoZSBvYmplY3RzIG1lbWJlcnMgZGlmZmVyZW50IHNldHRpbmdzIGlzIHNldC5cbiAgICAgKi9cbiAgICBmdW5jdGlvbiB1c2VTZXR0aW5ncygpIHtcbiAgICAgICAgdmFyIGk7XG4gICAgICAgIHZhciBzZXR0aW5ncyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSk7XG4gICAgICAgIHZhciBidXR0b25zO1xuXG4gICAgICAgIC8vU2V0IHdhbGxwYXBlclxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiYm9keVwiKS5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIHNldHRpbmdzLndhbGxwYXBlciArIFwiKVwiO1xuXG4gICAgICAgIC8vSGlkZS9TaG93IERvY2tcbiAgICAgICAgaWYgKHNldHRpbmdzLmhpZGVEb2NrID09PSBcImZhbHNlXCIpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5zdHlsZS5oZWlnaHQgPSBcIjYwcHhcIjtcbiAgICAgICAgICAgIGJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuY2hpbGRyZW47XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgYnV0dG9uc1tpXS5zdHlsZS5oZWlnaHQgPSBcIjUwcHhcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5zdHlsZS5oZWlnaHQgPSBcIjBweFwiO1xuICAgICAgICAgICAgYnV0dG9ucyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jaGlsZHJlbjtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBidXR0b25zW2ldLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL0RvY2sgUG9zaXRpb25cbiAgICAgICAgaWYgKHNldHRpbmdzLmRvY2tQb3NpdGlvbiA9PT0gXCJ0b3BcIikge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNsYXNzTmFtZSA9IFwiZG9ja1RvcFwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpLmNsYXNzTmFtZSA9IFwiZG9ja0JvdHRvbVwiO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2ggPSBzZXR0aW5ncztcbiIsIm1vZHVsZS5leHBvcnRzPVtcbiAgICB7XCJpZFwiOiBcImluc3RhQ2hhdFwiLCBcImltZ1wiOiBcIi4uL2ltYWdlL2luc3RhQ2hhdC5wbmdcIiwgXCJiYWNrZ3JvdW5kQ29sb3JcIjogXCJ5ZWxsb3dncmVlblwifSxcbiAgICB7XCJpZFwiOiBcIm1lbW9yeUdhbWVcIiwgXCJpbWdcIjogXCIuLi9pbWFnZS90ZXN0QXBwLnBuZ1wiLCBcImJhY2tncm91bmRDb2xvclwiOiBcIkdvbGRcIn0sXG4gICAge1wiaWRcIjogXCJzZXR0aW5nc1wiLCBcImltZ1wiOiBcIi4uL2ltYWdlL3NldHRpbmdzLnBuZ1wiLCBcImJhY2tncm91bmRDb2xvclwiOiBcImNvcm5mbG93ZXJCbHVlXCJ9XG5dXG5cbiIsIm1vZHVsZS5leHBvcnRzPXtcbiAgICBcIndhbGxwYXBlclwiOiBcIi4uL2ltYWdlL3dhbGxwYXBlci5qcGdcIixcbiAgICBcImhpZGVEb2NrXCI6IFwiZmFsc2VcIixcbiAgICBcImRvY2tQb3NpdGlvblwiOiBcImJvdHRvbVwiXG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHB3ZFdpbmRvdyA9IHJlcXVpcmUoXCIuL3dpbmRvd1wiKTtcblxuLyoqXG4gKiBBIGNvbnN0cmljdG9yIGZ1bmN0aW9uIGNyZWF0aW5nIGFuIG9iamVjdCBjb250YWluaW5nIG1ldGhvZHMuIFRoZXNlIG1ldGhvZHMgYXJlIGNhbGxlZCB3aGVuIGxhdW5jaGluZyBhbiBhcHBsaWNhdGlvbi5cbiAqIFRoZSBtYXRob2Qgb2YgdGhlIGFwcGxpY2F0aW9uIGhhcyB0byBoYXZlIHRoZSBzYW1lIG5hbWUgYXMgaW4gdGhlIGFwcGxpY2F0aW9uc0xpc3QuanNvbi4gSW5zaWRlIG9uZSBvZiB0aGVzZSBtZXRob2RzXG4gKiB5b3UgY2FuIGVpdGhlciBjcmVhdGUgYW5kIGFwcGxpY2F0aW9uIG9yIGNhbGwgYSBmdW5jdGlvbiB0byBjcmVhdGUgYW4gYXBwbGljYXRpb24uXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gQXBwbGljYXRpb25zKCkge1xuXG4gICAgLyoqXG4gICAgICogSXMgY2FsbGVkIHdoZW4gd2Ugd2FudCB0byBsYXVuY2ggYW4gaW5zdGFuY2Ugb2YgdGhlIGluc3RhQ2hhdCBhcHBsaWNhdGlvbi5cbiAgICAgKiBAcGFyYW0gY29udGFpbmVyIEFuIEhUTUwgZWxlbWVudCB3aGVyZSB0aGUgYXBwbGljYXRpb24gd2lsbCBiZSBjcmVhdGVkLlxuICAgICAqL1xuICAgIHRoaXMuaW5zdGFDaGF0ID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvaW5zdGFDaGF0L2FwcFwiKTtcbiAgICAgICAgYXBwLmxhdW5jaChjb250YWluZXIpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBJcyBjYWxsZWQgd2hlbiB3ZSB3YW50IHRvIGxhdW5jaCBhbiBpbnN0YW5jZSBvZiB0aGUgaW5zdGFDaGF0IGFwcGxpY2F0aW9uLlxuICAgICAqIEBwYXJhbSBjb250YWluZXIgQW4gSFRNTCBlbGVtZW50IHdoZXJlIHRoZSBhcHBsaWNhdGlvbiB3aWxsIGJlIGNyZWF0ZWQuXG4gICAgICovXG4gICAgdGhpcy5tZW1vcnlHYW1lID0gZnVuY3Rpb24oY29udGFpbmVyKSB7XG4gICAgICAgIHZhciBhcHAgPSByZXF1aXJlKFwiLi9hcHBsaWNhdGlvbnMvbWVtb3J5R2FtZS9hcHBcIik7XG4gICAgICAgIGFwcC5sYXVuY2goY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSXMgY2FsbGVkIHdoZW4gd2Ugd2FudCB0byBsYXVuY2ggYW4gaW5zdGFuY2Ugb2YgdGhlIGluc3RhQ2hhdCBhcHBsaWNhdGlvbi5cbiAgICAgKiBAcGFyYW0gY29udGFpbmVyIEFuIEhUTUwgZWxlbWVudCB3aGVyZSB0aGUgYXBwbGljYXRpb24gd2lsbCBiZSBjcmVhdGVkLlxuICAgICAqL1xuICAgIHRoaXMuc2V0dGluZ3MgPSBmdW5jdGlvbihjb250YWluZXIpIHtcbiAgICAgICAgdmFyIGFwcCA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9ucy9zZXR0aW5ncy9hcHBcIik7XG4gICAgICAgIGFwcC5sYXVuY2goY29udGFpbmVyKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSXMgY2FsbGVkIHdoZW4gd2Ugd2FudCB0byBsYXVuY2ggYW4gaW5zdGFuY2Ugb2YgdGhlIGluc3RhQ2hhdCBhcHBsaWNhdGlvbi5cbiAgICAgKiBAcGFyYW0gY29udGFpbmVyIEFuIEhUTUwgZWxlbWVudCB3aGVyZSB0aGUgYXBwbGljYXRpb24gd2lsbCBiZSBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSBlcnIgICAgICAgQW4gZXJyb3IgbWVzc2FnZS5cbiAgICAgKi9cbiAgICB0aGlzLmVycm9yID0gZnVuY3Rpb24oY29udGFpbmVyLCBlcnIpIHtcbiAgICAgICAgdmFyIGVsZW1lbnRzID0gY29udGFpbmVyLmNoaWxkcmVuO1xuICAgICAgICB2YXIgdGV4dDtcblxuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGVsZW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBlbGVtZW50c1tpXS5yZW1vdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRleHQgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShlcnIpO1xuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQodGV4dCk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBTdGFydHMgYnkgY3JlYXRpbmcgYSBuZXcgd2luZG93LiBUaGVuIGFuIG9iamVjdCBvZiBBcHBsaWNhdGlvbnMgd2l0aCBhbGwgdGhlIGZ1bmN0aW9ucyB0byBsYXVuY2ggdGhlIGFwcGxpY2F0aW9ucy5cbiAqIFRoZSBpZCBtZW1iZXIgaW4gYXBwIGhhcyB0aGUgbmFtZSBvZiB0aGUgbWV0aG9kIHdlIHdhbnQgdG8gY2FsbCBpbiB0aGUgQXBwbGljYXRpb25zIG9iamVjdC4gV2UgdHJ5IGNhbGxpbmcgdGhhdCBhbmRcbiAqIGlmIHdlIHN1Y2NlZWQgd2Ugd2lsbCBoYXZlIGFuIGFwcGxpY2F0aW9uLiBJZiBzb21ldGhpbmcgZmFpbHMgZHVyaW5nIHRoZSBsYXVuY2ggb2YgdGhlIGFwcGxpY2F0aW9uIHRoZSBlcnJvclxuICogYXBwbGljYXRpb24gaXMgY2FsbGVkIGluc3RlYWQuXG4gKiBAcGFyYW0gYXBwIEFuIG9iamVjdCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoZSBhcHBsaWNhdGlvbiB0byBiZSBsYXVuY2hlZC5cbiAqL1xuZnVuY3Rpb24gbGF1bmNoZXIoYXBwKSB7XG4gICAgdmFyIGNvbnRhaW5lcjtcbiAgICB2YXIgYXBwbGljYXRpb25zO1xuXG4gICAgY29udGFpbmVyID0gcHdkV2luZG93LmNyZWF0ZVdpbmRvdyhhcHApO1xuICAgIGFwcGxpY2F0aW9ucyA9IG5ldyBBcHBsaWNhdGlvbnMoKTtcblxuICAgIHRyeSB7XG4gICAgICAgIGFwcGxpY2F0aW9uc1thcHAuaWRdKGNvbnRhaW5lcik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGFwcGxpY2F0aW9ucy5lcnJvcihjb250YWluZXIsIGVycik7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2hlciA9IGxhdW5jaGVyO1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy9UT0RPIEbDtnJzw7ZrIHJlbnNhIHVwcCBzw6UgbWt0IGh0bWwgb2NoIGNzcyBmcsOlbiBqYXZhc2NyaXB0a29kZW4uXG5cbnZhciBkb2NrID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNkb2NrXCIpO1xudmFyIGJ1dHRvbnMgPSBbXTtcbnZhciBsYXVuY2hlciA9IHJlcXVpcmUoXCIuL2xhdW5jaGVyXCIpO1xudmFyIGFwcGxpY2F0aW9ucyA9IHJlcXVpcmUoXCIuL2FwcGxpY2F0aW9uc0xpc3RcIik7XG5cbi8qKlxuICogVGFrZXMgdGhlIGRvY2sgYW5kIHBsYWNlcyBpdCBpbiB0aGUgY2VudGVyIG9mIHRoZSBzY3JlZW4uXG4gKi9cbmZ1bmN0aW9uIGNlbnRyYWxpemUoKSB7XG4gICAgdmFyIHdpZHRoID0gZG9jay5vZmZzZXRXaWR0aDtcbiAgICBkb2NrLnN0eWxlLm1hcmdpbkxlZnQgPSAod2lkdGggLyAyKSAqIC0xO1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIGV2ZW50IGxpc3RlbmVycyBvbiB0aGUgZG9jay4gSWYgdGhlIG1vdXNlIGlzIG92ZXIgdGhlIGRvY2sgYW4gZXZlbnQgaXMgdHJpZ2dlcmVkIHNvIHRoZSBkb2NrIGlzIHZpc2libGUuIElmXG4gKiB0aGUgbW91c2UgbW92ZXMgb3V0IG9mIHRoZSBkb2NrIGFuZCBoaWRlRG9jayBpcyBzZXQgdG8gdHJ1ZSwgdGhlIGRvY2sgd2lsbCBoaWRlLlxuICovXG5mdW5jdGlvbiBkb2NrSGlkZVNob3coKSB7XG4gICAgdmFyIGk7XG5cbiAgICBkb2NrLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW92ZXJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCI2MHB4XCI7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGJ1dHRvbnNbaV0uc3R5bGUuaGVpZ2h0ID0gXCI1MHB4XCI7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRvY2suYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlb3V0XCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGlkZURvY2sgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpLmhpZGVEb2NrO1xuXG4gICAgICAgIGlmIChoaWRlRG9jayA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgICAgIGRvY2suc3R5bGUuaGVpZ2h0ID0gXCIwcHhcIjtcblxuICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBidXR0b25zW2ldLnN0eWxlLmhlaWdodCA9IFwiMHB4XCI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuLyoqXG4gKiBBZGRzIGEgYnV0dG9uIHRvIHRoZSBkb2NrLiBMb2FkcyB0aGUgdGVtcGxhdGUsIGFkZHMgc3R5bGUgdG8gaXQgYW5kIGFuIGV2ZW50IGxpc3RlbmVyIHRvIGxhdW5jaCB0aGUgYXBwLlxuICogQHBhcmFtIGFwcCBBbiBvYmplY3QgY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCBhbiBhcHBsaWNhdGlvbi5cbiAqL1xuZnVuY3Rpb24gYWRkQnV0dG9uKGFwcCkge1xuICAgIHZhciB0ZW1wbGF0ZTtcbiAgICB2YXIgYnV0dG9uO1xuXG4gICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FwcEJ1dHRvblRlbXBsYXRlXCIpO1xuICAgIGJ1dHRvbiA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudC5maXJzdEVsZW1lbnRDaGlsZCwgZmFsc2UpO1xuXG4gICAgYnV0dG9uLmNsYXNzTmFtZSA9IFwiYXBwQnV0dG9uXCI7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGFwcC5iYWNrZ3JvdW5kQ29sb3I7XG4gICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgYXBwLmltZyArIFwiKVwiO1xuICAgIGRvY2suYXBwZW5kQ2hpbGQoYnV0dG9uKTtcbiAgICBkb2NrLnN0eWxlLndpZHRoID0gZG9jay5vZmZzZXRXaWR0aCArIDQ1O1xuXG4gICAgYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBsYXVuY2hlci5sYXVuY2hlcihhcHApO1xuICAgIH0pO1xuXG4gICAgYnV0dG9ucy5wdXNoKGJ1dHRvbik7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIHRoZXJlIGFyZSBzZXR0aW5ncyBpbiB0aGUgbG9jYWxzdG9yYWdlLCBpZiBub3QgZGF0YSBpcyBsb2FkZWQgZnJvbSBkZWZhdWx0U2V0dGluZ3MuanNvbiBhbmQgdXBsb2FkZWQgdG9cbiAqIGxvY2Fsc3RvcmFnZS4gU2V0dGluZ3MgYXJlIHRoZW4gYXBwbGllZCB0byB0aGUgd2ViIGFwcGxpY2F0aW9uLlxuICovXG5mdW5jdGlvbiBsb2FkU2V0dGluZ3MoKSB7XG4gICAgdmFyIHNldHRpbmdzO1xuICAgIGlmICghbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJQV0RTZXR0aW5nc1wiKSkge1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIlBXRFNldHRpbmdzXCIsIEpTT04uc3RyaW5naWZ5KHJlcXVpcmUoXCIuL2RlZmF1bHRTZXR0aW5ncy5qc29uXCIpKSk7XG4gICAgfVxuXG4gICAgc2V0dGluZ3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiUFdEU2V0dGluZ3NcIikpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCJib2R5XCIpLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFwiICsgc2V0dGluZ3Mud2FsbHBhcGVyICsgXCIpXCI7XG5cbiAgICBpZiAoc2V0dGluZ3MuZG9ja1Bvc2l0aW9uID09PSBcInRvcFwiKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKS5jbGFzc0xpc3QuYWRkKFwiZG9ja1RvcFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2RvY2tcIikuY2xhc3NMaXN0LmFkZChcImRvY2tCb3R0b21cIik7XG4gICAgfVxufVxuXG4vKipcbiAqIFByZXBhcmVzIGFuZCBzdGFydHMgdGhlIGZ1bmRhbWVudGFsIGZ1bmN0aW9uYWxpdGllcyBvZiB0aGUgUFdELiBDcmVhdGVzIHRoZSBkb2NrIGFuZCB0aGUgYnV0dG9ucyBhbmQgbGlua3MgdGhlbSB0b1xuICogYW4gYXBwbGljYXRpb24sIGxvYWRzIHNldHRpbmdzIGFuZCBhcHBsaWVzIHRoZW0uXG4gKi9cbmZ1bmN0aW9uIGluaXRpYWxpemUoKSB7XG4gICAgdmFyIGk7XG5cbiAgICBsb2FkU2V0dGluZ3MoKTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBhcHBsaWNhdGlvbnMubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgYWRkQnV0dG9uKGFwcGxpY2F0aW9uc1tpXSk7XG4gICAgfVxuXG4gICAgY2VudHJhbGl6ZSgpO1xuICAgIGRvY2tIaWRlU2hvdygpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0aWFsaXplID0gaW5pdGlhbGl6ZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgbGFzdEluZGV4ID0gMDtcbnZhciBvZmZzZXRYID0gMDtcbnZhciBvZmZzZXRZID0gMDtcbnZhciBwb3NpdGlvblggPSAwO1xudmFyIHBvc2l0aW9uWSA9IDA7XG52YXIgZWxlbWVudDtcblxuLyoqXG4gKiBJcyBjYWxsZWQgd2hlbiBhIG1vdXNlIGJ1dHRvbiB3YXMgcHJlc3NlZCBkb3duIGluIHRoZSB0b3AgYmFyIG9mIGEgd2luZG93LiBJdCBnaXZlcyBlbGVtZW50IGFuIHJlZmVyZW5jZSB0byB0YXJnZXRcbiAqICh0aGUgZWxlbWVudCBwcmVzc2VkKS4gSXQgYWxzbyBzZXQncyB0aGUgb2Zmc2V0IG9mIHRoZSBtb3VzZSBpbiB0aGUgd2luZG93LiBBbmQgYWRkcyAxIHRvIHRoZSBsYXN0SW5kZXggYW5kIHNldCdzXG4gKiB0aGUgd2luZG93cyB6SW5kZXggdG8gbGFzdEluZGV4LCB0aGlzIGlzIHNvIHRoZSBsYXN0IHdpbmRvdyBwcmVzc2VkIGhhcyB0aGUgaGlnaGVzdCB6SW5kZXguXG4gKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgd2luZG93IHByZXNzZWQuXG4gKi9cbmZ1bmN0aW9uIGdyYWJFbGVtZW50KHRhcmdldCkge1xuICAgIGVsZW1lbnQgPSB0YXJnZXQ7XG4gICAgb2Zmc2V0WCA9IHBvc2l0aW9uWCAtIGVsZW1lbnQub2Zmc2V0TGVmdDtcbiAgICBvZmZzZXRZID0gcG9zaXRpb25ZIC0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgbGFzdEluZGV4ICs9IDE7XG4gICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG59XG5cbi8qKlxuICogSXMgY2FsbGVkIHdoZW4gdGhlIG1vdXNlIG1vdmVzLiBDaGVja3MgaWYgZWxlbWVudCBoYXMgYSB2YWx1ZS4gSWYgc28gYSB3aW5kb3cgaGFzIGJlZW4gcHJlc3NlZCBhbmQgd2Uga25vdyB3aGF0XG4gKiB3aW5kb3cgdG8gbW92ZS4gSWYgbm90IG5vdGhpbmcgd2lsbCBoYXBwZW4uXG4gKiBAcGFyYW0gZXZlbnQgVGhlIGV2ZW50IHRoYXQgZ290IHRyaWdnZXJlZCBhbmQgY2FsbGVkIHRoZSBmdW5jdGlvbi5cbiAqL1xuZnVuY3Rpb24gbW92ZUVsZW1lbnQoZXZlbnQpIHtcbiAgICBwb3NpdGlvblggPSBldmVudC5jbGllbnRYO1xuICAgIHBvc2l0aW9uWSA9IGV2ZW50LmNsaWVudFk7XG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyIG5ld0xlZnQgPSBwb3NpdGlvblggLSAob2Zmc2V0WCArIDIpO1xuICAgICAgICB2YXIgbmV3VG9wID0gcG9zaXRpb25ZIC0gKG9mZnNldFkgKyAyKTtcblxuICAgICAgICBuZXdMZWZ0ID0gbmV3TGVmdCA8IDAgPyAwIDogbmV3TGVmdDtcbiAgICAgICAgbmV3VG9wID0gbmV3VG9wIDwgMCA/IDAgOiBuZXdUb3A7XG5cbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gbmV3TGVmdCArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSBuZXdUb3AgKyBcInB4XCI7XG4gICAgfVxufVxuXG4vKipcbiAqIElzIGNhbGxlZCBpZiB0aGUgbW91c2UgYnV0dG9uIGlzIHJlbGVhc2VkLiBTZXQncyBlbGVtZW50IHRvIHVuZGVmaW5lZCBzbyBhIHdpbmRvdyB3b24ndCBiZSBtb3ZlZCBhcm91bmQuXG4gKi9cbmZ1bmN0aW9uIHJlbGVhc2VFbGVtZW50KCkge1xuICAgIGVsZW1lbnQgPSB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogVGFrZXMgdGhlIG5hbWUgb2YgdGhlIHRlbXBsYXRlIGFuZCB0aGUgbmFtZSBvZiB0aGUgY29udGFpbmVyIGFuZCBsb2FkcyB0aGUgY29udGVudCBvZiB0aGUgdGVtcGxhdGUgaW50byB0aGVcbiAqIGNvbnRhaW5lci5cbiAqIEBwYXJhbSB0ZW1wbGF0ZU5hbWVcbiAqIEBwYXJhbSBjb250YWluZXJOYW1lXG4gKi9cbmZ1bmN0aW9uIGFkZFRlbXBsYXRlKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgIHZhciBjb250YWluZXI7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJOYW1lKTtcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGVtcGxhdGVOYW1lKTtcbiAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG5cbi8qKlxuICogQSB3aW5kb3cgaXMgY3JlYXRlZC4gVW5pdmVyc2FsIGNvbnRlbnQgbGlrZSB0b3AgYmFyIGlzIGFkZGVkIGFuZCBzb21lIHBpZWNlcyBvZiBzdHlsZSBpcyBhZGRlZCBsaWtlIGljb25zIGFuZFxuICogYmFja2dyb3VuZCBjb2xvci4gRXZlbnRsaXN0ZW5lcnMgZm9yIG1vdmluZyB0aGUgd2luZG93IGFuZCBjbG9zaW5nIGl0IGlzIGFsc28gYWRkZWQuXG4gKiBAcGFyYW0gYXBwIEFuIG9iamVjdCBjb250YWluaW5nIGluZm9ybWF0aW9uIGFib3V0IHRoZSBhcHBsaWNhdGlvbiBsb2FkZWQgaW50byB0aGUgd2luZG93LlxuICogQHJldHVybnMgSFRNTCBFbGVtZW50IFRoZSB3aW5kb3cgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gY3JlYXRlV2luZG93KGFwcCkge1xuICAgIHZhciB0b3BiYXI7XG4gICAgdmFyIGFwcFdpbmRvdztcblxuICAgIGFkZFRlbXBsYXRlKFwiI2FwcFdpbmRvd1RlbXBsYXRlXCIsIFwiYm9keVwiKTtcbiAgICBhcHBXaW5kb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKVtkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKS5sZW5ndGggLSAxXTtcbiAgICBhcHBXaW5kb3cuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gYXBwLmJhY2tncm91bmRDb2xvcjtcbiAgICB0b3BiYXIgPSBhcHBXaW5kb3cucXVlcnlTZWxlY3RvcihcIi50b3BiYXJcIik7XG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuYXBwSWNvblwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgYXBwLmltZyk7XG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuYXBwVGl0bGVcIikuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYXBwLmlkKSk7XG5cbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBhcHBXaW5kb3cuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xuXG4gICAgLy8gR3JhYiB3aW5kb3dcbiAgICB0b3BiYXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZ3JhYkVsZW1lbnQoYXBwV2luZG93KTtcbiAgICB9KTtcblxuICAgIC8vIE1vdmUgd2luZG93XG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgbW92ZUVsZW1lbnQpO1xuXG4gICAgLy8gUmVsZWFzZSB3aW5kb3dcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCByZWxlYXNlRWxlbWVudCk7XG5cbiAgICAvLyBGb2N1cyBvbiB3aW5kb3cgYW5kIG1vdmUgdG8gdG9wXG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgbGFzdEluZGV4ICs9IDE7XG4gICAgICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgfSk7XG5cbiAgICAvLyBDbG9zZSB3aW5kb3dcbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5jbG9zZVdpbmRvd0J1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgYXBwV2luZG93LnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIGFwcFdpbmRvdztcbn1cblxubW9kdWxlLmV4cG9ydHMuY3JlYXRlV2luZG93ID0gY3JlYXRlV2luZG93O1xuIl19
