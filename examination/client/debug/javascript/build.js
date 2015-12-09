(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Print() {

    this.title = function() {
        this.clearContainer("topContainer");
        this.addTemplate("titleTemplate", "topContainer");
    };

    this.question = function(question) {
        var container;
        var questionParagraph;

        this.clearContainer("topContainer");
        this.addTemplate("questionTemplate", "topContainer");
        questionParagraph = document.querySelector("#questionParagraph");
        questionParagraph.textContent = question;
    };

    this.answer = function(alternatives) {
        var form;
        var lables;
        var textNode;

        this.clearContainer("bottomContainer");

        if (alternatives) {

            this.addTemplate("alternativeAnswerTemplate", "bottomContainer");
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
            this.addTemplate("textAnswerTemplate", "bottomContainer");
            form = document.querySelector("#textAnswerForm");
        }

        return form;
    };

    this.nicknameForm = function() {
        this.title();
        this.addTemplate("nicknameTemplate", "bottomContainer");
        return document.querySelector("#nicknameForm");
    };

    this.gameWon = function(name, time) {
        var highScore;
        var scoreBoard;
        var heading;
        var paragraphs;
        var str;
        var textNode;
        var i;

        this.title();
        this.clearContainer("bottomContainer");
        this.addTemplate("gameWonTemplate", "bottomContainer");
        highScore = JSON.parse(localStorage.getItem("highScore"));
        scoreBoard = document.querySelector("#scoreBoard");
        paragraphs = scoreBoard.querySelectorAll("p");
        heading = document.querySelector("#playerScore");

        textNode = document.createTextNode("Nickname: " + name + " Time: " + time);
        heading.appendChild(textNode);

        for (i = 0; i < highScore.length; i += 1) {
            str = (i + 1) + ". ";
            str += "Name: " + highScore[i].nickname + " ";
            str += "Time: " + highScore[i].time;
            textNode = document.createTextNode(str);
            paragraphs[i].appendChild(textNode);
        }
    };

    this.gameLost = function(message) {
        var paragraph;
        var textNode;

        this.clearContainer("bottomContainer");

        this.title();
        this.addTemplate("gameLostTemplate", "bottomContainer");
        paragraph = document.querySelector("#message");
        textNode = document.createTextNode(message);
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

    this.clearContainer = function(containerName) {
        var container;
        var content;
        var i;

        container = document.querySelector("#" + containerName);
        content = container.children;

        for (i = 0; i < content.length; i += 1) {
            content[i].remove();
        }
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
        if (error) {
            throw new Error ("Network error " + error);
        } else {
            response = JSON.parse(data);
            _this.print.question(response.question);
            _this.postAnswer(response.nextURL, response.alternatives);
            _this.timer.startTimer();
        }
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

        //form.remove();    //TODO Byt ut mot clearContainer

        ajax.request(ajaxConfig, function(error, data) {
            _this.analyzeResponse(error, JSON.parse(data));
            form.remove();
        });
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
    var name;
    var time;

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
            time = this.timer.getTotalTime();
            name = this.nickname;
            this.saveHighScore(name, time);
            this.print.gameWon(name, time);
        }
    }
};

Quiz.prototype.saveHighScore = function(name, time) {
    var highScore;
    var i;
    var j;

    highScore = JSON.parse(localStorage.getItem("highScore"));
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
        localStorage.setItem("highScore", JSON.stringify(highScore));
    } else {
        for (i = 0; i < 5; i += 1) {
            if (time < Number(highScore[i].time)) {
                for (j = 3; j >= i; j -= 1) {
                    highScore[j + 1].nickname = highScore[j].nickname;
                    highScore[j + 1].time = highScore[j].time;
                }

                highScore[i].nickname = name;
                highScore[i].time = time;
                localStorage.setItem("highScore", JSON.stringify(highScore));
                break;
            } else if (highScore[i].time === "") {
                highScore[i].nickname = name;
                highScore[i].time = time;
                localStorage.setItem("highScore", JSON.stringify(highScore));
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
        var timer = document.querySelector("#timeParagraph");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHJpbnQuanMiLCJjbGllbnQvc291cmNlL2pzL1F1aXouanMiLCJjbGllbnQvc291cmNlL2pzL1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hamF4LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBQcmludCgpIHtcblxuICAgIHRoaXMudGl0bGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5jbGVhckNvbnRhaW5lcihcInRvcENvbnRhaW5lclwiKTtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcInRpdGxlVGVtcGxhdGVcIiwgXCJ0b3BDb250YWluZXJcIik7XG4gICAgfTtcblxuICAgIHRoaXMucXVlc3Rpb24gPSBmdW5jdGlvbihxdWVzdGlvbikge1xuICAgICAgICB2YXIgY29udGFpbmVyO1xuICAgICAgICB2YXIgcXVlc3Rpb25QYXJhZ3JhcGg7XG5cbiAgICAgICAgdGhpcy5jbGVhckNvbnRhaW5lcihcInRvcENvbnRhaW5lclwiKTtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcInF1ZXN0aW9uVGVtcGxhdGVcIiwgXCJ0b3BDb250YWluZXJcIik7XG4gICAgICAgIHF1ZXN0aW9uUGFyYWdyYXBoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNxdWVzdGlvblBhcmFncmFwaFwiKTtcbiAgICAgICAgcXVlc3Rpb25QYXJhZ3JhcGgudGV4dENvbnRlbnQgPSBxdWVzdGlvbjtcbiAgICB9O1xuXG4gICAgdGhpcy5hbnN3ZXIgPSBmdW5jdGlvbihhbHRlcm5hdGl2ZXMpIHtcbiAgICAgICAgdmFyIGZvcm07XG4gICAgICAgIHZhciBsYWJsZXM7XG4gICAgICAgIHZhciB0ZXh0Tm9kZTtcblxuICAgICAgICB0aGlzLmNsZWFyQ29udGFpbmVyKFwiYm90dG9tQ29udGFpbmVyXCIpO1xuXG4gICAgICAgIGlmIChhbHRlcm5hdGl2ZXMpIHtcblxuICAgICAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImFsdGVybmF0aXZlQW5zd2VyVGVtcGxhdGVcIiwgXCJib3R0b21Db250YWluZXJcIik7XG4gICAgICAgICAgICBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhbHRlcm5hdGl2ZUFuc3dlckZvcm1cIik7XG4gICAgICAgICAgICBsYWJsZXMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsYWJsZVwiKTtcblxuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0MSk7XG4gICAgICAgICAgICBsYWJsZXNbMF0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0Mik7XG4gICAgICAgICAgICBsYWJsZXNbMV0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0Myk7XG4gICAgICAgICAgICBsYWJsZXNbMl0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0NCk7XG4gICAgICAgICAgICBsYWJsZXNbM10uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcInRleHRBbnN3ZXJUZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgICAgIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RleHRBbnN3ZXJGb3JtXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvcm07XG4gICAgfTtcblxuICAgIHRoaXMubmlja25hbWVGb3JtID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMudGl0bGUoKTtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcIm5pY2tuYW1lVGVtcGxhdGVcIiwgXCJib3R0b21Db250YWluZXJcIik7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25pY2tuYW1lRm9ybVwiKTtcbiAgICB9O1xuXG4gICAgdGhpcy5nYW1lV29uID0gZnVuY3Rpb24obmFtZSwgdGltZSkge1xuICAgICAgICB2YXIgaGlnaFNjb3JlO1xuICAgICAgICB2YXIgc2NvcmVCb2FyZDtcbiAgICAgICAgdmFyIGhlYWRpbmc7XG4gICAgICAgIHZhciBwYXJhZ3JhcGhzO1xuICAgICAgICB2YXIgc3RyO1xuICAgICAgICB2YXIgdGV4dE5vZGU7XG4gICAgICAgIHZhciBpO1xuXG4gICAgICAgIHRoaXMudGl0bGUoKTtcbiAgICAgICAgdGhpcy5jbGVhckNvbnRhaW5lcihcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImdhbWVXb25UZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgaGlnaFNjb3JlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hTY29yZVwiKSk7XG4gICAgICAgIHNjb3JlQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Njb3JlQm9hcmRcIik7XG4gICAgICAgIHBhcmFncmFwaHMgPSBzY29yZUJvYXJkLnF1ZXJ5U2VsZWN0b3JBbGwoXCJwXCIpO1xuICAgICAgICBoZWFkaW5nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNwbGF5ZXJTY29yZVwiKTtcblxuICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTmlja25hbWU6IFwiICsgbmFtZSArIFwiIFRpbWU6IFwiICsgdGltZSk7XG4gICAgICAgIGhlYWRpbmcuYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBoaWdoU2NvcmUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgICAgIHN0ciA9IChpICsgMSkgKyBcIi4gXCI7XG4gICAgICAgICAgICBzdHIgKz0gXCJOYW1lOiBcIiArIGhpZ2hTY29yZVtpXS5uaWNrbmFtZSArIFwiIFwiO1xuICAgICAgICAgICAgc3RyICs9IFwiVGltZTogXCIgKyBoaWdoU2NvcmVbaV0udGltZTtcbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RyKTtcbiAgICAgICAgICAgIHBhcmFncmFwaHNbaV0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZ2FtZUxvc3QgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIHZhciBwYXJhZ3JhcGg7XG4gICAgICAgIHZhciB0ZXh0Tm9kZTtcblxuICAgICAgICB0aGlzLmNsZWFyQ29udGFpbmVyKFwiYm90dG9tQ29udGFpbmVyXCIpO1xuXG4gICAgICAgIHRoaXMudGl0bGUoKTtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImdhbWVMb3N0VGVtcGxhdGVcIiwgXCJib3R0b21Db250YWluZXJcIik7XG4gICAgICAgIHBhcmFncmFwaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVwiKTtcbiAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKTtcbiAgICAgICAgcGFyYWdyYXBoLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5hZGRUZW1wbGF0ZSA9IGZ1bmN0aW9uKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgICAgICB2YXIgY29udGFpbmVyO1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBmb3JtO1xuXG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBjb250YWluZXJOYW1lKTtcbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGVtcGxhdGVOYW1lKTtcbiAgICAgICAgZm9ybSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xuICAgIH07XG5cbiAgICB0aGlzLmNsZWFyQ29udGFpbmVyID0gZnVuY3Rpb24oY29udGFpbmVyTmFtZSkge1xuICAgICAgICB2YXIgY29udGFpbmVyO1xuICAgICAgICB2YXIgY29udGVudDtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIGNvbnRhaW5lck5hbWUpO1xuICAgICAgICBjb250ZW50ID0gY29udGFpbmVyLmNoaWxkcmVuO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBjb250ZW50Lmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBjb250ZW50W2ldLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcmludDtcbiIsInZhciBhamF4ID0gcmVxdWlyZShcIi4vYWpheFwiKTtcbnZhciBUaW1lciA9IHJlcXVpcmUoXCIuL1RpbWVyXCIpO1xudmFyIFByaW50ID0gcmVxdWlyZShcIi4vUHJpbnRcIik7XG5cbmZ1bmN0aW9uIFF1aXooKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLnByaW50ID0gbmV3IFByaW50KCk7XG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcihmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMucHJpbnQuZ2FtZUxvc3QoXCJZb3UgcmFuIG91dCBvZiB0aW1lXCIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5uaWNrbmFtZSA9IHRoaXMuZ2V0Tmlja25hbWUoKTtcbn1cblxuUXVpei5wcm90b3R5cGUuZ2V0Tmlja25hbWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBmb3JtO1xuICAgIHZhciBtZXNzYWdlO1xuXG4gICAgZm9ybSA9IHRoaXMucHJpbnQubmlja25hbWVGb3JtKCk7XG4gICAgbWVzc2FnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmlja01lc3NhZ2VcIik7IC8vVE9ETyBLb20gcMOlIG7DpWdvdCBicmEgc8OkdHQgYXR0IGzDtnNhIGRldHRhXG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3RoaXMubmlja25hbWUgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICBpZiAoX3RoaXMubmlja25hbWUpIHtcbiAgICAgICAgICAgIF90aGlzLmdldFF1ZXN0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gXCJQbGVhc2Ugd3JpdGUgeW91ciBuaWNrbmFtZVwiO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5nZXRRdWVzdGlvbiA9IGZ1bmN0aW9uKG5ld1VSTCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyIGFqYXhDb25maWc7XG4gICAgdmFyIHJlc3BvbnNlO1xuXG4gICAgYWpheENvbmZpZyA9IHtcbiAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICB1cmw6IG5ld1VSTCB8fCBcImh0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzFcIlxuICAgIH07XG5cbiAgICBhamF4LnJlcXVlc3QoYWpheENvbmZpZywgZnVuY3Rpb24oZXJyb3IsIGRhdGEpIHtcbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgKFwiTmV0d29yayBlcnJvciBcIiArIGVycm9yKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICAgIF90aGlzLnByaW50LnF1ZXN0aW9uKHJlc3BvbnNlLnF1ZXN0aW9uKTtcbiAgICAgICAgICAgIF90aGlzLnBvc3RBbnN3ZXIocmVzcG9uc2UubmV4dFVSTCwgcmVzcG9uc2UuYWx0ZXJuYXRpdmVzKTtcbiAgICAgICAgICAgIF90aGlzLnRpbWVyLnN0YXJ0VGltZXIoKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUucG9zdEFuc3dlciA9IGZ1bmN0aW9uKG5ld1VSTCwgYWx0ZXJuYXRpdmVzKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgYW5zd2VyO1xuICAgIHZhciBmb3JtO1xuICAgIHZhciBhamF4Q29uZmlnO1xuXG4gICAgZm9ybSA9IHRoaXMucHJpbnQuYW5zd2VyKGFsdGVybmF0aXZlcyk7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3RoaXMudGltZXIuc3RvcFRpbWVyKCk7XG5cbiAgICAgICAgYW5zd2VyID0gX3RoaXMuZ2V0QW5zd2VyKGFsdGVybmF0aXZlcywgZm9ybSk7XG4gICAgICAgIGFqYXhDb25maWcgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBuZXdVUkwsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBhbnN3ZXI6IEpTT04uc3RyaW5naWZ5KGFuc3dlcilcbiAgICAgICAgfTtcblxuICAgICAgICAvL2Zvcm0ucmVtb3ZlKCk7ICAgIC8vVE9ETyBCeXQgdXQgbW90IGNsZWFyQ29udGFpbmVyXG5cbiAgICAgICAgYWpheC5yZXF1ZXN0KGFqYXhDb25maWcsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XG4gICAgICAgICAgICBfdGhpcy5hbmFseXplUmVzcG9uc2UoZXJyb3IsIEpTT04ucGFyc2UoZGF0YSkpO1xuICAgICAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5nZXRBbnN3ZXIgPSBmdW5jdGlvbihhbHRlcm5hdGl2ZXMsIGZvcm0pIHtcbiAgICB2YXIgYW5zd2VyO1xuICAgIHZhciBhbnN3ZXJPYmo7XG4gICAgdmFyIGJ1dHRvbnM7XG4gICAgdmFyIGk7XG5cbiAgICBpZiAoYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgIGJ1dHRvbnMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoIC0gMTsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZiAoYnV0dG9uc1tpXS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgYW5zd2VyID0gYnV0dG9uc1tpXS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGFuc3dlciA9IGZvcm0uZmlyc3RFbGVtZW50Q2hpbGQudmFsdWU7XG4gICAgfVxuXG4gICAgYW5zd2VyT2JqID0ge1xuICAgICAgICBhbnN3ZXI6IGFuc3dlclxuICAgIH07XG5cbiAgICByZXR1cm4gYW5zd2VyT2JqO1xufTtcblxuUXVpei5wcm90b3R5cGUuYW5hbHl6ZVJlc3BvbnNlID0gZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlKSB7XG4gICAgdmFyIG5hbWU7XG4gICAgdmFyIHRpbWU7XG5cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJpbnQuZ2FtZUxvc3QocmVzcG9uc2UubWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgKFwiTmV0d29yayBlcnJvciBcIiArIGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm5leHRVUkwpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0UXVlc3Rpb24ocmVzcG9uc2UubmV4dFVSTCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aW1lID0gdGhpcy50aW1lci5nZXRUb3RhbFRpbWUoKTtcbiAgICAgICAgICAgIG5hbWUgPSB0aGlzLm5pY2tuYW1lO1xuICAgICAgICAgICAgdGhpcy5zYXZlSGlnaFNjb3JlKG5hbWUsIHRpbWUpO1xuICAgICAgICAgICAgdGhpcy5wcmludC5nYW1lV29uKG5hbWUsIHRpbWUpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuUXVpei5wcm90b3R5cGUuc2F2ZUhpZ2hTY29yZSA9IGZ1bmN0aW9uKG5hbWUsIHRpbWUpIHtcbiAgICB2YXIgaGlnaFNjb3JlO1xuICAgIHZhciBpO1xuICAgIHZhciBqO1xuXG4gICAgaGlnaFNjb3JlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hTY29yZVwiKSk7XG4gICAgaWYgKCFoaWdoU2NvcmUpIHtcbiAgICAgICAgaGlnaFNjb3JlID0gW1xuICAgICAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAgICAgIHtuaWNrbmFtZTogXCJcIiwgdGltZTogXCJcIn0sXG4gICAgICAgICAgICB7bmlja25hbWU6IFwiXCIsIHRpbWU6IFwiXCJ9LFxuICAgICAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAgICAgIHtuaWNrbmFtZTogXCJcIiwgdGltZTogXCJcIn1cbiAgICAgICAgXTtcbiAgICAgICAgaGlnaFNjb3JlWzBdLm5pY2tuYW1lID0gbmFtZTtcbiAgICAgICAgaGlnaFNjb3JlWzBdLnRpbWUgPSB0aW1lO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hTY29yZVwiLCBKU09OLnN0cmluZ2lmeShoaWdoU2NvcmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgNTsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZiAodGltZSA8IE51bWJlcihoaWdoU2NvcmVbaV0udGltZSkpIHtcbiAgICAgICAgICAgICAgICBmb3IgKGogPSAzOyBqID49IGk7IGogLT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBoaWdoU2NvcmVbaiArIDFdLm5pY2tuYW1lID0gaGlnaFNjb3JlW2pdLm5pY2tuYW1lO1xuICAgICAgICAgICAgICAgICAgICBoaWdoU2NvcmVbaiArIDFdLnRpbWUgPSBoaWdoU2NvcmVbal0udGltZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVbaV0ubmlja25hbWUgPSBuYW1lO1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZVtpXS50aW1lID0gdGltZTtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hTY29yZVwiLCBKU09OLnN0cmluZ2lmeShoaWdoU2NvcmUpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaGlnaFNjb3JlW2ldLnRpbWUgPT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVbaV0ubmlja25hbWUgPSBuYW1lO1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZVtpXS50aW1lID0gdGltZTtcbiAgICAgICAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hTY29yZVwiLCBKU09OLnN0cmluZ2lmeShoaWdoU2NvcmUpKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUXVpejtcbiIsImZ1bmN0aW9uIFRpbWVyKGNhbGxiYWNrKSB7XG4gICAgdmFyIHRpbWU7XG4gICAgdmFyIHRvdGFsVGltZSA9IDA7XG4gICAgdmFyIHRpbWVySW50ZXJ2YWw7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuc3RhcnRUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lID0gMjA7XG4gICAgICAgIHRpbWVySW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy51cGRhdGVUaW1lciwgMTAwKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zdG9wVGltZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdG90YWxUaW1lICs9IDIwIC0gdGltZTtcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGltZXJJbnRlcnZhbCk7XG4gICAgfTtcblxuICAgIHRoaXMudXBkYXRlVGltZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRpbWVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lUGFyYWdyYXBoXCIpO1xuICAgICAgICB0aW1lIC09IDAuMTtcbiAgICAgICAgaWYgKHRpbWUgPD0gMC4xKSB7XG4gICAgICAgICAgICBfdGhpcy5zdG9wVGltZXIoKTtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gdGltZS50b0ZpeGVkKDEpO1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gdGltZS50b0ZpeGVkKDEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0VG90YWxUaW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0b3RhbFRpbWUudG9GaXhlZCgyKTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xuIiwiZnVuY3Rpb24gcmVxdWVzdChjb25maWcsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcS5zdGF0dXMsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJlcS5vcGVuKGNvbmZpZy5tZXRob2QsIGNvbmZpZy51cmwpO1xuICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIGNvbmZpZy5jb250ZW50VHlwZSk7XG4gICAgcmVxLnNlbmQoY29uZmlnLmFuc3dlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuIiwidmFyIFF1aXogPSByZXF1aXJlKFwiLi9RdWl6XCIpO1xuXG52YXIgdGVzdCA9IG5ldyBRdWl6KCk7XG4iXX0=
