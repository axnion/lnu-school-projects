(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var appWindow = require("./appWindow");
var buttonCreateWindow = document.querySelector("#buttonCreateWindow");
buttonCreateWindow.addEventListener("click", appWindow.printWindow);


},{"./appWindow":2}],2:[function(require,module,exports){
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

function printWindow() {
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
}

module.exports.printWindow = printWindow;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHBXaW5kb3cuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFwcFdpbmRvdyA9IHJlcXVpcmUoXCIuL2FwcFdpbmRvd1wiKTtcbnZhciBidXR0b25DcmVhdGVXaW5kb3cgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2J1dHRvbkNyZWF0ZVdpbmRvd1wiKTtcbmJ1dHRvbkNyZWF0ZVdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXBwV2luZG93LnByaW50V2luZG93KTtcblxuIiwidmFyIGxhc3RJbmRleCA9IDA7XG52YXIgb2Zmc2V0WCA9IDA7XG52YXIgb2Zmc2V0WSA9IDA7XG52YXIgcG9zaXRpb25YID0gMDtcbnZhciBwb3NpdGlvblkgPSAwO1xudmFyIGVsZW1lbnQ7XG5cbmZ1bmN0aW9uIGdyYWJFbGVtZW50KHRhcmdldCkge1xuICAgIGVsZW1lbnQgPSB0YXJnZXQ7XG4gICAgb2Zmc2V0WCA9IHBvc2l0aW9uWCAtIGVsZW1lbnQub2Zmc2V0TGVmdDtcbiAgICBvZmZzZXRZID0gcG9zaXRpb25ZIC0gZWxlbWVudC5vZmZzZXRUb3A7XG4gICAgbGFzdEluZGV4ICs9IDE7XG4gICAgZWxlbWVudC5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG59XG5cbmZ1bmN0aW9uIG1vdmVFbGVtZW50KGV2ZW50KSB7XG4gICAgcG9zaXRpb25YID0gZXZlbnQuY2xpZW50WDtcbiAgICBwb3NpdGlvblkgPSBldmVudC5jbGllbnRZO1xuICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUubGVmdCA9IHBvc2l0aW9uWCAtIChvZmZzZXRYICsgMikgKyBcInB4XCI7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUudG9wID0gcG9zaXRpb25ZIC0gKG9mZnNldFkgKyAyKSArIFwicHhcIjtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbGVhc2VFbGVtZW50KCkge1xuICAgIGVsZW1lbnQgPSB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGFkZFRlbXBsYXRlKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgIHZhciBjb250YWluZXI7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBub2RlO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJOYW1lKTtcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGVtcGxhdGVOYW1lKTtcbiAgICBub2RlID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobm9kZSk7XG59XG5cbmZ1bmN0aW9uIHByaW50V2luZG93KCkge1xuICAgIHZhciB0b3BiYXI7XG4gICAgdmFyIGFwcFdpbmRvdztcblxuICAgIGFkZFRlbXBsYXRlKFwiI2FwcFdpbmRvd1RlbXBsYXRlXCIsIFwiYm9keVwiKTtcblxuICAgIGFwcFdpbmRvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXBwV2luZG93XCIpW2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXBwV2luZG93XCIpLmxlbmd0aCAtIDFdO1xuICAgIHRvcGJhciA9IGFwcFdpbmRvdy5xdWVyeVNlbGVjdG9yKFwiLnRvcGJhclwiKTtcblxuICAgIGxhc3RJbmRleCArPSAxO1xuICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG5cbiAgICB0b3BiYXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZ3JhYkVsZW1lbnQoYXBwV2luZG93KTtcbiAgICB9KTtcblxuICAgIGFwcFdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIG1vdmVFbGVtZW50KTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2V1cFwiLCByZWxlYXNlRWxlbWVudCk7XG5cbiAgICBhcHBXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBsYXN0SW5kZXggKz0gMTtcbiAgICAgICAgYXBwV2luZG93LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbiAgICB9KTtcblxuICAgIHRvcGJhci5xdWVyeVNlbGVjdG9yKFwiLmNsb3NlV2luZG93QnV0dG9uXCIpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgYXBwV2luZG93LnJlbW92ZSgpO1xuICAgIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5wcmludFdpbmRvdyA9IHByaW50V2luZG93O1xuIl19
