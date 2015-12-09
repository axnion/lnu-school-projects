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
        var highScore;
        var scoreBoard;
        var heading;
        var paragraphs;
        var str;
        var textNode;
        var i;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHJpbnQuanMiLCJjbGllbnQvc291cmNlL2pzL1F1aXouanMiLCJjbGllbnQvc291cmNlL2pzL1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hamF4LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIFByaW50KCkge1xuXG4gICAgdGhpcy5xdWVzdGlvbiA9IGZ1bmN0aW9uKHF1ZXN0aW9uKSB7XG4gICAgICAgIHZhciBxdWVzdGlvblBhcmFncmFwaDtcblxuICAgICAgICBxdWVzdGlvblBhcmFncmFwaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcXVlc3Rpb25QYXJhZ3JhcGhcIik7XG4gICAgICAgIHF1ZXN0aW9uUGFyYWdyYXBoLnRleHRDb250ZW50ID0gcXVlc3Rpb247XG4gICAgfTtcblxuICAgIHRoaXMuYW5zd2VyID0gZnVuY3Rpb24oYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgIHZhciBmb3JtO1xuICAgICAgICB2YXIgbGFibGVzO1xuICAgICAgICB2YXIgdGV4dE5vZGU7XG5cbiAgICAgICAgaWYgKGFsdGVybmF0aXZlcykge1xuXG4gICAgICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwiYWx0ZXJuYXRpdmVBbnN3ZXJUZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgICAgIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FsdGVybmF0aXZlQW5zd2VyRm9ybVwiKTtcbiAgICAgICAgICAgIGxhYmxlcyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbChcImxhYmxlXCIpO1xuXG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQxKTtcbiAgICAgICAgICAgIGxhYmxlc1swXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQyKTtcbiAgICAgICAgICAgIGxhYmxlc1sxXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQzKTtcbiAgICAgICAgICAgIGxhYmxlc1syXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQ0KTtcbiAgICAgICAgICAgIGxhYmxlc1szXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwidGV4dEFuc3dlclRlbXBsYXRlXCIsIFwiYm90dG9tQ29udGFpbmVyXCIpO1xuICAgICAgICAgICAgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dEFuc3dlckZvcm1cIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9ybTtcbiAgICB9O1xuXG4gICAgdGhpcy5uaWNrbmFtZUZvcm0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcIm5pY2tuYW1lVGVtcGxhdGVcIiwgXCJib3R0b21Db250YWluZXJcIik7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25pY2tuYW1lRm9ybVwiKTtcbiAgICB9O1xuXG4gICAgdGhpcy5nYW1lV29uID0gZnVuY3Rpb24obmFtZSwgdGltZSkge1xuICAgICAgICB2YXIgaGlnaFNjb3JlO1xuICAgICAgICB2YXIgc2NvcmVCb2FyZDtcbiAgICAgICAgdmFyIGhlYWRpbmc7XG4gICAgICAgIHZhciBwYXJhZ3JhcGhzO1xuICAgICAgICB2YXIgc3RyO1xuICAgICAgICB2YXIgdGV4dE5vZGU7XG4gICAgICAgIHZhciBpO1xuXG4gICAgICAgIHRoaXMuYWRkVGVtcGxhdGUoXCJnYW1lV29uVGVtcGxhdGVcIiwgXCJib3R0b21Db250YWluZXJcIik7XG4gICAgICAgIGhpZ2hTY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWdoU2NvcmVcIikpO1xuICAgICAgICBzY29yZUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZUJvYXJkXCIpO1xuICAgICAgICBwYXJhZ3JhcGhzID0gc2NvcmVCb2FyZC5xdWVyeVNlbGVjdG9yQWxsKFwicFwiKTtcbiAgICAgICAgaGVhZGluZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyU2NvcmVcIik7XG5cbiAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIk5pY2tuYW1lOiBcIiArIG5hbWUgKyBcIiBUaW1lOiBcIiArIHRpbWUpO1xuICAgICAgICBoZWFkaW5nLmFwcGVuZENoaWxkKHRleHROb2RlKTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaGlnaFNjb3JlLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBzdHIgPSAoaSArIDEpICsgXCIuIFwiO1xuICAgICAgICAgICAgc3RyICs9IFwiTmFtZTogXCIgKyBoaWdoU2NvcmVbaV0ubmlja25hbWUgKyBcIiBcIjtcbiAgICAgICAgICAgIHN0ciArPSBcIlRpbWU6IFwiICsgaGlnaFNjb3JlW2ldLnRpbWU7XG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0cik7XG4gICAgICAgICAgICBwYXJhZ3JhcGhzW2ldLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmdhbWVMb3N0ID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICB2YXIgcGFyYWdyYXBoO1xuICAgICAgICB2YXIgdGV4dE5vZGU7XG5cbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImdhbWVMb3N0VGVtcGxhdGVcIiwgXCJib3R0b21Db250YWluZXJcIik7XG4gICAgICAgIHBhcmFncmFwaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVwiKTtcbiAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKTtcbiAgICAgICAgcGFyYWdyYXBoLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICB9O1xuXG4gICAgdGhpcy5hZGRUZW1wbGF0ZSA9IGZ1bmN0aW9uKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgICAgICB2YXIgY29udGFpbmVyO1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBmb3JtO1xuXG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBjb250YWluZXJOYW1lKTtcbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGVtcGxhdGVOYW1lKTtcbiAgICAgICAgZm9ybSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJpbnQ7XG4iLCJ2YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG52YXIgVGltZXIgPSByZXF1aXJlKFwiLi9UaW1lclwiKTtcbnZhciBQcmludCA9IHJlcXVpcmUoXCIuL1ByaW50XCIpO1xuXG5mdW5jdGlvbiBRdWl6KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5wcmludCA9IG5ldyBQcmludCgpO1xuICAgIHRoaXMudGltZXIgPSBuZXcgVGltZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLnByaW50LmdhbWVMb3N0KFwiWW91IHJhbiBvdXQgb2YgdGltZVwiKTtcbiAgICB9KTtcblxuICAgIHRoaXMubmlja25hbWUgPSB0aGlzLmdldE5pY2tuYW1lKCk7XG59XG5cblF1aXoucHJvdG90eXBlLmdldE5pY2tuYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgZm9ybTtcbiAgICB2YXIgbWVzc2FnZTtcblxuICAgIGZvcm0gPSB0aGlzLnByaW50Lm5pY2tuYW1lRm9ybSgpO1xuICAgIG1lc3NhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25pY2tNZXNzYWdlXCIpOyAvL1RPRE8gS29tIHDDpSBuw6Vnb3QgYnJhIHPDpHR0IGF0dCBsw7ZzYSBkZXR0YVxuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uIHNldE5pY2tuYW1lKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIF90aGlzLm5pY2tuYW1lID0gZm9ybS5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcbiAgICAgICAgaWYgKF90aGlzLm5pY2tuYW1lKSB7XG4gICAgICAgICAgICBmb3JtLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgc2V0Tmlja25hbWUpO1xuICAgICAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICAgICAgICAgIF90aGlzLmdldFF1ZXN0aW9uKCk7XG4gICAgICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIlBsZWFzZSB3cml0ZSB5b3VyIG5pY2tuYW1lXCI7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblF1aXoucHJvdG90eXBlLmdldFF1ZXN0aW9uID0gZnVuY3Rpb24obmV3VVJMKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgYWpheENvbmZpZztcbiAgICB2YXIgcmVzcG9uc2U7XG5cbiAgICBhamF4Q29uZmlnID0ge1xuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIHVybDogbmV3VVJMIHx8IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiXG4gICAgfTtcblxuICAgIGFqYXgucmVxdWVzdChhamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAoXCJOZXR3b3JrIGVycm9yIFwiICsgZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgX3RoaXMucHJpbnQucXVlc3Rpb24ocmVzcG9uc2UucXVlc3Rpb24pO1xuICAgICAgICAgICAgX3RoaXMudGltZXIuc3RhcnRUaW1lcigpO1xuICAgICAgICAgICAgX3RoaXMucG9zdEFuc3dlcihyZXNwb25zZS5uZXh0VVJMLCByZXNwb25zZS5hbHRlcm5hdGl2ZXMpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5wb3N0QW5zd2VyID0gZnVuY3Rpb24obmV3VVJMLCBhbHRlcm5hdGl2ZXMpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBhbnN3ZXI7XG4gICAgdmFyIGZvcm07XG4gICAgdmFyIGFqYXhDb25maWc7XG5cbiAgICBmb3JtID0gdGhpcy5wcmludC5hbnN3ZXIoYWx0ZXJuYXRpdmVzKTtcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbiBzdWJtaXRBbnN3ZXIoZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3RoaXMudGltZXIuc3RvcFRpbWVyKCk7XG5cbiAgICAgICAgYW5zd2VyID0gX3RoaXMuZ2V0QW5zd2VyKGFsdGVybmF0aXZlcywgZm9ybSk7XG4gICAgICAgIGFqYXhDb25maWcgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBuZXdVUkwsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBhbnN3ZXI6IEpTT04uc3RyaW5naWZ5KGFuc3dlcilcbiAgICAgICAgfTtcbiAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICAgICAgYWpheC5yZXF1ZXN0KGFqYXhDb25maWcsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XG4gICAgICAgICAgICBfdGhpcy5hbmFseXplUmVzcG9uc2UoZXJyb3IsIEpTT04ucGFyc2UoZGF0YSkpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cblF1aXoucHJvdG90eXBlLmdldEFuc3dlciA9IGZ1bmN0aW9uKGFsdGVybmF0aXZlcywgZm9ybSkge1xuICAgIHZhciBhbnN3ZXI7XG4gICAgdmFyIGFuc3dlck9iajtcbiAgICB2YXIgYnV0dG9ucztcbiAgICB2YXIgaTtcblxuICAgIGlmIChhbHRlcm5hdGl2ZXMpIHtcbiAgICAgICAgYnV0dG9ucyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGggLSAxOyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmIChidXR0b25zW2ldLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICBhbnN3ZXIgPSBidXR0b25zW2ldLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYW5zd2VyID0gZm9ybS5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcbiAgICB9XG5cbiAgICBhbnN3ZXJPYmogPSB7XG4gICAgICAgIGFuc3dlcjogYW5zd2VyXG4gICAgfTtcblxuICAgIHJldHVybiBhbnN3ZXJPYmo7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5hbmFseXplUmVzcG9uc2UgPSBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICB2YXIgbmFtZTtcbiAgICB2YXIgdGltZTtcblxuICAgIGlmIChlcnJvcikge1xuICAgICAgICBpZiAocmVzcG9uc2UubWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5wcmludC5nYW1lTG9zdChyZXNwb25zZS5tZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAoXCJOZXR3b3JrIGVycm9yIFwiICsgZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVzcG9uc2UubmV4dFVSTCkge1xuICAgICAgICAgICAgdGhpcy5nZXRRdWVzdGlvbihyZXNwb25zZS5uZXh0VVJMKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWUgPSB0aGlzLnRpbWVyLmdldFRvdGFsVGltZSgpO1xuICAgICAgICAgICAgbmFtZSA9IHRoaXMubmlja25hbWU7XG4gICAgICAgICAgICB0aGlzLnNhdmVIaWdoU2NvcmUobmFtZSwgdGltZSk7XG4gICAgICAgICAgICB0aGlzLnByaW50LmdhbWVXb24obmFtZSwgdGltZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5RdWl6LnByb3RvdHlwZS5zYXZlSGlnaFNjb3JlID0gZnVuY3Rpb24obmFtZSwgdGltZSkge1xuICAgIHZhciBoaWdoU2NvcmU7XG4gICAgdmFyIGk7XG4gICAgdmFyIGo7XG5cbiAgICBoaWdoU2NvcmUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaFNjb3JlXCIpKTtcbiAgICBpZiAoIWhpZ2hTY29yZSkge1xuICAgICAgICBoaWdoU2NvcmUgPSBbXG4gICAgICAgICAgICB7bmlja25hbWU6IFwiXCIsIHRpbWU6IFwiXCJ9LFxuICAgICAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAgICAgIHtuaWNrbmFtZTogXCJcIiwgdGltZTogXCJcIn0sXG4gICAgICAgICAgICB7bmlja25hbWU6IFwiXCIsIHRpbWU6IFwiXCJ9LFxuICAgICAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifVxuICAgICAgICBdO1xuICAgICAgICBoaWdoU2NvcmVbMF0ubmlja25hbWUgPSBuYW1lO1xuICAgICAgICBoaWdoU2NvcmVbMF0udGltZSA9IHRpbWU7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaFNjb3JlXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hTY29yZSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCA1OyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmICh0aW1lIDwgTnVtYmVyKGhpZ2hTY29yZVtpXS50aW1lKSkge1xuICAgICAgICAgICAgICAgIGZvciAoaiA9IDM7IGogPj0gaTsgaiAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hTY29yZVtqICsgMV0ubmlja25hbWUgPSBoaWdoU2NvcmVbal0ubmlja25hbWU7XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hTY29yZVtqICsgMV0udGltZSA9IGhpZ2hTY29yZVtqXS50aW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGhpZ2hTY29yZVtpXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlW2ldLnRpbWUgPSB0aW1lO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaFNjb3JlXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hTY29yZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoaWdoU2NvcmVbaV0udGltZSA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGhpZ2hTY29yZVtpXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgaGlnaFNjb3JlW2ldLnRpbWUgPSB0aW1lO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaFNjb3JlXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hTY29yZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWl6O1xuIiwiZnVuY3Rpb24gVGltZXIoY2FsbGJhY2spIHtcbiAgICB2YXIgdGltZTtcbiAgICB2YXIgdG90YWxUaW1lID0gMDtcbiAgICB2YXIgdGltZXJJbnRlcnZhbDtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5zdGFydFRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWUgPSAyMDtcbiAgICAgICAgdGltZXJJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLnVwZGF0ZVRpbWVyLCAxMDApO1xuICAgIH07XG5cbiAgICB0aGlzLnN0b3BUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0b3RhbFRpbWUgKz0gMjAgLSB0aW1lO1xuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aW1lckludGVydmFsKTtcbiAgICB9O1xuXG4gICAgdGhpcy51cGRhdGVUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGltZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVQYXJhZ3JhcGhcIik7XG4gICAgICAgIHRpbWUgLT0gMC4xO1xuICAgICAgICBpZiAodGltZSA8PSAwKSB7XG4gICAgICAgICAgICBfdGhpcy5zdG9wVGltZXIoKTtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gdGltZS50b0ZpeGVkKDEpO1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gdGltZS50b0ZpeGVkKDEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0VG90YWxUaW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0b3RhbFRpbWUudG9GaXhlZCgyKTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xuIiwiZnVuY3Rpb24gcmVxdWVzdChjb25maWcsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcS5zdGF0dXMsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJlcS5vcGVuKGNvbmZpZy5tZXRob2QsIGNvbmZpZy51cmwpO1xuICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIGNvbmZpZy5jb250ZW50VHlwZSk7XG4gICAgcmVxLnNlbmQoY29uZmlnLmFuc3dlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuIiwidmFyIFF1aXogPSByZXF1aXJlKFwiLi9RdWl6XCIpO1xuXG52YXIgdGVzdCA9IG5ldyBRdWl6KCk7XG4iXX0=
