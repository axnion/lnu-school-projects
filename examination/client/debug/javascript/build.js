(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var dock = require("./dock");
dock.init();




},{"./dock":3}],2:[function(require,module,exports){
function test(container) {
    var text = document.createTextNode("This is a test application");
    container.appendChild(text);
}

function error(container) {
    var text = document.createTextNode("An error has occured");
    container.appendChild(text);
}

module.exports.test = test;
module.exports.error = error;

},{}],3:[function(require,module,exports){
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

},{"./launcher":4}],4:[function(require,module,exports){
var pwdWindow = require("./window");


function launchApplication(appID) {
    var appWindow;
    var launcherSpace;
    var launcher;

    appWindow = pwdWindow.createWindow();
    launcherSpace = require("./applications");

    try {
        launcher = launcherSpace[appID];
        launcher(appWindow);
    } catch (error) {
        launcherSpace.error(appWindow);
    }
}

module.exports.launchApplication = launchApplication;

},{"./applications":2,"./window":5}],5:[function(require,module,exports){
var lastIndex = 0;
var offsetX = 0;
var offsetY = 0;
var positionX = 0;
var positionY = 0;
var element;

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
    var node;

    container = document.querySelector(containerName);
    template = document.querySelector(templateName);
    node = document.importNode(template.content, true);
    container.appendChild(node);
}

function createWindow() {
    var topbar;
    var appWindow;

    addTemplate("#appWindowTemplate", "body");

    appWindow = document.querySelectorAll(".appWindow")[document.querySelectorAll(".appWindow").length - 1];
    topbar = appWindow.querySelector(".topbar");

    lastIndex += 1;
    appWindow.style.zIndex = lastIndex;

    topbar.addEventListener("mousedown", function() {
        grabElement(appWindow);
    });

    appWindow.addEventListener("mousemove", moveElement);
    document.addEventListener("mouseup", releaseElement);

    appWindow.addEventListener("click", function(event) {
        event.stopPropagation();
        lastIndex += 1;
        appWindow.style.zIndex = lastIndex;
    });

    topbar.querySelector(".closeWindowButton").addEventListener("click", function() {
        appWindow.remove();
    });

    return appWindow;
}

module.exports.createWindow = createWindow;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBsaWNhdGlvbnMuanMiLCJjbGllbnQvc291cmNlL2pzL2RvY2suanMiLCJjbGllbnQvc291cmNlL2pzL2xhdW5jaGVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy93aW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDWkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBkb2NrID0gcmVxdWlyZShcIi4vZG9ja1wiKTtcbmRvY2suaW5pdCgpO1xuXG5cblxuIiwiZnVuY3Rpb24gdGVzdChjb250YWluZXIpIHtcbiAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiVGhpcyBpcyBhIHRlc3QgYXBwbGljYXRpb25cIik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRleHQpO1xufVxuXG5mdW5jdGlvbiBlcnJvcihjb250YWluZXIpIHtcbiAgICB2YXIgdGV4dCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiQW4gZXJyb3IgaGFzIG9jY3VyZWRcIik7XG4gICAgY29udGFpbmVyLmFwcGVuZENoaWxkKHRleHQpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy50ZXN0ID0gdGVzdDtcbm1vZHVsZS5leHBvcnRzLmVycm9yID0gZXJyb3I7XG4iLCJ2YXIgZG9jayA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZG9ja1wiKTtcbnZhciBsYXVuY2hlciA9IHJlcXVpcmUoXCIuL2xhdW5jaGVyXCIpO1xuXG52YXIgYXBwbGljYXRpb25zID0gW1xuICAgIHtpZDogXCJ0ZXN0XCIsIGltZzogXCIuLi9pbWFnZS90ZXN0LmpwZ1wifSxcbiAgICB7aWQ6IFwiZXJyb3JcIiwgaW1nOiBcIlwifVxuXTtcblxuZnVuY3Rpb24gY2VudHJhbGl6ZSgpIHtcbiAgICB2YXIgd2lkdGggPSBkb2NrLm9mZnNldFdpZHRoICsgMTEwO1xuICAgIGRvY2suc3R5bGUubWFyZ2luTGVmdCA9ICh3aWR0aCAvIDIpICogLTE7XG59XG5cbmZ1bmN0aW9uIGluaXQoKSB7XG4gICAgdmFyIGk7XG4gICAgY2VudHJhbGl6ZSgpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGFwcGxpY2F0aW9ucy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBhZGRCdXR0b24oYXBwbGljYXRpb25zW2ldKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGFkZEJ1dHRvbihhcHApIHtcbiAgICBkb2NrLnN0eWxlLndpZHRoID0gZG9jay5vZmZzZXRXaWR0aCArIDQ1O1xuICAgIHZhciBidXR0b24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGJ1dHRvbi5jbGFzc05hbWUgPSBcImFwcEJ1dHRvblwiO1xuICAgIGJ1dHRvbi5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIGFwcC5pbWcgKyBcIilcIjtcbiAgICBkb2NrLmFwcGVuZENoaWxkKGJ1dHRvbik7XG5cbiAgICBidXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsYXVuY2hlci5sYXVuY2hBcHBsaWNhdGlvbihhcHAuaWQpO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5pbml0ID0gaW5pdDtcbiIsInZhciBwd2RXaW5kb3cgPSByZXF1aXJlKFwiLi93aW5kb3dcIik7XG5cblxuZnVuY3Rpb24gbGF1bmNoQXBwbGljYXRpb24oYXBwSUQpIHtcbiAgICB2YXIgYXBwV2luZG93O1xuICAgIHZhciBsYXVuY2hlclNwYWNlO1xuICAgIHZhciBsYXVuY2hlcjtcblxuICAgIGFwcFdpbmRvdyA9IHB3ZFdpbmRvdy5jcmVhdGVXaW5kb3coKTtcbiAgICBsYXVuY2hlclNwYWNlID0gcmVxdWlyZShcIi4vYXBwbGljYXRpb25zXCIpO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgbGF1bmNoZXIgPSBsYXVuY2hlclNwYWNlW2FwcElEXTtcbiAgICAgICAgbGF1bmNoZXIoYXBwV2luZG93KTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBsYXVuY2hlclNwYWNlLmVycm9yKGFwcFdpbmRvdyk7XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cy5sYXVuY2hBcHBsaWNhdGlvbiA9IGxhdW5jaEFwcGxpY2F0aW9uO1xuIiwidmFyIGxhc3RJbmRleCA9IDA7XG52YXIgb2Zmc2V0WCA9IDA7XG52YXIgb2Zmc2V0WSA9IDA7XG52YXIgcG9zaXRpb25YID0gMDtcbnZhciBwb3NpdGlvblkgPSAwO1xudmFyIGVsZW1lbnQ7XG5cbmZ1bmN0aW9uIGdyYWJFbGVtZW50KHRhcmdldCkge1xuICAgIGVsZW1lbnQgPSB0YXJnZXQ7XG4gICAgb2Zmc2V0WCA9IHBvc2l0aW9uWCAtIGVsZW1lbnQub2Zmc2V0TGVmdDtcbiAgICBvZmZzZXRZID0gcG9zaXRpb25ZIC0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgbGFzdEluZGV4ICs9IDE7XG4gICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG59XG5cbmZ1bmN0aW9uIG1vdmVFbGVtZW50KGV2ZW50KSB7XG4gICAgcG9zaXRpb25YID0gZXZlbnQuY2xpZW50WDtcbiAgICBwb3NpdGlvblkgPSBldmVudC5jbGllbnRZO1xuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IHBvc2l0aW9uWCAtIChvZmZzZXRYICsgMikgKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gcG9zaXRpb25ZIC0gKG9mZnNldFkgKyAyKSArIFwicHhcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbGVhc2VFbGVtZW50KCkge1xuICAgIGVsZW1lbnQgPSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGFkZFRlbXBsYXRlKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgIHZhciBjb250YWluZXI7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJOYW1lKTtcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGVtcGxhdGVOYW1lKTtcbiAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVdpbmRvdygpIHtcbiAgICB2YXIgdG9wYmFyO1xuICAgIHZhciBhcHBXaW5kb3c7XG5cbiAgICBhZGRUZW1wbGF0ZShcIiNhcHBXaW5kb3dUZW1wbGF0ZVwiLCBcImJvZHlcIik7XG5cbiAgICBhcHBXaW5kb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKVtkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmFwcFdpbmRvd1wiKS5sZW5ndGggLSAxXTtcbiAgICB0b3BiYXIgPSBhcHBXaW5kb3cucXVlcnlTZWxlY3RvcihcIi50b3BiYXJcIik7XG5cbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBhcHBXaW5kb3cuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xuXG4gICAgdG9wYmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGdyYWJFbGVtZW50KGFwcFdpbmRvdyk7XG4gICAgfSk7XG5cbiAgICBhcHBXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlRWxlbWVudCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgcmVsZWFzZUVsZW1lbnQpO1xuXG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgbGFzdEluZGV4ICs9IDE7XG4gICAgICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgfSk7XG5cbiAgICB0b3BiYXIucXVlcnlTZWxlY3RvcihcIi5jbG9zZVdpbmRvd0J1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGFwcFdpbmRvdy5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBhcHBXaW5kb3c7XG59XG5cbm1vZHVsZS5leHBvcnRzLmNyZWF0ZVdpbmRvdyA9IGNyZWF0ZVdpbmRvdztcbiJdfQ==
