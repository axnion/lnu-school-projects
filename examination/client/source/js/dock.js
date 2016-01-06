var dock = document.querySelector("#dock");
var launcher = require("./launcher");

var applications = [
    {id: "test", img: "../image/test.jpg"},
    {id: "error", img: ""}
];

function centralize() {
    var width = dock.offsetWidth + 110;
    dock.style.marginLeft = (width / 2) * -1;
}

function init() {
    var i;
    centralize();

    for (i = 0; i < applications.length; i += 1) {
        addButton(applications[i]);
    }
}

function addButton(app) {
    dock.style.width = dock.offsetWidth + 45;
    var button = document.createElement("div");
    button.className = "appButton";
    button.style.backgroundImage = "url(" + app.img + ")";
    dock.appendChild(button);

    button.addEventListener("click", function() {
        launcher.launchApplication(app.id);
    });
}

module.exports.init = init;
