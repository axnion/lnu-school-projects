(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var button = document.querySelector("#button");
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
    var i;

    addTemplate("#appWindowTemplate", "body");

    topbars = document.querySelectorAll(".topbar");
    appWindows = document.querySelectorAll(".appWindow");

    topbar = topbars[topbars.length - 1];
    appWindow = appWindows[appWindows.length - 1];

    topbar.addEventListener("mousedown", function pressMouseButton(event) {
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

    appWindow.addEventListener("click", function() {
        lastIndex += 1;
        appWindow.style.zIndex = lastIndex;
    });
}

button.addEventListener("click", printWindow);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMy4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNidXR0b25cIik7XG52YXIgbGFzdEluZGV4ID0gMDtcblxuZnVuY3Rpb24gYWRkVGVtcGxhdGUodGVtcGxhdGVOYW1lLCBjb250YWluZXJOYW1lKSB7XG4gICAgdmFyIGNvbnRhaW5lcjtcbiAgICB2YXIgdGVtcGxhdGU7XG4gICAgdmFyIGZvcm07XG5cbiAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGNvbnRhaW5lck5hbWUpO1xuICAgIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0ZW1wbGF0ZU5hbWUpO1xuICAgIGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcbn1cblxuZnVuY3Rpb24gcHJpbnRXaW5kb3coKSB7XG4gICAgdmFyIHRvcGJhcnM7XG4gICAgdmFyIGFwcFdpbmRvd3M7XG4gICAgdmFyIHRvcGJhcjtcbiAgICB2YXIgYXBwV2luZG93O1xuICAgIHZhciBvZmZzZXRYO1xuICAgIHZhciBvZmZzZXRZO1xuICAgIHZhciBuZXdQb3NpdGlvblg7XG4gICAgdmFyIG5ld1Bvc2l0aW9uWTtcbiAgICB2YXIgaTtcblxuICAgIGFkZFRlbXBsYXRlKFwiI2FwcFdpbmRvd1RlbXBsYXRlXCIsIFwiYm9keVwiKTtcblxuICAgIHRvcGJhcnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRvcGJhclwiKTtcbiAgICBhcHBXaW5kb3dzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5hcHBXaW5kb3dcIik7XG5cbiAgICB0b3BiYXIgPSB0b3BiYXJzW3RvcGJhcnMubGVuZ3RoIC0gMV07XG4gICAgYXBwV2luZG93ID0gYXBwV2luZG93c1thcHBXaW5kb3dzLmxlbmd0aCAtIDFdO1xuXG4gICAgdG9wYmFyLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgZnVuY3Rpb24gcHJlc3NNb3VzZUJ1dHRvbihldmVudCkge1xuICAgICAgICBvZmZzZXRYID0gZXZlbnQub2Zmc2V0WDtcbiAgICAgICAgb2Zmc2V0WSA9IGV2ZW50Lm9mZnNldFk7XG5cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgZnVuY3Rpb24gcmVsZWFzZU1vdXNlQnV0dG9uKGV2ZW50KSB7XG4gICAgICAgICAgICBuZXdQb3NpdGlvblggPSBldmVudC5jbGllbnRYO1xuICAgICAgICAgICAgbmV3UG9zaXRpb25ZID0gZXZlbnQuY2xpZW50WTtcblxuICAgICAgICAgICAgYXBwV2luZG93LnN0eWxlLmxlZnQgPSBuZXdQb3NpdGlvblggLSAob2Zmc2V0WCArIDIpO1xuICAgICAgICAgICAgYXBwV2luZG93LnN0eWxlLnRvcCA9IG5ld1Bvc2l0aW9uWSAtIChvZmZzZXRZICsgMik7XG5cbiAgICAgICAgICAgIGxhc3RJbmRleCArPSAxO1xuICAgICAgICAgICAgYXBwV2luZG93LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcblxuICAgICAgICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIiwgcmVsZWFzZU1vdXNlQnV0dG9uKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBhcHBXaW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsYXN0SW5kZXggKz0gMTtcbiAgICAgICAgYXBwV2luZG93LnN0eWxlLnpJbmRleCA9IGxhc3RJbmRleDtcbiAgICB9KTtcbn1cblxuYnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBwcmludFdpbmRvdyk7XG4iXX0=
