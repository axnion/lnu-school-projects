(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ajax = require("./ajax");

var ajaxConfig;
var response;
var newURL;

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
        _this.playQuiz();
    });
};

Quiz.prototype.addTemplate = function(templateName) {
    var formContainer = document.querySelector("#formContainer");
    var template = document.querySelector("#" + templateName);
    var form = document.importNode(template.content, true);

    formContainer.appendChild(form);
};

Quiz.prototype.playQuiz = function() {
    this.getQuestion();
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
    } else {
        this.addTemplate("textAnswerTemplate");
        form = document.querySelector("#textAnswerForm");
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        if (response.alternatives) {
            var buttons = form.children;
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
};

Quiz.prototype.printQuestion = function() {
    var div = document.querySelector("#questionContainer");
    var p = div.firstElementChild;
    var question = response.question;
    var alt = response.alternatives;

    if (alt) {
        p.textContent = question + "\n Alt1: " + alt.alt1 + "\n Alt2: " + alt.alt2 + "\n Alt3: " + alt.alt3 + "\n Alt4: " + alt.alt4;
    } else {
        p.textContent = question;
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUXVpei5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG5cbnZhciBhamF4Q29uZmlnO1xudmFyIHJlc3BvbnNlO1xudmFyIG5ld1VSTDtcblxuZnVuY3Rpb24gUXVpeigpIHtcbiAgICB0aGlzLm5pY2tuYW1lID0gdGhpcy5nZXROaWNrbmFtZSgpO1xufVxuXG5RdWl6LnByb3RvdHlwZS5nZXROaWNrbmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWRkVGVtcGxhdGUoXCJuaWNrbmFtZVRlbXBsYXRlXCIpO1xuICAgIHZhciBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuaWNrbmFtZUZvcm1cIik7XG4gICAgdmFyIG5pY2tuYW1lO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgbmlja25hbWUgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgICAgICBfdGhpcy5wbGF5UXVpeigpO1xuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUuYWRkVGVtcGxhdGUgPSBmdW5jdGlvbih0ZW1wbGF0ZU5hbWUpIHtcbiAgICB2YXIgZm9ybUNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm9ybUNvbnRhaW5lclwiKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGVtcGxhdGVOYW1lKTtcbiAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgICBmb3JtQ29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xufTtcblxuUXVpei5wcm90b3R5cGUucGxheVF1aXogPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmdldFF1ZXN0aW9uKCk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIGFqYXhDb25maWcgPSB7XG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgdXJsOiBuZXdVUkwgfHwgXCJodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xXCJcbiAgICB9O1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBhamF4LnJlcXVlc3QoYWpheENvbmZpZywgZnVuY3Rpb24oZXJyb3IsIGRhdGEpIHtcbiAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICBuZXdVUkwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICBfdGhpcy5wcmludFF1ZXN0aW9uKCk7XG4gICAgICAgIF90aGlzLnBvc3RBbnN3ZXIoKTtcblxuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUucG9zdEFuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyIG15QW5zd2VyO1xuICAgIHZhciBhbnN3ZXIgPSB7fTtcbiAgICB2YXIgZm9ybTtcblxuICAgIGlmIChyZXNwb25zZS5hbHRlcm5hdGl2ZXMpIHtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImFsdGVybmF0aXZlQW5zd2VyVGVtcGxhdGVcIik7XG4gICAgICAgIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FsdGVybmF0aXZlQW5zd2VyRm9ybVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwidGV4dEFuc3dlclRlbXBsYXRlXCIpO1xuICAgICAgICBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0ZXh0QW5zd2VyRm9ybVwiKTtcbiAgICB9XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAocmVzcG9uc2UuYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgICAgICB2YXIgYnV0dG9ucyA9IGZvcm0uY2hpbGRyZW47XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoIC0gMTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJ1dHRvbnNbaV0uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICBteUFuc3dlciA9IGJ1dHRvbnNbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbXlBbnN3ZXIgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgYW5zd2VyID0ge1xuICAgICAgICAgICAgYW5zd2VyOiBteUFuc3dlclxuICAgICAgICB9O1xuXG4gICAgICAgIGFqYXhDb25maWcgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBuZXdVUkwsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBhbnN3ZXI6IEpTT04uc3RyaW5naWZ5KGFuc3dlcilcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zb2xlLmxvZyhhamF4Q29uZmlnKTtcbiAgICAgICAgYWpheC5yZXF1ZXN0KGFqYXhDb25maWcsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICBuZXdVUkwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICAgICAgX3RoaXMuZ2V0UXVlc3Rpb24oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICB9KTtcbn07XG5cblF1aXoucHJvdG90eXBlLnByaW50UXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNxdWVzdGlvbkNvbnRhaW5lclwiKTtcbiAgICB2YXIgcCA9IGRpdi5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICB2YXIgcXVlc3Rpb24gPSByZXNwb25zZS5xdWVzdGlvbjtcbiAgICB2YXIgYWx0ID0gcmVzcG9uc2UuYWx0ZXJuYXRpdmVzO1xuXG4gICAgaWYgKGFsdCkge1xuICAgICAgICBwLnRleHRDb250ZW50ID0gcXVlc3Rpb24gKyBcIlxcbiBBbHQxOiBcIiArIGFsdC5hbHQxICsgXCJcXG4gQWx0MjogXCIgKyBhbHQuYWx0MiArIFwiXFxuIEFsdDM6IFwiICsgYWx0LmFsdDMgKyBcIlxcbiBBbHQ0OiBcIiArIGFsdC5hbHQ0O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHAudGV4dENvbnRlbnQgPSBxdWVzdGlvbjtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1aXo7XG4iLCJmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZywgY2FsbGJhY2spIHtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXEucmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcblxuICAgIHJlcS5vcGVuKGNvbmZpZy5tZXRob2QsIGNvbmZpZy51cmwpO1xuICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIGNvbmZpZy5jb250ZW50VHlwZSk7XG4gICAgcmVxLnNlbmQoY29uZmlnLmFuc3dlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuIiwidmFyIFF1aXogPSByZXF1aXJlKFwiLi9RdWl6XCIpO1xuXG52YXIgdGVzdCA9IG5ldyBRdWl6KCk7XG4iXX0=
