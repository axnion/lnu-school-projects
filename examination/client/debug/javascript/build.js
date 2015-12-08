(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Print() {
    this.question = function(question) {
        var container;
        var paragraph;

        container = document.querySelector("#questionContainer");
        paragraph = container.firstElementChild;
        paragraph.textContent = question;
    };

    this.answer = function(alternatives) {
        var form;
        var lables;
        var textNode;

        if (alternatives) {

            this.addTemplate("alternativeAnswerTemplate", "formContainer");
            form = document.querySelector("#alternativeAnswerForm");
            lables = form.querySelectorAll("lable");

            textNode = document.createTextNode(alternatives.alt1);
            lables[0].appendChild(textNode);
            textNode = document.createTextNode(alternatives.alt2);
            lables[1].appendChild(textNode);
            textNode = document.createTextNode(alternatives.alt3);
            lables[2].appendChild(textNode);
            textNode = document.createTextNode(alternatives.alt4);
            lables[3].appendChild(textNode);
        } else {
            this.addTemplate("textAnswerTemplate", "formContainer");
            form = document.querySelector("#textAnswerForm");
        }

        return form;
    };

    this.nicknameForm = function() {
        this.addTemplate("nicknameTemplate", "formContainer");
        return document.querySelector("#nicknameForm");
    };

    this.gameWon = function() {
        var highScore;
        var scoreBoard;
        var paragraphs;
        var str;
        var textNode;
        var i;

        this.addTemplate("gameWonTemplate", "formContainer");
        highScore = JSON.parse(localStorage.getItem("highScore"));
        scoreBoard = document.querySelector("#scoreBoard");
        paragraphs = scoreBoard.querySelectorAll("p");

        for (i = 0; i < highScore.length; i += 1) {
            str = (i + 1) + ". ";
            str += "Name: " + highScore[i].nickname + " ";
            str += "Time: " + highScore[i].time;
            textNode = document.createTextNode(str);
            paragraphs[i].appendChild(textNode);
        }
    };

    this.gameLost = function(message) {
        var container;
        var paragraph;
        var textNode;

        this.addTemplate("gameLostTemplate", "formContainer");
        container = document.querySelector("#formContainer");
        paragraph = document.querySelector("#message");
        textNode = document.createTextNode(message);
        container.firstElementChild.remove();
        paragraph.appendChild(textNode);
    };

    this.addTemplate = function(templateName, containerName) {
        var container;
        var template;
        var form;

        container = document.querySelector("#" + containerName);
        template = document.querySelector("#" + templateName);
        form = document.importNode(template.content, true);

        container.appendChild(form);
    };
}

module.exports = Print;

},{}],2:[function(require,module,exports){
var ajax = require("./ajax");
var Timer = require("./Timer");
var Print = require("./Print");

function Quiz() {
    var _this = this;
    this.print = new Print();
    this.timer = new Timer(function() {
        _this.print.gameLost("You ran out of time");
    });

    this.nickname = this.getNickname();
}

Quiz.prototype.getNickname = function() {
    var _this = this;
    var form;
    var message;

    form = this.print.nicknameForm();
    message = document.querySelector("#nickMessage"); //TODO Kom på något bra sätt att lösa detta

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        _this.nickname = form.firstElementChild.value;
        if (_this.nickname) {
            message.remove();
            form.remove();
            _this.getQuestion();
        } else {
            message.textContent = "Please write your nickname";
        }
    });
};

Quiz.prototype.getQuestion = function(newURL) {
    var _this = this;
    var ajaxConfig;
    var response;

    ajaxConfig = {
        method: "GET",
        url: newURL || "http://vhost3.lnu.se:20080/question/1"
    };

    ajax.request(ajaxConfig, function(error, data) {
        response = JSON.parse(data);
        _this.print.question(response.question);
        _this.postAnswer(response.nextURL, response.alternatives);
        _this.timer.startTimer();
    });
};

Quiz.prototype.postAnswer = function(newURL, alternatives) {
    var _this = this;
    var answer;
    var form;
    var ajaxConfig;

    form = this.print.answer(alternatives);

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        _this.timer.stopTimer();

        answer = _this.getAnswer(alternatives, form);

        ajaxConfig = {
            method: "POST",
            url: newURL,
            contentType: "application/json",
            answer: JSON.stringify(answer)
        };

        ajax.request(ajaxConfig, function(error, data) {
            _this.analyzeResponse(error, JSON.parse(data));
        });

        form.remove();
    });
};

Quiz.prototype.getAnswer = function(alternatives, form) {
    var answer;
    var answerObj;
    var buttons;
    var i;

    if (alternatives) {
        buttons = form.querySelectorAll("input");
        for (i = 0; i < buttons.length - 1; i += 1) {
            if (buttons[i].checked) {
                answer = buttons[i].value;
            }
        }
    } else {
        answer = form.firstElementChild.value;
    }

    answerObj = {
        answer: answer
    };

    return answerObj;
};

Quiz.prototype.analyzeResponse = function(error, response) {
    if (error) {
        if (response.message) {
            this.print.gameLost(response.message);
        } else {
            throw new Error ("Network error " + error);
        }

    } else {
        if (response.nextURL) {
            this.getQuestion(response.nextURL);
        } else {
            this.saveHighscore();
            this.print.gameWon();
        }
    }
};

Quiz.prototype.saveHighscore = function() {
    var time;
    var name;
    var highScore;
    var i;
    var j;

    time = this.timer.getTotalTime();
    name = this.nickname;
    highScore = JSON.parse(localStorage.getItem("highscore"));
    if (!highScore) {
        highScore = [
            {nickname: "", time: ""},
            {nickname: "", time: ""},
            {nickname: "", time: ""},
            {nickname: "", time: ""},
            {nickname: "", time: ""}
        ];
        highScore[0].nickname = name;
        highScore[0].time = time;
        localStorage.setItem("highscore", JSON.stringify(highScore));
    } else {
        for (i = 0; i < 5; i += 1) {
            if (time < Number(highScore[i].time)) {
                for (j = 3; j >= i; j -= 1) {
                    highScore[j + 1].nickname = highScore[j].nickname;
                    highScore[j + 1].time = highScore[j].time;
                }

                highScore[i].nickname = name;
                highScore[i].time = time;
                localStorage.setItem("highscore", JSON.stringify(highScore));
                break;
            } else if (highScore[i].time === "") {
                highScore[i].nickname = name;
                highScore[i].time = time;
                localStorage.setItem("highscore", JSON.stringify(highScore));
                break;
            }
        }
    }
};

module.exports = Quiz;

},{"./Print":1,"./Timer":3,"./ajax":4}],3:[function(require,module,exports){
function Timer(callback) {
    var time;
    var totalTime = 0;
    var timerInterval;
    var _this = this;

    this.startTimer = function() {
        time = 20;
        timerInterval = window.setInterval(this.updateTimer, 100);
    };

    this.stopTimer = function() {
        totalTime += 20 - time;
        window.clearInterval(timerInterval);
    };

    this.updateTimer = function() {
        var timer = document.querySelector("#time");
        time -= 0.1;
        if (time <= 0.1) {
            _this.stopTimer();
            timer.textContent = time.toFixed(1);
            callback();
        } else {
            timer.textContent = time.toFixed(1);
        }
    };

    this.getTotalTime = function() {
        return totalTime.toFixed(2);
    };
}

module.exports = Timer;

},{}],4:[function(require,module,exports){
function request(config, callback) {
    var req = new XMLHttpRequest();

    req.addEventListener("load", function() {
        if (req.status >= 400) {
            callback(req.status, req.responseText);
        } else {
            callback(null, req.responseText);
        }
    });

    req.open(config.method, config.url);
    req.setRequestHeader("Content-type", config.contentType);
    req.send(config.answer);
}

module.exports.request = request;

},{}],5:[function(require,module,exports){
var Quiz = require("./Quiz");

var test = new Quiz();

},{"./Quiz":2}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHJpbnQuanMiLCJjbGllbnQvc291cmNlL2pzL1F1aXouanMiLCJjbGllbnQvc291cmNlL2pzL1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hamF4LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBQcmludCgpIHtcbiAgICB0aGlzLnF1ZXN0aW9uID0gZnVuY3Rpb24ocXVlc3Rpb24pIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lcjtcbiAgICAgICAgdmFyIHBhcmFncmFwaDtcblxuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3F1ZXN0aW9uQ29udGFpbmVyXCIpO1xuICAgICAgICBwYXJhZ3JhcGggPSBjb250YWluZXIuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgICAgIHBhcmFncmFwaC50ZXh0Q29udGVudCA9IHF1ZXN0aW9uO1xuICAgIH07XG5cbiAgICB0aGlzLmFuc3dlciA9IGZ1bmN0aW9uKGFsdGVybmF0aXZlcykge1xuICAgICAgICB2YXIgZm9ybTtcbiAgICAgICAgdmFyIGxhYmxlcztcbiAgICAgICAgdmFyIHRleHROb2RlO1xuXG4gICAgICAgIGlmIChhbHRlcm5hdGl2ZXMpIHtcblxuICAgICAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImFsdGVybmF0aXZlQW5zd2VyVGVtcGxhdGVcIiwgXCJmb3JtQ29udGFpbmVyXCIpO1xuICAgICAgICAgICAgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYWx0ZXJuYXRpdmVBbnN3ZXJGb3JtXCIpO1xuICAgICAgICAgICAgbGFibGVzID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwibGFibGVcIik7XG5cbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDEpO1xuICAgICAgICAgICAgbGFibGVzWzBdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDIpO1xuICAgICAgICAgICAgbGFibGVzWzFdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDMpO1xuICAgICAgICAgICAgbGFibGVzWzJdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDQpO1xuICAgICAgICAgICAgbGFibGVzWzNdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWRkVGVtcGxhdGUoXCJ0ZXh0QW5zd2VyVGVtcGxhdGVcIiwgXCJmb3JtQ29udGFpbmVyXCIpO1xuICAgICAgICAgICAgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dEFuc3dlckZvcm1cIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9ybTtcbiAgICB9O1xuXG4gICAgdGhpcy5uaWNrbmFtZUZvcm0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcIm5pY2tuYW1lVGVtcGxhdGVcIiwgXCJmb3JtQ29udGFpbmVyXCIpO1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuaWNrbmFtZUZvcm1cIik7XG4gICAgfTtcblxuICAgIHRoaXMuZ2FtZVdvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgaGlnaFNjb3JlO1xuICAgICAgICB2YXIgc2NvcmVCb2FyZDtcbiAgICAgICAgdmFyIHBhcmFncmFwaHM7XG4gICAgICAgIHZhciBzdHI7XG4gICAgICAgIHZhciB0ZXh0Tm9kZTtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImdhbWVXb25UZW1wbGF0ZVwiLCBcImZvcm1Db250YWluZXJcIik7XG4gICAgICAgIGhpZ2hTY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWdoU2NvcmVcIikpO1xuICAgICAgICBzY29yZUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZUJvYXJkXCIpO1xuICAgICAgICBwYXJhZ3JhcGhzID0gc2NvcmVCb2FyZC5xdWVyeVNlbGVjdG9yQWxsKFwicFwiKTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaGlnaFNjb3JlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBzdHIgPSAoaSArIDEpICsgXCIuIFwiO1xuICAgICAgICAgICAgc3RyICs9IFwiTmFtZTogXCIgKyBoaWdoU2NvcmVbaV0ubmlja25hbWUgKyBcIiBcIjtcbiAgICAgICAgICAgIHN0ciArPSBcIlRpbWU6IFwiICsgaGlnaFNjb3JlW2ldLnRpbWU7XG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0cik7XG4gICAgICAgICAgICBwYXJhZ3JhcGhzW2ldLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmdhbWVMb3N0ID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICB2YXIgY29udGFpbmVyO1xuICAgICAgICB2YXIgcGFyYWdyYXBoO1xuICAgICAgICB2YXIgdGV4dE5vZGU7XG5cbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImdhbWVMb3N0VGVtcGxhdGVcIiwgXCJmb3JtQ29udGFpbmVyXCIpO1xuICAgICAgICBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Zvcm1Db250YWluZXJcIik7XG4gICAgICAgIHBhcmFncmFwaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVwiKTtcbiAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKTtcbiAgICAgICAgY29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkLnJlbW92ZSgpO1xuICAgICAgICBwYXJhZ3JhcGguYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgIH07XG5cbiAgICB0aGlzLmFkZFRlbXBsYXRlID0gZnVuY3Rpb24odGVtcGxhdGVOYW1lLCBjb250YWluZXJOYW1lKSB7XG4gICAgICAgIHZhciBjb250YWluZXI7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIGZvcm07XG5cbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIGNvbnRhaW5lck5hbWUpO1xuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0ZW1wbGF0ZU5hbWUpO1xuICAgICAgICBmb3JtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcblxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcmludDtcbiIsInZhciBhamF4ID0gcmVxdWlyZShcIi4vYWpheFwiKTtcbnZhciBUaW1lciA9IHJlcXVpcmUoXCIuL1RpbWVyXCIpO1xudmFyIFByaW50ID0gcmVxdWlyZShcIi4vUHJpbnRcIik7XG5cbmZ1bmN0aW9uIFF1aXooKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLnByaW50ID0gbmV3IFByaW50KCk7XG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcihmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMucHJpbnQuZ2FtZUxvc3QoXCJZb3UgcmFuIG91dCBvZiB0aW1lXCIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5uaWNrbmFtZSA9IHRoaXMuZ2V0Tmlja25hbWUoKTtcbn1cblxuUXVpei5wcm90b3R5cGUuZ2V0Tmlja25hbWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBmb3JtO1xuICAgIHZhciBtZXNzYWdlO1xuXG4gICAgZm9ybSA9IHRoaXMucHJpbnQubmlja25hbWVGb3JtKCk7XG4gICAgbWVzc2FnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmlja01lc3NhZ2VcIik7IC8vVE9ETyBLb20gcMOlIG7DpWdvdCBicmEgc8OkdHQgYXR0IGzDtnNhIGRldHRhXG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3RoaXMubmlja25hbWUgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICBpZiAoX3RoaXMubmlja25hbWUpIHtcbiAgICAgICAgICAgIG1lc3NhZ2UucmVtb3ZlKCk7XG4gICAgICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgICAgICAgICAgX3RoaXMuZ2V0UXVlc3Rpb24oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIlBsZWFzZSB3cml0ZSB5b3VyIG5pY2tuYW1lXCI7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblF1aXoucHJvdG90eXBlLmdldFF1ZXN0aW9uID0gZnVuY3Rpb24obmV3VVJMKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgYWpheENvbmZpZztcbiAgICB2YXIgcmVzcG9uc2U7XG5cbiAgICBhamF4Q29uZmlnID0ge1xuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIHVybDogbmV3VVJMIHx8IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiXG4gICAgfTtcblxuICAgIGFqYXgucmVxdWVzdChhamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIF90aGlzLnByaW50LnF1ZXN0aW9uKHJlc3BvbnNlLnF1ZXN0aW9uKTtcbiAgICAgICAgX3RoaXMucG9zdEFuc3dlcihyZXNwb25zZS5uZXh0VVJMLCByZXNwb25zZS5hbHRlcm5hdGl2ZXMpO1xuICAgICAgICBfdGhpcy50aW1lci5zdGFydFRpbWVyKCk7XG4gICAgfSk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5wb3N0QW5zd2VyID0gZnVuY3Rpb24obmV3VVJMLCBhbHRlcm5hdGl2ZXMpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBhbnN3ZXI7XG4gICAgdmFyIGZvcm07XG4gICAgdmFyIGFqYXhDb25maWc7XG5cbiAgICBmb3JtID0gdGhpcy5wcmludC5hbnN3ZXIoYWx0ZXJuYXRpdmVzKTtcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfdGhpcy50aW1lci5zdG9wVGltZXIoKTtcblxuICAgICAgICBhbnN3ZXIgPSBfdGhpcy5nZXRBbnN3ZXIoYWx0ZXJuYXRpdmVzLCBmb3JtKTtcblxuICAgICAgICBhamF4Q29uZmlnID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHVybDogbmV3VVJMLFxuICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgYW5zd2VyOiBKU09OLnN0cmluZ2lmeShhbnN3ZXIpXG4gICAgICAgIH07XG5cbiAgICAgICAgYWpheC5yZXF1ZXN0KGFqYXhDb25maWcsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XG4gICAgICAgICAgICBfdGhpcy5hbmFseXplUmVzcG9uc2UoZXJyb3IsIEpTT04ucGFyc2UoZGF0YSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUuZ2V0QW5zd2VyID0gZnVuY3Rpb24oYWx0ZXJuYXRpdmVzLCBmb3JtKSB7XG4gICAgdmFyIGFuc3dlcjtcbiAgICB2YXIgYW5zd2VyT2JqO1xuICAgIHZhciBidXR0b25zO1xuICAgIHZhciBpO1xuXG4gICAgaWYgKGFsdGVybmF0aXZlcykge1xuICAgICAgICBidXR0b25zID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRcIik7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aCAtIDE7IGkgKz0gMSkge1xuICAgICAgICAgICAgaWYgKGJ1dHRvbnNbaV0uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIGFuc3dlciA9IGJ1dHRvbnNbaV0udmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBhbnN3ZXIgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgIH1cblxuICAgIGFuc3dlck9iaiA9IHtcbiAgICAgICAgYW5zd2VyOiBhbnN3ZXJcbiAgICB9O1xuXG4gICAgcmV0dXJuIGFuc3dlck9iajtcbn07XG5cblF1aXoucHJvdG90eXBlLmFuYWx5emVSZXNwb25zZSA9IGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgICBpZiAocmVzcG9uc2UubWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5wcmludC5nYW1lTG9zdChyZXNwb25zZS5tZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAoXCJOZXR3b3JrIGVycm9yIFwiICsgZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVzcG9uc2UubmV4dFVSTCkge1xuICAgICAgICAgICAgdGhpcy5nZXRRdWVzdGlvbihyZXNwb25zZS5uZXh0VVJMKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZUhpZ2hzY29yZSgpO1xuICAgICAgICAgICAgdGhpcy5wcmludC5nYW1lV29uKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5RdWl6LnByb3RvdHlwZS5zYXZlSGlnaHNjb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRpbWU7XG4gICAgdmFyIG5hbWU7XG4gICAgdmFyIGhpZ2hTY29yZTtcbiAgICB2YXIgaTtcbiAgICB2YXIgajtcblxuICAgIHRpbWUgPSB0aGlzLnRpbWVyLmdldFRvdGFsVGltZSgpO1xuICAgIG5hbWUgPSB0aGlzLm5pY2tuYW1lO1xuICAgIGhpZ2hTY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWdoc2NvcmVcIikpO1xuICAgIGlmICghaGlnaFNjb3JlKSB7XG4gICAgICAgIGhpZ2hTY29yZSA9IFtcbiAgICAgICAgICAgIHtuaWNrbmFtZTogXCJcIiwgdGltZTogXCJcIn0sXG4gICAgICAgICAgICB7bmlja25hbWU6IFwiXCIsIHRpbWU6IFwiXCJ9LFxuICAgICAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAgICAgIHtuaWNrbmFtZTogXCJcIiwgdGltZTogXCJcIn0sXG4gICAgICAgICAgICB7bmlja25hbWU6IFwiXCIsIHRpbWU6IFwiXCJ9XG4gICAgICAgIF07XG4gICAgICAgIGhpZ2hTY29yZVswXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgIGhpZ2hTY29yZVswXS50aW1lID0gdGltZTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJoaWdoc2NvcmVcIiwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IDU7IGkgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHRpbWUgPCBOdW1iZXIoaGlnaFNjb3JlW2ldLnRpbWUpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChqID0gMzsgaiA+PSBpOyBqIC09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgaGlnaFNjb3JlW2ogKyAxXS5uaWNrbmFtZSA9IGhpZ2hTY29yZVtqXS5uaWNrbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgaGlnaFNjb3JlW2ogKyAxXS50aW1lID0gaGlnaFNjb3JlW2pdLnRpbWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlW2ldLm5pY2tuYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVbaV0udGltZSA9IHRpbWU7XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJoaWdoc2NvcmVcIiwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGhpZ2hTY29yZVtpXS50aW1lID09PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlW2ldLm5pY2tuYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVbaV0udGltZSA9IHRpbWU7XG4gICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJoaWdoc2NvcmVcIiwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlKSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1aXo7XG4iLCJmdW5jdGlvbiBUaW1lcihjYWxsYmFjaykge1xuICAgIHZhciB0aW1lO1xuICAgIHZhciB0b3RhbFRpbWUgPSAwO1xuICAgIHZhciB0aW1lckludGVydmFsO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLnN0YXJ0VGltZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZSA9IDIwO1xuICAgICAgICB0aW1lckludGVydmFsID0gd2luZG93LnNldEludGVydmFsKHRoaXMudXBkYXRlVGltZXIsIDEwMCk7XG4gICAgfTtcblxuICAgIHRoaXMuc3RvcFRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRvdGFsVGltZSArPSAyMCAtIHRpbWU7XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRpbWVySW50ZXJ2YWwpO1xuICAgIH07XG5cbiAgICB0aGlzLnVwZGF0ZVRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aW1lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGltZVwiKTtcbiAgICAgICAgdGltZSAtPSAwLjE7XG4gICAgICAgIGlmICh0aW1lIDw9IDAuMSkge1xuICAgICAgICAgICAgX3RoaXMuc3RvcFRpbWVyKCk7XG4gICAgICAgICAgICB0aW1lci50ZXh0Q29udGVudCA9IHRpbWUudG9GaXhlZCgxKTtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aW1lci50ZXh0Q29udGVudCA9IHRpbWUudG9GaXhlZCgxKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmdldFRvdGFsVGltZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdG90YWxUaW1lLnRvRml4ZWQoMik7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcbiIsImZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnLCBjYWxsYmFjaykge1xuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHJlcS5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXEuc3RhdHVzLCByZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXEub3Blbihjb25maWcubWV0aG9kLCBjb25maWcudXJsKTtcbiAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBjb25maWcuY29udGVudFR5cGUpO1xuICAgIHJlcS5zZW5kKGNvbmZpZy5hbnN3ZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5yZXF1ZXN0ID0gcmVxdWVzdDtcbiIsInZhciBRdWl6ID0gcmVxdWlyZShcIi4vUXVpelwiKTtcblxudmFyIHRlc3QgPSBuZXcgUXVpeigpO1xuIl19
