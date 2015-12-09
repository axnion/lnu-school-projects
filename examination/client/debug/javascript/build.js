(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Print() {

    this.question = function(question) {
        var questionParagraph;

        questionParagraph = document.querySelector("#questionParagraph");
        questionParagraph.textContent = question;
    };

    this.answer = function(alternatives) {
        var form;
        var lables;
        var textNode;

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
        this.addTemplate("nicknameTemplate", "bottomContainer");
        return document.querySelector("#nicknameForm");
    };

    this.gameWon = function(name, time) {
        var highScores;
        var fragment;
        var textNode;
        var list;
        var listElement;
        var i;

        this.addTemplate("gameWonTemplate", "bottomContainer");
        highScores = JSON.parse(localStorage.getItem("highScores"));
        fragment = document.createDocumentFragment();
        list = document.querySelector("#scoreBoard");

        for (i = 0; i < highScores.length; i += 1) {
            listElement = document.createElement("li");
            textNode = document.createTextNode((i + 1) + ". Name: " + highScores[i].nickname + " Time: " + highScores[i].time);
            listElement.appendChild(textNode);
            fragment.appendChild(listElement);
        }

        list.appendChild(fragment);
    };

    //this.gameWon = function(name, time) {
    //    var highScores;
    //    var scoreBoard;
    //    var heading;
    //    var paragraphs;
    //    var str;
    //    var textNode;
    //    var i;
    //
    //    this.addTemplate("gameWonTemplate", "bottomContainer");
    //    highScores = JSON.parse(localStorage.getItem("highScores"));
    //    scoreBoard = document.querySelector("#scoreBoard");
    //    paragraphs = scoreBoard.querySelectorAll("p");
    //    heading = document.querySelector("#playerScore");
    //
    //    textNode = document.createTextNode("Nickname: " + name + " Time: " + time);
    //    heading.appendChild(textNode);
    //
    //    for (i = 0; i < highScores.length; i += 1) {
    //        str = (i + 1) + ". ";
    //        str += "Name: " + highScores[i].nickname + " ";
    //        str += "Time: " + highScores[i].time;
    //        textNode = document.createTextNode(str);
    //        paragraphs[i].appendChild(textNode);
    //    }
    //};

    this.gameLost = function(message) {
        var paragraph;
        var textNode;

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

    form.addEventListener("submit", function setNickname(event) {
        event.preventDefault();
        _this.nickname = form.firstElementChild.value;
        if (_this.nickname) {
            form.removeEventListener("submit", setNickname);
            form.remove();
            _this.getQuestion();
            message.textContent = "";
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
            _this.timer.startTimer();
            _this.postAnswer(response.nextURL, response.alternatives);
        }
    });
};

Quiz.prototype.postAnswer = function(newURL, alternatives) {
    var _this = this;
    var answer;
    var form;
    var ajaxConfig;

    form = this.print.answer(alternatives);

    form.addEventListener("submit", function submitAnswer(event) {
        event.preventDefault();
        _this.timer.stopTimer();

        answer = _this.getAnswer(alternatives, form);
        ajaxConfig = {
            method: "POST",
            url: newURL,
            contentType: "application/json",
            answer: JSON.stringify(answer)
        };
        form.remove();
        ajax.request(ajaxConfig, function(error, data) {
            _this.analyzeResponse(error, JSON.parse(data));
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
    var highScores;

    highScores = JSON.parse(localStorage.getItem("highScores"));
    if (highScores) {
        this.saveToScoreBoard(name, time, highScores);

    } else {
        this.createScoreBoard(name, time);
    }
};

Quiz.prototype.createScoreBoard = function(name, time) {
    var highScores;

    highScores = [
        {nickname: "", time: ""},
        {nickname: "", time: ""},
        {nickname: "", time: ""},
        {nickname: "", time: ""},
        {nickname: "", time: ""}
    ];
    highScores[0].nickname = name;
    highScores[0].time = time;
    localStorage.setItem("highScores", JSON.stringify(highScores));
};

Quiz.prototype.saveToScoreBoard = function(name, time, highScores) {
    var i;
    var j;

    for (i = 0; i < 5; i += 1) {
        if (time < Number(highScores[i].time)) {
            for (j = 3; j >= i; j -= 1) {
                highScores[j + 1].nickname = highScores[j].nickname;
                highScores[j + 1].time = highScores[j].time;
            }

            highScores[i].nickname = name;
            highScores[i].time = time;
            localStorage.setItem("highScores", JSON.stringify(highScores));
            break;
        } else if (highScores[i].time === "") {
            highScores[i].nickname = name;
            highScores[i].time = time;
            localStorage.setItem("highScores", JSON.stringify(highScores));
            break;
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
        if (time <= 0) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHJpbnQuanMiLCJjbGllbnQvc291cmNlL2pzL1F1aXouanMiLCJjbGllbnQvc291cmNlL2pzL1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hamF4LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJmdW5jdGlvbiBQcmludCgpIHtcblxuICAgIHRoaXMucXVlc3Rpb24gPSBmdW5jdGlvbihxdWVzdGlvbikge1xuICAgICAgICB2YXIgcXVlc3Rpb25QYXJhZ3JhcGg7XG5cbiAgICAgICAgcXVlc3Rpb25QYXJhZ3JhcGggPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3F1ZXN0aW9uUGFyYWdyYXBoXCIpO1xuICAgICAgICBxdWVzdGlvblBhcmFncmFwaC50ZXh0Q29udGVudCA9IHF1ZXN0aW9uO1xuICAgIH07XG5cbiAgICB0aGlzLmFuc3dlciA9IGZ1bmN0aW9uKGFsdGVybmF0aXZlcykge1xuICAgICAgICB2YXIgZm9ybTtcbiAgICAgICAgdmFyIGxhYmxlcztcbiAgICAgICAgdmFyIHRleHROb2RlO1xuXG4gICAgICAgIGlmIChhbHRlcm5hdGl2ZXMpIHtcblxuICAgICAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImFsdGVybmF0aXZlQW5zd2VyVGVtcGxhdGVcIiwgXCJib3R0b21Db250YWluZXJcIik7XG4gICAgICAgICAgICBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhbHRlcm5hdGl2ZUFuc3dlckZvcm1cIik7XG4gICAgICAgICAgICBsYWJsZXMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsYWJsZVwiKTtcblxuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0MSk7XG4gICAgICAgICAgICBsYWJsZXNbMF0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0Mik7XG4gICAgICAgICAgICBsYWJsZXNbMV0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0Myk7XG4gICAgICAgICAgICBsYWJsZXNbMl0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0NCk7XG4gICAgICAgICAgICBsYWJsZXNbM10uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcInRleHRBbnN3ZXJUZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgICAgIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RleHRBbnN3ZXJGb3JtXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvcm07XG4gICAgfTtcblxuICAgIHRoaXMubmlja25hbWVGb3JtID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuYWRkVGVtcGxhdGUoXCJuaWNrbmFtZVRlbXBsYXRlXCIsIFwiYm90dG9tQ29udGFpbmVyXCIpO1xuICAgICAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuaWNrbmFtZUZvcm1cIik7XG4gICAgfTtcblxuICAgIHRoaXMuZ2FtZVdvbiA9IGZ1bmN0aW9uKG5hbWUsIHRpbWUpIHtcbiAgICAgICAgdmFyIGhpZ2hTY29yZXM7XG4gICAgICAgIHZhciBmcmFnbWVudDtcbiAgICAgICAgdmFyIHRleHROb2RlO1xuICAgICAgICB2YXIgbGlzdDtcbiAgICAgICAgdmFyIGxpc3RFbGVtZW50O1xuICAgICAgICB2YXIgaTtcblxuICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwiZ2FtZVdvblRlbXBsYXRlXCIsIFwiYm90dG9tQ29udGFpbmVyXCIpO1xuICAgICAgICBoaWdoU2NvcmVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hTY29yZXNcIikpO1xuICAgICAgICBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVCb2FyZFwiKTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaGlnaFNjb3Jlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgbGlzdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKChpICsgMSkgKyBcIi4gTmFtZTogXCIgKyBoaWdoU2NvcmVzW2ldLm5pY2tuYW1lICsgXCIgVGltZTogXCIgKyBoaWdoU2NvcmVzW2ldLnRpbWUpO1xuICAgICAgICAgICAgbGlzdEVsZW1lbnQuYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQobGlzdEVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG4gICAgfTtcblxuICAgIC8vdGhpcy5nYW1lV29uID0gZnVuY3Rpb24obmFtZSwgdGltZSkge1xuICAgIC8vICAgIHZhciBoaWdoU2NvcmVzO1xuICAgIC8vICAgIHZhciBzY29yZUJvYXJkO1xuICAgIC8vICAgIHZhciBoZWFkaW5nO1xuICAgIC8vICAgIHZhciBwYXJhZ3JhcGhzO1xuICAgIC8vICAgIHZhciBzdHI7XG4gICAgLy8gICAgdmFyIHRleHROb2RlO1xuICAgIC8vICAgIHZhciBpO1xuICAgIC8vXG4gICAgLy8gICAgdGhpcy5hZGRUZW1wbGF0ZShcImdhbWVXb25UZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAvLyAgICBoaWdoU2NvcmVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hTY29yZXNcIikpO1xuICAgIC8vICAgIHNjb3JlQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Njb3JlQm9hcmRcIik7XG4gICAgLy8gICAgcGFyYWdyYXBocyA9IHNjb3JlQm9hcmQucXVlcnlTZWxlY3RvckFsbChcInBcIik7XG4gICAgLy8gICAgaGVhZGluZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyU2NvcmVcIik7XG4gICAgLy9cbiAgICAvLyAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTmlja25hbWU6IFwiICsgbmFtZSArIFwiIFRpbWU6IFwiICsgdGltZSk7XG4gICAgLy8gICAgaGVhZGluZy5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgLy9cbiAgICAvLyAgICBmb3IgKGkgPSAwOyBpIDwgaGlnaFNjb3Jlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgIC8vICAgICAgICBzdHIgPSAoaSArIDEpICsgXCIuIFwiO1xuICAgIC8vICAgICAgICBzdHIgKz0gXCJOYW1lOiBcIiArIGhpZ2hTY29yZXNbaV0ubmlja25hbWUgKyBcIiBcIjtcbiAgICAvLyAgICAgICAgc3RyICs9IFwiVGltZTogXCIgKyBoaWdoU2NvcmVzW2ldLnRpbWU7XG4gICAgLy8gICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoc3RyKTtcbiAgICAvLyAgICAgICAgcGFyYWdyYXBoc1tpXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgLy8gICAgfVxuICAgIC8vfTtcblxuICAgIHRoaXMuZ2FtZUxvc3QgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIHZhciBwYXJhZ3JhcGg7XG4gICAgICAgIHZhciB0ZXh0Tm9kZTtcblxuICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwiZ2FtZUxvc3RUZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgcGFyYWdyYXBoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZXNzYWdlXCIpO1xuICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpO1xuICAgICAgICBwYXJhZ3JhcGguYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgIH07XG5cbiAgICB0aGlzLmFkZFRlbXBsYXRlID0gZnVuY3Rpb24odGVtcGxhdGVOYW1lLCBjb250YWluZXJOYW1lKSB7XG4gICAgICAgIHZhciBjb250YWluZXI7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIGZvcm07XG5cbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIGNvbnRhaW5lck5hbWUpO1xuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0ZW1wbGF0ZU5hbWUpO1xuICAgICAgICBmb3JtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcblxuICAgICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQoZm9ybSk7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQcmludDtcbiIsInZhciBhamF4ID0gcmVxdWlyZShcIi4vYWpheFwiKTtcbnZhciBUaW1lciA9IHJlcXVpcmUoXCIuL1RpbWVyXCIpO1xudmFyIFByaW50ID0gcmVxdWlyZShcIi4vUHJpbnRcIik7XG5cbmZ1bmN0aW9uIFF1aXooKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzLnByaW50ID0gbmV3IFByaW50KCk7XG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcihmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMucHJpbnQuZ2FtZUxvc3QoXCJZb3UgcmFuIG91dCBvZiB0aW1lXCIpO1xuICAgIH0pO1xuXG4gICAgdGhpcy5uaWNrbmFtZSA9IHRoaXMuZ2V0Tmlja25hbWUoKTtcbn1cblxuUXVpei5wcm90b3R5cGUuZ2V0Tmlja25hbWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBmb3JtO1xuICAgIHZhciBtZXNzYWdlO1xuXG4gICAgZm9ybSA9IHRoaXMucHJpbnQubmlja25hbWVGb3JtKCk7XG4gICAgbWVzc2FnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmlja01lc3NhZ2VcIik7IC8vVE9ETyBLb20gcMOlIG7DpWdvdCBicmEgc8OkdHQgYXR0IGzDtnNhIGRldHRhXG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24gc2V0Tmlja25hbWUoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3RoaXMubmlja25hbWUgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICBpZiAoX3RoaXMubmlja25hbWUpIHtcbiAgICAgICAgICAgIGZvcm0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBzZXROaWNrbmFtZSk7XG4gICAgICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgICAgICAgICAgX3RoaXMuZ2V0UXVlc3Rpb24oKTtcbiAgICAgICAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIlwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFwiUGxlYXNlIHdyaXRlIHlvdXIgbmlja25hbWVcIjtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUuZ2V0UXVlc3Rpb24gPSBmdW5jdGlvbihuZXdVUkwpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBhamF4Q29uZmlnO1xuICAgIHZhciByZXNwb25zZTtcblxuICAgIGFqYXhDb25maWcgPSB7XG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgdXJsOiBuZXdVUkwgfHwgXCJodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xXCJcbiAgICB9O1xuXG4gICAgYWpheC5yZXF1ZXN0KGFqYXhDb25maWcsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIChcIk5ldHdvcmsgZXJyb3IgXCIgKyBlcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICBfdGhpcy5wcmludC5xdWVzdGlvbihyZXNwb25zZS5xdWVzdGlvbik7XG4gICAgICAgICAgICBfdGhpcy50aW1lci5zdGFydFRpbWVyKCk7XG4gICAgICAgICAgICBfdGhpcy5wb3N0QW5zd2VyKHJlc3BvbnNlLm5leHRVUkwsIHJlc3BvbnNlLmFsdGVybmF0aXZlcyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblF1aXoucHJvdG90eXBlLnBvc3RBbnN3ZXIgPSBmdW5jdGlvbihuZXdVUkwsIGFsdGVybmF0aXZlcykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyIGFuc3dlcjtcbiAgICB2YXIgZm9ybTtcbiAgICB2YXIgYWpheENvbmZpZztcblxuICAgIGZvcm0gPSB0aGlzLnByaW50LmFuc3dlcihhbHRlcm5hdGl2ZXMpO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uIHN1Ym1pdEFuc3dlcihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfdGhpcy50aW1lci5zdG9wVGltZXIoKTtcblxuICAgICAgICBhbnN3ZXIgPSBfdGhpcy5nZXRBbnN3ZXIoYWx0ZXJuYXRpdmVzLCBmb3JtKTtcbiAgICAgICAgYWpheENvbmZpZyA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IG5ld1VSTCxcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgIGFuc3dlcjogSlNPTi5zdHJpbmdpZnkoYW5zd2VyKVxuICAgICAgICB9O1xuICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgICAgICBhamF4LnJlcXVlc3QoYWpheENvbmZpZywgZnVuY3Rpb24oZXJyb3IsIGRhdGEpIHtcbiAgICAgICAgICAgIF90aGlzLmFuYWx5emVSZXNwb25zZShlcnJvciwgSlNPTi5wYXJzZShkYXRhKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUuZ2V0QW5zd2VyID0gZnVuY3Rpb24oYWx0ZXJuYXRpdmVzLCBmb3JtKSB7XG4gICAgdmFyIGFuc3dlcjtcbiAgICB2YXIgYW5zd2VyT2JqO1xuICAgIHZhciBidXR0b25zO1xuICAgIHZhciBpO1xuXG4gICAgaWYgKGFsdGVybmF0aXZlcykge1xuICAgICAgICBidXR0b25zID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRcIik7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aCAtIDE7IGkgKz0gMSkge1xuICAgICAgICAgICAgaWYgKGJ1dHRvbnNbaV0uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIGFuc3dlciA9IGJ1dHRvbnNbaV0udmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBhbnN3ZXIgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgIH1cblxuICAgIGFuc3dlck9iaiA9IHtcbiAgICAgICAgYW5zd2VyOiBhbnN3ZXJcbiAgICB9O1xuXG4gICAgcmV0dXJuIGFuc3dlck9iajtcbn07XG5cblF1aXoucHJvdG90eXBlLmFuYWx5emVSZXNwb25zZSA9IGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSkge1xuICAgIHZhciBuYW1lO1xuICAgIHZhciB0aW1lO1xuXG4gICAgaWYgKGVycm9yKSB7XG4gICAgICAgIGlmIChyZXNwb25zZS5tZXNzYWdlKSB7XG4gICAgICAgICAgICB0aGlzLnByaW50LmdhbWVMb3N0KHJlc3BvbnNlLm1lc3NhZ2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIChcIk5ldHdvcmsgZXJyb3IgXCIgKyBlcnJvcik7XG4gICAgICAgIH1cblxuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChyZXNwb25zZS5uZXh0VVJMKSB7XG4gICAgICAgICAgICB0aGlzLmdldFF1ZXN0aW9uKHJlc3BvbnNlLm5leHRVUkwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGltZSA9IHRoaXMudGltZXIuZ2V0VG90YWxUaW1lKCk7XG4gICAgICAgICAgICBuYW1lID0gdGhpcy5uaWNrbmFtZTtcbiAgICAgICAgICAgIHRoaXMuc2F2ZUhpZ2hTY29yZShuYW1lLCB0aW1lKTtcbiAgICAgICAgICAgIHRoaXMucHJpbnQuZ2FtZVdvbihuYW1lLCB0aW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblF1aXoucHJvdG90eXBlLnNhdmVIaWdoU2NvcmUgPSBmdW5jdGlvbihuYW1lLCB0aW1lKSB7XG4gICAgdmFyIGhpZ2hTY29yZXM7XG5cbiAgICBoaWdoU2NvcmVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hTY29yZXNcIikpO1xuICAgIGlmIChoaWdoU2NvcmVzKSB7XG4gICAgICAgIHRoaXMuc2F2ZVRvU2NvcmVCb2FyZChuYW1lLCB0aW1lLCBoaWdoU2NvcmVzKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY3JlYXRlU2NvcmVCb2FyZChuYW1lLCB0aW1lKTtcbiAgICB9XG59O1xuXG5RdWl6LnByb3RvdHlwZS5jcmVhdGVTY29yZUJvYXJkID0gZnVuY3Rpb24obmFtZSwgdGltZSkge1xuICAgIHZhciBoaWdoU2NvcmVzO1xuXG4gICAgaGlnaFNjb3JlcyA9IFtcbiAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifVxuICAgIF07XG4gICAgaGlnaFNjb3Jlc1swXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgaGlnaFNjb3Jlc1swXS50aW1lID0gdGltZTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hTY29yZXNcIiwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlcykpO1xufTtcblxuUXVpei5wcm90b3R5cGUuc2F2ZVRvU2NvcmVCb2FyZCA9IGZ1bmN0aW9uKG5hbWUsIHRpbWUsIGhpZ2hTY29yZXMpIHtcbiAgICB2YXIgaTtcbiAgICB2YXIgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCA1OyBpICs9IDEpIHtcbiAgICAgICAgaWYgKHRpbWUgPCBOdW1iZXIoaGlnaFNjb3Jlc1tpXS50aW1lKSkge1xuICAgICAgICAgICAgZm9yIChqID0gMzsgaiA+PSBpOyBqIC09IDEpIHtcbiAgICAgICAgICAgICAgICBoaWdoU2NvcmVzW2ogKyAxXS5uaWNrbmFtZSA9IGhpZ2hTY29yZXNbal0ubmlja25hbWU7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3Jlc1tqICsgMV0udGltZSA9IGhpZ2hTY29yZXNbal0udGltZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaGlnaFNjb3Jlc1tpXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgICAgICBoaWdoU2NvcmVzW2ldLnRpbWUgPSB0aW1lO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJoaWdoU2NvcmVzXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hTY29yZXMpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9IGVsc2UgaWYgKGhpZ2hTY29yZXNbaV0udGltZSA9PT0gXCJcIikge1xuICAgICAgICAgICAgaGlnaFNjb3Jlc1tpXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgICAgICBoaWdoU2NvcmVzW2ldLnRpbWUgPSB0aW1lO1xuICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJoaWdoU2NvcmVzXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hTY29yZXMpKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWl6O1xuIiwiZnVuY3Rpb24gVGltZXIoY2FsbGJhY2spIHtcbiAgICB2YXIgdGltZTtcbiAgICB2YXIgdG90YWxUaW1lID0gMDtcbiAgICB2YXIgdGltZXJJbnRlcnZhbDtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5zdGFydFRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWUgPSAyMDtcbiAgICAgICAgdGltZXJJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLnVwZGF0ZVRpbWVyLCAxMDApO1xuICAgIH07XG5cbiAgICB0aGlzLnN0b3BUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0b3RhbFRpbWUgKz0gMjAgLSB0aW1lO1xuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aW1lckludGVydmFsKTtcbiAgICB9O1xuXG4gICAgdGhpcy51cGRhdGVUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGltZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVQYXJhZ3JhcGhcIik7XG4gICAgICAgIHRpbWUgLT0gMC4xO1xuICAgICAgICBpZiAodGltZSA8PSAwKSB7XG4gICAgICAgICAgICBfdGhpcy5zdG9wVGltZXIoKTtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gdGltZS50b0ZpeGVkKDEpO1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gdGltZS50b0ZpeGVkKDEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0VG90YWxUaW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0b3RhbFRpbWUudG9GaXhlZCgyKTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xuIiwiZnVuY3Rpb24gcmVxdWVzdChjb25maWcsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcS5zdGF0dXMsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJlcS5vcGVuKGNvbmZpZy5tZXRob2QsIGNvbmZpZy51cmwpO1xuICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIGNvbmZpZy5jb250ZW50VHlwZSk7XG4gICAgcmVxLnNlbmQoY29uZmlnLmFuc3dlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuIiwidmFyIFF1aXogPSByZXF1aXJlKFwiLi9RdWl6XCIpO1xuXG52YXIgdGVzdCA9IG5ldyBRdWl6KCk7XG4iXX0=
