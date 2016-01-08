var socket = null;
var config = {
    adress: "ws://vhost3.lnu.se:20080/socket/",
    key: "eDBE76deU7L0H9mEBgxUKVR0VCnq0XBd"
};

function print(container) {
    var template;
    var node;

    template = document.querySelector("#instaChatTemplate");
    node = document.importNode(template.content, true);
    container.appendChild(node);
}

function connect(container) {
    return new Promise(function(resolve, reject) {
        socket = new WebSocket(config.adress);
        socket.addEventListener("open", function(){
            resolve();
        });

        socket.addEventListener("message", function(event) {
            var message = JSON.parse(event.data);
            printMessage(container, message);
        });
    });
}

function send(text) {
    var data = {
        type: "message",
        data: text,
        username: "an222yp",
        channel: "",
        key: config.key
    };

    console.log("Sending: " + text);
    socket.send(JSON.stringify(data));
}

function printMessage(container, message) {
    console.log(message.username + ": " + message.data);
}

function launch(container) {
    connect(container).then(function() {
        print(container);
        container.querySelector(".messageBox").addEventListener("keypress", function(event) {
            if (event.keyCode === 13) {
                send(event.target.value);
                event.target.value = "";
                event.preventDefault();
            }
        });
    });
}

module.exports.launch = launch;
