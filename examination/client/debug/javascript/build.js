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

    form.addEventListener("submit", function submit(event) {
        nickname = form.firstElementChild.value;
        sessionStorage.setItem("nickname", nickname);
        event.preventDefault();
    });
};

Quiz.prototype.playQuiz = function() {

    this.getQuestion();
};

Quiz.prototype.getQuestion = function(url) {
    var getAjaxConfig = {
        method: "GET",
        url: url || "http://vhost3.lnu.se:20080/question/1"
    };

    var _this = this;

    ajax.request(getAjaxConfig, function(error, data) {
        var response = JSON.parse(data);
        _this.printQuestion(response.question);
        _this.postAnswer(response.nextURL);
    });
};

Quiz.prototype.postAnswer = function(url) {
    var answerContainer = document.querySelector("#answerContainer");
    var form = answerContainer.querySelector("form");

    var _this = this;
    var myAnswer;
    var answer = {};
    var postAjaxConfig = {};

    form.addEventListener("submit", function submit(event) {
        event.preventDefault();
        event.stopPropagation();

        myAnswer = form.firstElementChild.value;

        answer = {
            answer: myAnswer
        };

        postAjaxConfig = {
            method: "POST",
            url: url,
            contentType: "application/json",
            answer: JSON.stringify(answer)
        };

        debugger;
        ajax.request(postAjaxConfig, function(error, data) {
            if (error) {
                console.log("Network error");
            }

            var response = JSON.parse(data);
            console.log(response);
            _this.getQuestion(response.nextURL);
            form.firstElementChild.value = null;
        });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUXVpei5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG5cbmZ1bmN0aW9uIFF1aXooKSB7XG4gICAgaWYgKHNlc3Npb25TdG9yYWdlLmdldEl0ZW0oXCJuaWNrbmFtZVwiKSkge1xuICAgICAgICB0aGlzLm5pY2tuYW1lID0gc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShcIm5pY2tuYW1lXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuZ2V0Tmlja25hbWUoKTtcbiAgICB9XG59XG5cblF1aXoucHJvdG90eXBlLmdldE5pY2tuYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5pY2tDb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25pY2tuYW1lQ29udGFpbmVyXCIpO1xuICAgIHZhciBmb3JtID0gbmlja0NvbnRhaW5lci5xdWVyeVNlbGVjdG9yKFwiZm9ybVwiKTtcblxuICAgIHZhciBuaWNrbmFtZTtcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbiBzdWJtaXQoZXZlbnQpIHtcbiAgICAgICAgbmlja25hbWUgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwibmlja25hbWVcIiwgbmlja25hbWUpO1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUucGxheVF1aXogPSBmdW5jdGlvbigpIHtcblxuICAgIHRoaXMuZ2V0UXVlc3Rpb24oKTtcbn07XG5cblF1aXoucHJvdG90eXBlLmdldFF1ZXN0aW9uID0gZnVuY3Rpb24odXJsKSB7XG4gICAgdmFyIGdldEFqYXhDb25maWcgPSB7XG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgdXJsOiB1cmwgfHwgXCJodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xXCJcbiAgICB9O1xuXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGFqYXgucmVxdWVzdChnZXRBamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICBfdGhpcy5wcmludFF1ZXN0aW9uKHJlc3BvbnNlLnF1ZXN0aW9uKTtcbiAgICAgICAgX3RoaXMucG9zdEFuc3dlcihyZXNwb25zZS5uZXh0VVJMKTtcbiAgICB9KTtcbn07XG5cblF1aXoucHJvdG90eXBlLnBvc3RBbnN3ZXIgPSBmdW5jdGlvbih1cmwpIHtcbiAgICB2YXIgYW5zd2VyQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhbnN3ZXJDb250YWluZXJcIik7XG4gICAgdmFyIGZvcm0gPSBhbnN3ZXJDb250YWluZXIucXVlcnlTZWxlY3RvcihcImZvcm1cIik7XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBteUFuc3dlcjtcbiAgICB2YXIgYW5zd2VyID0ge307XG4gICAgdmFyIHBvc3RBamF4Q29uZmlnID0ge307XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24gc3VibWl0KGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIG15QW5zd2VyID0gZm9ybS5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcblxuICAgICAgICBhbnN3ZXIgPSB7XG4gICAgICAgICAgICBhbnN3ZXI6IG15QW5zd2VyXG4gICAgICAgIH07XG5cbiAgICAgICAgcG9zdEFqYXhDb25maWcgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiB1cmwsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBhbnN3ZXI6IEpTT04uc3RyaW5naWZ5KGFuc3dlcilcbiAgICAgICAgfTtcblxuICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgYWpheC5yZXF1ZXN0KHBvc3RBamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJOZXR3b3JrIGVycm9yXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzcG9uc2UpO1xuICAgICAgICAgICAgX3RoaXMuZ2V0UXVlc3Rpb24ocmVzcG9uc2UubmV4dFVSTCk7XG4gICAgICAgICAgICBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlID0gbnVsbDtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5wcmludFF1ZXN0aW9uID0gZnVuY3Rpb24ocXVlc3Rpb24pIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNxdWVzdGlvbkNvbnRhaW5lclwiKTtcbiAgICB2YXIgcCA9IGRpdi5maXJzdEVsZW1lbnRDaGlsZDtcblxuICAgIHAudGV4dENvbnRlbnQgPSBxdWVzdGlvbjtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUXVpejtcbiIsImZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnLCBjYWxsYmFjaykge1xuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHJlcS5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXEuc3RhdHVzKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgIH0pO1xuXG4gICAgcmVxLm9wZW4oY29uZmlnLm1ldGhvZCwgY29uZmlnLnVybCk7XG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgY29uZmlnLmNvbnRlbnRUeXBlKTtcbiAgICByZXEuc2VuZChjb25maWcuYW5zd2VyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMucmVxdWVzdCA9IHJlcXVlc3Q7XG4iLCJ2YXIgUXVpeiA9IHJlcXVpcmUoXCIuL1F1aXpcIik7XG5cbnZhciB0ZXN0ID0gbmV3IFF1aXooKTtcblxudGVzdC5wbGF5UXVpeigpO1xuXG4iXX0=
