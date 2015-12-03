(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ajax = require("./ajax");



function Quiz() {
    if (sessionStorage.getItem("nickname")) {
        this.nickname = sessionStorage.getItem("nickname");
    } else {
        this.getNickname();
    }
}

Quiz.prototype.getNickname = function() {
    var nickContainer = document.querySelector("#nicknameContainer");
    var form = nickContainer.querySelector("form");

    var nickname;

    form.addEventListener("submit", function submit() {
        nickname = form.firstElementChild.value;
        sessionStorage.setItem("nickname", nickname);
    });
};

Quiz.prototype.playQuiz = function() {
    this.getQuestion("http://vhost3.lnu.se:20080/question/1");
    document.addEventListener();
    this.postAnswer(response.nextURL);
};

Quiz.prototype.getQuestion = function(url) {
    var getAjaxConfig = {
        method: "GET",
        url: url
    };

    var _this = this;

    ajax.request(getAjaxConfig, function(error, data) {
        var response = JSON.parse(data);
        _this.printQuestion(response.question);

    });
};

Quiz.prototype.postAnswer = function(url) {
    var answerContainer = document.querySelector("#answerContainer");
    var form = answerContainer.querySelector("form");

    var _this = this;

    form.addEventListener("submit", function submit(event) {

        var myAnswer = form.firstElementChild.value;
        form.firstElementChild.value = null;
        var answer = {
            answer: myAnswer
        };

        var postAjaxConfig = {
            method: "POST",
            url: url,
            contentType: "application/json",
            answer: JSON.stringify(answer)
        };

        ajax.request(postAjaxConfig, function(error, data) {
            if (error) {
                console.log("Network error");
            }

            var response = JSON.parse(data);
            _this.getQuestion(response.nextURL);
        });

        event.preventDefault();
    });
};

Quiz.prototype.printQuestion = function(question) {
    var div = document.querySelector("#questionContainer");
    var p = div.firstElementChild;

    p.textContent = question;
};

module.exports = Quiz;

},{"./ajax":2}],2:[function(require,module,exports){
function request(config, callback) {
    var req = new XMLHttpRequest();

    req.addEventListener("load", function() {
        if (req.status >= 400) {
            callback(req.status);
        }

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

test.playQuiz();


},{"./Quiz":1}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUXVpei5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFqYXggPSByZXF1aXJlKFwiLi9hamF4XCIpO1xuXG5cblxuZnVuY3Rpb24gUXVpeigpIHtcbiAgICBpZiAoc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcIm5pY2tuYW1lXCIpKSB7XG4gICAgICAgIHRoaXMubmlja25hbWUgPSBzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwibmlja25hbWVcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5nZXROaWNrbmFtZSgpO1xuICAgIH1cbn1cblxuUXVpei5wcm90b3R5cGUuZ2V0Tmlja25hbWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbmlja0NvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmlja25hbWVDb250YWluZXJcIik7XG4gICAgdmFyIGZvcm0gPSBuaWNrQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCJmb3JtXCIpO1xuXG4gICAgdmFyIG5pY2tuYW1lO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uIHN1Ym1pdCgpIHtcbiAgICAgICAgbmlja25hbWUgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwibmlja25hbWVcIiwgbmlja25hbWUpO1xuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUucGxheVF1aXogPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmdldFF1ZXN0aW9uKFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCk7XG4gICAgdGhpcy5wb3N0QW5zd2VyKHJlc3BvbnNlLm5leHRVUkwpO1xufTtcblxuUXVpei5wcm90b3R5cGUuZ2V0UXVlc3Rpb24gPSBmdW5jdGlvbih1cmwpIHtcbiAgICB2YXIgZ2V0QWpheENvbmZpZyA9IHtcbiAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICB1cmw6IHVybFxuICAgIH07XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgYWpheC5yZXF1ZXN0KGdldEFqYXhDb25maWcsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XG4gICAgICAgIHZhciByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIF90aGlzLnByaW50UXVlc3Rpb24ocmVzcG9uc2UucXVlc3Rpb24pO1xuXG4gICAgfSk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5wb3N0QW5zd2VyID0gZnVuY3Rpb24odXJsKSB7XG4gICAgdmFyIGFuc3dlckNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYW5zd2VyQ29udGFpbmVyXCIpO1xuICAgIHZhciBmb3JtID0gYW5zd2VyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCJmb3JtXCIpO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbiBzdWJtaXQoZXZlbnQpIHtcblxuICAgICAgICB2YXIgbXlBbnN3ZXIgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlID0gbnVsbDtcbiAgICAgICAgdmFyIGFuc3dlciA9IHtcbiAgICAgICAgICAgIGFuc3dlcjogbXlBbnN3ZXJcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgcG9zdEFqYXhDb25maWcgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBhbnN3ZXI6IEpTT04uc3RyaW5naWZ5KGFuc3dlcilcbiAgICAgICAgfTtcblxuICAgICAgICBhamF4LnJlcXVlc3QocG9zdEFqYXhDb25maWcsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk5ldHdvcmsgZXJyb3JcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICBfdGhpcy5nZXRRdWVzdGlvbihyZXNwb25zZS5uZXh0VVJMKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9KTtcbn07XG5cblF1aXoucHJvdG90eXBlLnByaW50UXVlc3Rpb24gPSBmdW5jdGlvbihxdWVzdGlvbikge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3F1ZXN0aW9uQ29udGFpbmVyXCIpO1xuICAgIHZhciBwID0gZGl2LmZpcnN0RWxlbWVudENoaWxkO1xuXG4gICAgcC50ZXh0Q29udGVudCA9IHF1ZXN0aW9uO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWl6O1xuIiwiZnVuY3Rpb24gcmVxdWVzdChjb25maWcsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcS5zdGF0dXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgfSk7XG5cbiAgICByZXEub3Blbihjb25maWcubWV0aG9kLCBjb25maWcudXJsKTtcbiAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBjb25maWcuY29udGVudFR5cGUpO1xuICAgIHJlcS5zZW5kKGNvbmZpZy5hbnN3ZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5yZXF1ZXN0ID0gcmVxdWVzdDtcbiIsInZhciBRdWl6ID0gcmVxdWlyZShcIi4vUXVpelwiKTtcblxudmFyIHRlc3QgPSBuZXcgUXVpeigpO1xuXG50ZXN0LnBsYXlRdWl6KCk7XG5cbiJdfQ==
