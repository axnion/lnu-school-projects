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
