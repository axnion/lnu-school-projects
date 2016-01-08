var dock = document.querySelector("#dock");
var buttons = [];
var launcher = require("./launcher");

var applications = [
    {id: "testApp", img: "../image/testApp.png", backgroundColor: "indianred"},
    {id: "instaChat", img: "../image/instaChat.png", backgroundColor: "yellowgreen"}
];

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
        dock.style.height = "0px";

        for (i = 0; i < buttons.length; i += 1) {
            buttons[i].style.height = "0px";
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
        launcher.launchApplication(app);
    });

    buttons.push(button);
}

function init() {
    var i;
    for (i = 0; i < applications.length; i += 1) {
        addButton(applications[i]);
    }

    centralize();
    dockHideShow();
}

module.exports.init = init;
