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
