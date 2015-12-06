(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ajax = require("./ajax");

var ajaxConfig;
var response;
var newURL;
var time = 0;
var timerInterval;

function Quiz() {
    this.nickname = this.getNickname();
}

Quiz.prototype.getNickname = function() {
    this.addTemplate("nicknameTemplate");
    var form = document.querySelector("#nicknameForm");
    var nickname;
    var _this = this;

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        nickname = form.firstElementChild.value;
        form.remove();
        _this.getQuestion();
    });
};

Quiz.prototype.addTemplate = function(templateName) {
    var formContainer = document.querySelector("#formContainer");
    var template = document.querySelector("#" + templateName);
    var form = document.importNode(template.content, true);

    formContainer.appendChild(form);
};

Quiz.prototype.getQuestion = function() {
    ajaxConfig = {
        method: "GET",
        url: newURL || "http://vhost3.lnu.se:20080/question/1"
    };
    var _this = this;

    ajax.request(ajaxConfig, function(error, data) {
        response = JSON.parse(data);
        newURL = response.nextURL;
        _this.printQuestion();
        _this.postAnswer();
    });
};

Quiz.prototype.postAnswer = function() {
    var _this = this;
    var myAnswer;
    var answer = {};
    var form;

    if (response.alternatives) {
        this.addTemplate("alternativeAnswerTemplate");
        form = document.querySelector("#alternativeAnswerForm");
        this.printAlternatives();
    } else {
        this.addTemplate("textAnswerTemplate");
        form = document.querySelector("#textAnswerForm");
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        _this.stopTimer();

        if (response.alternatives) {
            var buttons = form.querySelectorAll("input");
            for (var i = 0; i < buttons.length - 1; i += 1) {
                if (buttons[i].checked) {
                    myAnswer = buttons[i].value;
                }
            }
        } else {
            myAnswer = form.firstElementChild.value;
        }

        answer = {
            answer: myAnswer
        };

        ajaxConfig = {
            method: "POST",
            url: newURL,
            contentType: "application/json",
            answer: JSON.stringify(answer)
        };

        console.log(ajaxConfig);
        ajax.request(ajaxConfig, function(error, data) {
            response = JSON.parse(data);
            newURL = response.nextURL;
            _this.getQuestion();
        });

        form.remove();
    });

    this.startTimer();
};

Quiz.prototype.startTimer = function() {
    time = 20;
    timerInterval = window.setInterval(this.updateTimer, 100);
};

Quiz.prototype.stopTimer = function() {
    window.clearInterval(timerInterval);
};

Quiz.prototype.updateTimer = function() {
    var timer = document.querySelector("#time");
    time -= 0.1;
    timer.textContent = time.toFixed(1);
};

Quiz.prototype.printQuestion = function() {
    var div = document.querySelector("#questionContainer");
    var p = div.firstElementChild;
    var question = response.question;
    p.textContent = question;
};

Quiz.prototype.printAlternatives = function() {
    var form = document.querySelector("#alternativeAnswerForm");
    var lables = form.querySelectorAll("lable");
    var alternatives = response.alternatives;
    var textNode;

    textNode = document.createTextNode(alternatives.alt1);
    lables[0].appendChild(textNode);
    textNode = document.createTextNode(alternatives.alt2);
    lables[1].appendChild(textNode);
    textNode = document.createTextNode(alternatives.alt3);
    lables[2].appendChild(textNode);
    textNode = document.createTextNode(alternatives.alt4);
    lables[3].appendChild(textNode);
};

module.exports = Quiz;

},{"./ajax":2}],2:[function(require,module,exports){
function request(config, callback) {
    var req = new XMLHttpRequest();

    req.addEventListener("load", function() {
        event.stopPropagation();

        console.log(req.responseText);
        callback(null, req.responseText);
    });

    req.open(config.method, config.url);
    req.setRequestHeader("Content-type", config.contentType);
    req.send(config.answer);
}

module.exports.request = request;

},{}],3:[function(require,module,exports){
var Quiz = require("./Quiz");

var test = new Quiz();

},{"./Quiz":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUXVpei5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG5cbnZhciBhamF4Q29uZmlnO1xudmFyIHJlc3BvbnNlO1xudmFyIG5ld1VSTDtcbnZhciB0aW1lID0gMDtcbnZhciB0aW1lckludGVydmFsO1xuXG5mdW5jdGlvbiBRdWl6KCkge1xuICAgIHRoaXMubmlja25hbWUgPSB0aGlzLmdldE5pY2tuYW1lKCk7XG59XG5cblF1aXoucHJvdG90eXBlLmdldE5pY2tuYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5hZGRUZW1wbGF0ZShcIm5pY2tuYW1lVGVtcGxhdGVcIik7XG4gICAgdmFyIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25pY2tuYW1lRm9ybVwiKTtcbiAgICB2YXIgbmlja25hbWU7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBuaWNrbmFtZSA9IGZvcm0uZmlyc3RFbGVtZW50Q2hpbGQudmFsdWU7XG4gICAgICAgIGZvcm0ucmVtb3ZlKCk7XG4gICAgICAgIF90aGlzLmdldFF1ZXN0aW9uKCk7XG4gICAgfSk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5hZGRUZW1wbGF0ZSA9IGZ1bmN0aW9uKHRlbXBsYXRlTmFtZSkge1xuICAgIHZhciBmb3JtQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmb3JtQ29udGFpbmVyXCIpO1xuICAgIHZhciB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0ZW1wbGF0ZU5hbWUpO1xuICAgIHZhciBmb3JtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcblxuICAgIGZvcm1Db250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIGFqYXhDb25maWcgPSB7XG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgdXJsOiBuZXdVUkwgfHwgXCJodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xXCJcbiAgICB9O1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBhamF4LnJlcXVlc3QoYWpheENvbmZpZywgZnVuY3Rpb24oZXJyb3IsIGRhdGEpIHtcbiAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICBuZXdVUkwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICBfdGhpcy5wcmludFF1ZXN0aW9uKCk7XG4gICAgICAgIF90aGlzLnBvc3RBbnN3ZXIoKTtcbiAgICB9KTtcbn07XG5cblF1aXoucHJvdG90eXBlLnBvc3RBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBteUFuc3dlcjtcbiAgICB2YXIgYW5zd2VyID0ge307XG4gICAgdmFyIGZvcm07XG5cbiAgICBpZiAocmVzcG9uc2UuYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgIHRoaXMuYWRkVGVtcGxhdGUoXCJhbHRlcm5hdGl2ZUFuc3dlclRlbXBsYXRlXCIpO1xuICAgICAgICBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhbHRlcm5hdGl2ZUFuc3dlckZvcm1cIik7XG4gICAgICAgIHRoaXMucHJpbnRBbHRlcm5hdGl2ZXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwidGV4dEFuc3dlclRlbXBsYXRlXCIpO1xuICAgICAgICBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXh0QW5zd2VyRm9ybVwiKTtcbiAgICB9XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBfdGhpcy5zdG9wVGltZXIoKTtcblxuICAgICAgICBpZiAocmVzcG9uc2UuYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgICAgICB2YXIgYnV0dG9ucyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aCAtIDE7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGlmIChidXR0b25zW2ldLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbXlBbnN3ZXIgPSBidXR0b25zW2ldLnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG15QW5zd2VyID0gZm9ybS5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFuc3dlciA9IHtcbiAgICAgICAgICAgIGFuc3dlcjogbXlBbnN3ZXJcbiAgICAgICAgfTtcblxuICAgICAgICBhamF4Q29uZmlnID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHVybDogbmV3VVJMLFxuICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgYW5zd2VyOiBKU09OLnN0cmluZ2lmeShhbnN3ZXIpXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc29sZS5sb2coYWpheENvbmZpZyk7XG4gICAgICAgIGFqYXgucmVxdWVzdChhamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgbmV3VVJMID0gcmVzcG9uc2UubmV4dFVSTDtcbiAgICAgICAgICAgIF90aGlzLmdldFF1ZXN0aW9uKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvcm0ucmVtb3ZlKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnN0YXJ0VGltZXIoKTtcbn07XG5cblF1aXoucHJvdG90eXBlLnN0YXJ0VGltZXIgPSBmdW5jdGlvbigpIHtcbiAgICB0aW1lID0gMjA7XG4gICAgdGltZXJJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLnVwZGF0ZVRpbWVyLCAxMDApO1xufTtcblxuUXVpei5wcm90b3R5cGUuc3RvcFRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGltZXJJbnRlcnZhbCk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS51cGRhdGVUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aW1lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGltZVwiKTtcbiAgICB0aW1lIC09IDAuMTtcbiAgICB0aW1lci50ZXh0Q29udGVudCA9IHRpbWUudG9GaXhlZCgxKTtcbn07XG5cblF1aXoucHJvdG90eXBlLnByaW50UXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNxdWVzdGlvbkNvbnRhaW5lclwiKTtcbiAgICB2YXIgcCA9IGRpdi5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICB2YXIgcXVlc3Rpb24gPSByZXNwb25zZS5xdWVzdGlvbjtcbiAgICBwLnRleHRDb250ZW50ID0gcXVlc3Rpb247XG59O1xuXG5RdWl6LnByb3RvdHlwZS5wcmludEFsdGVybmF0aXZlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhbHRlcm5hdGl2ZUFuc3dlckZvcm1cIik7XG4gICAgdmFyIGxhYmxlcyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbChcImxhYmxlXCIpO1xuICAgIHZhciBhbHRlcm5hdGl2ZXMgPSByZXNwb25zZS5hbHRlcm5hdGl2ZXM7XG4gICAgdmFyIHRleHROb2RlO1xuXG4gICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0MSk7XG4gICAgbGFibGVzWzBdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQyKTtcbiAgICBsYWJsZXNbMV0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDMpO1xuICAgIGxhYmxlc1syXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0NCk7XG4gICAgbGFibGVzWzNdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUXVpejtcbiIsImZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnLCBjYWxsYmFjaykge1xuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgY29uc29sZS5sb2cocmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgIH0pO1xuXG4gICAgcmVxLm9wZW4oY29uZmlnLm1ldGhvZCwgY29uZmlnLnVybCk7XG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgY29uZmlnLmNvbnRlbnRUeXBlKTtcbiAgICByZXEuc2VuZChjb25maWcuYW5zd2VyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMucmVxdWVzdCA9IHJlcXVlc3Q7XG4iLCJ2YXIgUXVpeiA9IHJlcXVpcmUoXCIuL1F1aXpcIik7XG5cbnZhciB0ZXN0ID0gbmV3IFF1aXooKTtcbiJdfQ==
