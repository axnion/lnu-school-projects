function testApp(container) {
    var app = require("./applications/testApp/app");

    app.start(container);
}

function instaChat(container) {
    var app = require("./applications/instaChat/app");

    app.launch(container);
}

function error(container) {
    var text = document.createTextNode("An error occurred");
    container.appendChild(text);
}

module.exports.testApp = testApp;
module.exports.instaChat = instaChat;
module.exports.error = error;
