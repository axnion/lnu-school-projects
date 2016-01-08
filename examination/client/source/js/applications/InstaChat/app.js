var socket = null;
var config = {
    adress: "ws://vhost3.lnu.se:20080/socket/",
    key: "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd",
    username: "an222yp"
};

function printMessage(container, message) {
    var template;
    var fragment;
    var messageElement;
    var username;
    var chatBox = container.querySelector(".chatBox");

    template = document.querySelector("#messageTemplate");
    fragment = document.importNode(template.content, true);

    username = fragment.querySelector(".username");
    username.appendChild(document.createTextNode(message.username));
    messageElement = fragment.querySelector(".message");
    messageElement.appendChild(document.createTextNode(message.data));


    if (message.username === config.username) {
        messageElement.className += " sentMessage";
    } else {
        messageElement.className += " receivedMessage";
    }

    chatBox.appendChild(fragment);
}

function print(container) {
    var template;
    var node;

    template = document.querySelector("#instaChatTemplate");
    node = document.importNode(template.content, true);
    container.appendChild(node);

    container.style.backgroundColor = "greenyellow";
}

function connect(container) {
    return new Promise(function(resolve, reject) {
        socket = new WebSocket(config.adress);
        socket.addEventListener("open", function() {
            resolve();
        });

        socket.addEventListener("error", function() {
            reject("Det gick fel");
        });

        socket.addEventListener("message", function(event) {
            var message = JSON.parse(event.data);

            if(message.type === "message") {
                printMessage(container, message);
            }
        });
    });
}

function send(text) {
    var data = {
        type: "message",
        data: text,
        username: config.username,
        channel: "",
        key: config.key
    };
    socket.send(JSON.stringify(data));
}

function launch(container) {
    connect(container).then(function() {
        print(container);
        container.querySelector(".textArea").addEventListener("keypress", function(event) {
            if (event.keyCode === 13) {
                send(event.target.value);
                event.target.value = "";
                event.preventDefault();
            }
        });
    });

    container.querySelector(".closeWindowButton").addEventListener("click", function() {
        socket.close();
    });
}

module.exports.launch = launch;
