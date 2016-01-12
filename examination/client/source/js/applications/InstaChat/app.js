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
