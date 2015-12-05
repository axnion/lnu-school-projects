(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ajax = require("./ajax");

var ajaxConfig;
var response;
var newURL;

function Quiz() {
    this.nickname = this.getNickname();
}

Quiz.prototype.getNickname = function() {
    var formContainer = document.querySelector("#formContainer");
    var template = document.querySelector("#nicknameTemplate");
    var form = document.importNode(template.content, true);
    formContainer.appendChild(form);
    formContainer.removeChild("form");
    var nickname;
    var _this = this;

    formContainer.addEventListener("submit", function(event) {
        nickname = form.firstElementChild.value;
        sessionStorage.setItem("nickname", nickname)
    });
};

Quiz.prototype.playQuiz = function() {
    if(!sessionStorage.getItem("nickname")) {
        ge
    }
    this.getQuestion();
    this.postAnswer();
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
        _this.printAnswers();
    });
};

Quiz.prototype.postAnswer = function() {
    var answerContainer = document.querySelector("#formContainer");
    var form = answerContainer.querySelector("form");
    var inputBox = form.firstElementChild;
    var _this = this;
    var myAnswer;
    var answer = {};

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        myAnswer = inputBox.value;
        inputBox.value = null;

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
    });
};

Quiz.prototype.printAnswers = function() {
    var formContainer = document.querySelector("#formContainer");
    var template;
    var form;

    if (response.alternatives) {
        template = document.querySelector("#alternativeAnswerTemplate");
    } else {
        template = document.querySelector("#textAnswerTemplate");
    }

    form = document.importNode(template.content, true);
    formContainer.appendChild(form);

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUXVpei5qcyIsImNsaWVudC9zb3VyY2UvanMvYWpheC5qcyIsImNsaWVudC9zb3VyY2UvanMvYXBwLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFqYXggPSByZXF1aXJlKFwiLi9hamF4XCIpO1xuXG52YXIgYWpheENvbmZpZztcbnZhciByZXNwb25zZTtcbnZhciBuZXdVUkw7XG5cbmZ1bmN0aW9uIFF1aXooKSB7XG4gICAgdGhpcy5uaWNrbmFtZSA9IHRoaXMuZ2V0Tmlja25hbWUoKTtcbn1cblxuUXVpei5wcm90b3R5cGUuZ2V0Tmlja25hbWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZm9ybUNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm9ybUNvbnRhaW5lclwiKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25pY2tuYW1lVGVtcGxhdGVcIik7XG4gICAgdmFyIGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGZvcm1Db250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG4gICAgZm9ybUNvbnRhaW5lci5yZW1vdmVDaGlsZChcImZvcm1cIik7XG4gICAgdmFyIG5pY2tuYW1lO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBmb3JtQ29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgbmlja25hbWUgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICBzZXNzaW9uU3RvcmFnZS5zZXRJdGVtKFwibmlja25hbWVcIiwgbmlja25hbWUpXG4gICAgfSk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5wbGF5UXVpeiA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKCFzZXNzaW9uU3RvcmFnZS5nZXRJdGVtKFwibmlja25hbWVcIikpIHtcbiAgICAgICAgZ2VcbiAgICB9XG4gICAgdGhpcy5nZXRRdWVzdGlvbigpO1xuICAgIHRoaXMucG9zdEFuc3dlcigpO1xufTtcblxuUXVpei5wcm90b3R5cGUuZ2V0UXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICBhamF4Q29uZmlnID0ge1xuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIHVybDogbmV3VVJMIHx8IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiXG4gICAgfTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgYWpheC5yZXF1ZXN0KGFqYXhDb25maWcsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XG4gICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgbmV3VVJMID0gcmVzcG9uc2UubmV4dFVSTDtcbiAgICAgICAgX3RoaXMucHJpbnRRdWVzdGlvbigpO1xuICAgICAgICBfdGhpcy5wcmludEFuc3dlcnMoKTtcbiAgICB9KTtcbn07XG5cblF1aXoucHJvdG90eXBlLnBvc3RBbnN3ZXIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYW5zd2VyQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNmb3JtQ29udGFpbmVyXCIpO1xuICAgIHZhciBmb3JtID0gYW5zd2VyQ29udGFpbmVyLnF1ZXJ5U2VsZWN0b3IoXCJmb3JtXCIpO1xuICAgIHZhciBpbnB1dEJveCA9IGZvcm0uZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgbXlBbnN3ZXI7XG4gICAgdmFyIGFuc3dlciA9IHt9O1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgbXlBbnN3ZXIgPSBpbnB1dEJveC52YWx1ZTtcbiAgICAgICAgaW5wdXRCb3gudmFsdWUgPSBudWxsO1xuXG4gICAgICAgIGFuc3dlciA9IHtcbiAgICAgICAgICAgIGFuc3dlcjogbXlBbnN3ZXJcbiAgICAgICAgfTtcblxuICAgICAgICBhamF4Q29uZmlnID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHVybDogbmV3VVJMLFxuICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgYW5zd2VyOiBKU09OLnN0cmluZ2lmeShhbnN3ZXIpXG4gICAgICAgIH07XG5cbiAgICAgICAgY29uc29sZS5sb2coYWpheENvbmZpZyk7XG4gICAgICAgIGFqYXgucmVxdWVzdChhamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgbmV3VVJMID0gcmVzcG9uc2UubmV4dFVSTDtcbiAgICAgICAgICAgIF90aGlzLmdldFF1ZXN0aW9uKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUucHJpbnRBbnN3ZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZvcm1Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Zvcm1Db250YWluZXJcIik7XG4gICAgdmFyIHRlbXBsYXRlO1xuICAgIHZhciBmb3JtO1xuXG4gICAgaWYgKHJlc3BvbnNlLmFsdGVybmF0aXZlcykge1xuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYWx0ZXJuYXRpdmVBbnN3ZXJUZW1wbGF0ZVwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dEFuc3dlclRlbXBsYXRlXCIpO1xuICAgIH1cblxuICAgIGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGZvcm1Db250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG5cbn07XG5cblF1aXoucHJvdG90eXBlLnByaW50UXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNxdWVzdGlvbkNvbnRhaW5lclwiKTtcbiAgICB2YXIgcCA9IGRpdi5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICB2YXIgcXVlc3Rpb24gPSByZXNwb25zZS5xdWVzdGlvbjtcbiAgICB2YXIgYWx0ID0gcmVzcG9uc2UuYWx0ZXJuYXRpdmVzO1xuXG4gICAgaWYgKGFsdCkge1xuICAgICAgICBwLnRleHRDb250ZW50ID0gcXVlc3Rpb24gKyBcIlxcbiBBbHQxOiBcIiArIGFsdC5hbHQxICsgXCJcXG4gQWx0MjogXCIgKyBhbHQuYWx0MiArIFwiXFxuIEFsdDM6IFwiICsgYWx0LmFsdDMgKyBcIlxcbiBBbHQ0OiBcIiArIGFsdC5hbHQ0O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHAudGV4dENvbnRlbnQgPSBxdWVzdGlvbjtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1aXo7XG4iLCJmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZywgY2FsbGJhY2spIHtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXEucmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcblxuICAgIHJlcS5vcGVuKGNvbmZpZy5tZXRob2QsIGNvbmZpZy51cmwpO1xuICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIGNvbmZpZy5jb250ZW50VHlwZSk7XG4gICAgcmVxLnNlbmQoY29uZmlnLmFuc3dlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuIiwidmFyIFF1aXogPSByZXF1aXJlKFwiLi9RdWl6XCIpO1xuXG52YXIgdGVzdCA9IG5ldyBRdWl6KCk7XG4iXX0=
