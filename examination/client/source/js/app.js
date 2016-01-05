var buttonCreateWindow = document.querySelector("#buttonCreateWindow");
var lastIndex = 0;

var element = undefined;
var offsetX = 0;
var offsetY = 0;
var positionX = 0;
var positionY = 0;

function grabElement(target) {
    element = target;
    offsetX = positionX - element.offsetLeft;
    offsetY = positionY - element.offsetTop;
    lastIndex += 1;
    element.style.zIndex = lastIndex;
}

function moveElement(event) {
    positionX = event.clientX;
    positionY = event.clientY;
    if (element) {
        element.style.left = positionX - (offsetX + 2) + "px";
        element.style.top = positionY - (offsetY + 2) + "px";
    }
}

function releaseElement() {
    element = undefined;
}

function addTemplate(templateName, containerName) {
    var container;
    var template;
    var form;

    container = document.querySelector(containerName);
    template = document.querySelector(templateName);
    form = document.importNode(template.content, true);
    container.appendChild(form);
}

function printWindow() {
    var topbars;
    var appWindows;
    var topbar;
    var appWindow;
    addTemplate("#appWindowTemplate", "body");

    topbars = document.querySelectorAll(".topbar");
    appWindows = document.querySelectorAll(".appWindow");

    topbar = topbars[topbars.length - 1];
    appWindow = appWindows[appWindows.length - 1];
    lastIndex += 1;
    appWindow.style.zIndex = lastIndex;
    appWindow.addEventListener("click", function(event) {
        event.stopPropagation();
        lastIndex += 1;
        element.style.zIndex = lastIndex;
    });

    topbar.addEventListener("mousedown", function() {
        grabElement(appWindow);
    });

    appWindow.addEventListener("mousemove", moveElement);
    document.addEventListener("mouseup", releaseElement);

    topbar.querySelector(".closeWindowButton").addEventListener("click", function() {
        appWindow.remove();
    });
}

buttonCreateWindow.addEventListener("click", printWindow);

