(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var buttonCreateWindow = document.querySelector("#buttonCreateWindow");
var lastIndex = 0;

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
    var offsetX;
    var offsetY;
    var newPositionX;
    var newPositionY;

    addTemplate("#appWindowTemplate", "body");

    topbars = document.querySelectorAll(".topbar");
    appWindows = document.querySelectorAll(".appWindow");

    topbar = topbars[topbars.length - 1];
    appWindow = appWindows[appWindows.length - 1];


    topbar.querySelector(".closeWindowButton").addEventListener("click", function() {
        appWindow.remove();
    });

    topbar.addEventListener("mousedown", function pressMouseButton(event) {
        event.stopPropagation();
        offsetX = event.offsetX;
        offsetY = event.offsetY;

        document.addEventListener("mouseup", function releaseMouseButton(event) {
            newPositionX = event.clientX;
            newPositionY = event.clientY;

            appWindow.style.left = newPositionX - (offsetX + 2);
            appWindow.style.top = newPositionY - (offsetY + 2);

            lastIndex += 1;
            appWindow.style.zIndex = lastIndex;

            document.removeEventListener("mouseup", releaseMouseButton);
        });
    });

    appWindow.addEventListener("click", function(event) {
        event.stopPropagation();
        lastIndex += 1;
        appWindow.style.zIndex = lastIndex;
    });
}

function closeWindow() {

}

buttonCreateWindow.addEventListener("click", printWindow);


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGJ1dHRvbkNyZWF0ZVdpbmRvdyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYnV0dG9uQ3JlYXRlV2luZG93XCIpO1xudmFyIGxhc3RJbmRleCA9IDA7XG5cbmZ1bmN0aW9uIGFkZFRlbXBsYXRlKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgIHZhciBjb250YWluZXI7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBmb3JtO1xuXG4gICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcihjb250YWluZXJOYW1lKTtcbiAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodGVtcGxhdGVOYW1lKTtcbiAgICBmb3JtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG59XG5cbmZ1bmN0aW9uIHByaW50V2luZG93KCkge1xuICAgIHZhciB0b3BiYXJzO1xuICAgIHZhciBhcHBXaW5kb3dzO1xuICAgIHZhciB0b3BiYXI7XG4gICAgdmFyIGFwcFdpbmRvdztcbiAgICB2YXIgb2Zmc2V0WDtcbiAgICB2YXIgb2Zmc2V0WTtcbiAgICB2YXIgbmV3UG9zaXRpb25YO1xuICAgIHZhciBuZXdQb3NpdGlvblk7XG5cbiAgICBhZGRUZW1wbGF0ZShcIiNhcHBXaW5kb3dUZW1wbGF0ZVwiLCBcImJvZHlcIik7XG5cbiAgICB0b3BiYXJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50b3BiYXJcIik7XG4gICAgYXBwV2luZG93cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuYXBwV2luZG93XCIpO1xuXG4gICAgdG9wYmFyID0gdG9wYmFyc1t0b3BiYXJzLmxlbmd0aCAtIDFdO1xuICAgIGFwcFdpbmRvdyA9IGFwcFdpbmRvd3NbYXBwV2luZG93cy5sZW5ndGggLSAxXTtcblxuXG4gICAgdG9wYmFyLnF1ZXJ5U2VsZWN0b3IoXCIuY2xvc2VXaW5kb3dCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBhcHBXaW5kb3cucmVtb3ZlKCk7XG4gICAgfSk7XG5cbiAgICB0b3BiYXIuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCBmdW5jdGlvbiBwcmVzc01vdXNlQnV0dG9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBvZmZzZXRYID0gZXZlbnQub2Zmc2V0WDtcbiAgICAgICAgb2Zmc2V0WSA9IGV2ZW50Lm9mZnNldFk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24gcmVsZWFzZU1vdXNlQnV0dG9uKGV2ZW50KSB7XG4gICAgICAgICAgICBuZXdQb3NpdGlvblggPSBldmVudC5jbGllbnRYO1xuICAgICAgICAgICAgbmV3UG9zaXRpb25ZID0gZXZlbnQuY2xpZW50WTtcblxuICAgICAgICAgICAgYXBwV2luZG93LnN0eWxlLmxlZnQgPSBuZXdQb3NpdGlvblggLSAob2Zmc2V0WCArIDIpO1xuICAgICAgICAgICAgYXBwV2luZG93LnN0eWxlLnRvcCA9IG5ld1Bvc2l0aW9uWSAtIChvZmZzZXRZICsgMik7XG5cbiAgICAgICAgICAgIGxhc3RJbmRleCArPSAxO1xuICAgICAgICAgICAgYXBwV2luZG93LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcblxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgcmVsZWFzZU1vdXNlQnV0dG9uKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhcHBXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBsYXN0SW5kZXggKz0gMTtcbiAgICAgICAgYXBwV2luZG93LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY2xvc2VXaW5kb3coKSB7XG5cbn1cblxuYnV0dG9uQ3JlYXRlV2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBwcmludFdpbmRvdyk7XG5cbiJdfQ==
