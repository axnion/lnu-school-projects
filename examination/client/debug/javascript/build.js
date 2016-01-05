(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGJ1dHRvbkNyZWF0ZVdpbmRvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYnV0dG9uQ3JlYXRlV2luZG93XCIpO1xudmFyIGxhc3RJbmRleCA9IDA7XG5cbnZhciBlbGVtZW50ID0gdW5kZWZpbmVkO1xudmFyIG9mZnNldFggPSAwO1xudmFyIG9mZnNldFkgPSAwO1xudmFyIHBvc2l0aW9uWCA9IDA7XG52YXIgcG9zaXRpb25ZID0gMDtcblxuZnVuY3Rpb24gZ3JhYkVsZW1lbnQodGFyZ2V0KSB7XG4gICAgZWxlbWVudCA9IHRhcmdldDtcbiAgICBvZmZzZXRYID0gcG9zaXRpb25YIC0gZWxlbWVudC5vZmZzZXRMZWZ0O1xuICAgIG9mZnNldFkgPSBwb3NpdGlvblkgLSBlbGVtZW50Lm9mZnNldFRvcDtcbiAgICBsYXN0SW5kZXggKz0gMTtcbiAgICBlbGVtZW50LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbn1cblxuZnVuY3Rpb24gbW92ZUVsZW1lbnQoZXZlbnQpIHtcbiAgICBwb3NpdGlvblggPSBldmVudC5jbGllbnRYO1xuICAgIHBvc2l0aW9uWSA9IGV2ZW50LmNsaWVudFk7XG4gICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5sZWZ0ID0gcG9zaXRpb25YIC0gKG9mZnNldFggKyAyKSArIFwicHhcIjtcbiAgICAgICAgZWxlbWVudC5zdHlsZS50b3AgPSBwb3NpdGlvblkgLSAob2Zmc2V0WSArIDIpICsgXCJweFwiO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVsZWFzZUVsZW1lbnQoKSB7XG4gICAgZWxlbWVudCA9IHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gYWRkVGVtcGxhdGUodGVtcGxhdGVOYW1lLCBjb250YWluZXJOYW1lKSB7XG4gICAgdmFyIGNvbnRhaW5lcjtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIGZvcm07XG5cbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lck5hbWUpO1xuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0ZW1wbGF0ZU5hbWUpO1xuICAgIGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcbn1cblxuZnVuY3Rpb24gcHJpbnRXaW5kb3coKSB7XG4gICAgdmFyIHRvcGJhcnM7XG4gICAgdmFyIGFwcFdpbmRvd3M7XG4gICAgdmFyIHRvcGJhcjtcbiAgICB2YXIgYXBwV2luZG93O1xuICAgIGFkZFRlbXBsYXRlKFwiI2FwcFdpbmRvd1RlbXBsYXRlXCIsIFwiYm9keVwiKTtcblxuICAgIHRvcGJhcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRvcGJhclwiKTtcbiAgICBhcHBXaW5kb3dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5hcHBXaW5kb3dcIik7XG5cbiAgICB0b3BiYXIgPSB0b3BiYXJzW3RvcGJhcnMubGVuZ3RoIC0gMV07XG4gICAgYXBwV2luZG93ID0gYXBwV2luZG93c1thcHBXaW5kb3dzLmxlbmd0aCAtIDFdO1xuICAgIGxhc3RJbmRleCArPSAxO1xuICAgIGFwcFdpbmRvdy5zdHlsZS56SW5kZXggPSBsYXN0SW5kZXg7XG4gICAgYXBwV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgbGFzdEluZGV4ICs9IDE7XG4gICAgICAgIGVsZW1lbnQuc3R5bGUuekluZGV4ID0gbGFzdEluZGV4O1xuICAgIH0pO1xuXG4gICAgdG9wYmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGdyYWJFbGVtZW50KGFwcFdpbmRvdyk7XG4gICAgfSk7XG5cbiAgICBhcHBXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBtb3ZlRWxlbWVudCk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgcmVsZWFzZUVsZW1lbnQpO1xuXG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VXaW5kb3dCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhcHBXaW5kb3cucmVtb3ZlKCk7XG4gICAgfSk7XG59XG5cbmJ1dHRvbkNyZWF0ZVdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgcHJpbnRXaW5kb3cpO1xuXG4iXX0=
