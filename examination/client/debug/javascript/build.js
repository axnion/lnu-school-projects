(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function Print() {

    this.question = function(question) {
        var container = document.querySelector("#questionContainer");
        var p = container.firstElementChild;
        p.textContent = question;
    };




    this.answer = function(alternatives) {
        var form;
        if (alternatives) {

            this.addTemplate("alternativeAnswerTemplate", "formContainer");
            form = document.querySelector("#alternativeAnswerForm");
            var lables = form.querySelectorAll("lable");
            var textNode;

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
        var form = document.querySelector("#nicknameForm");

        return form;
    };




    this.gameWon = function() {
        this.addTemplate("gameWonTemplate", "formContainer");
        var highscore = JSON.parse(localStorage.getItem("highscore"));
        var scoreBoard = document.querySelector("#scoreBoard");
        var p = scoreBoard.querySelectorAll("p");
        var str;
        var textNode;
        for (var i = 0; i < highscore.length; i += 1) {
            str = (i + 1) + ". ";
            str += "Name: " + highscore[i].nickname + " ";
            str += "Time: " + highscore[i].time;
            textNode = document.createTextNode(str);
            p[i].appendChild(textNode);
        }
    };




    this.gameLost = function(message) {
        this.addTemplate("gameLostTemplate", "formContainer");
        var formContainer = document.querySelector("#formContainer");
        var messageTag = document.querySelector("#message");
        var textNode = document.createTextNode(message);
        formContainer.firstElementChild.remove();
        messageTag.appendChild(textNode);
    };




    this.addTemplate = function(templateName, containerName) {
        var container = document.querySelector("#" + containerName);
        var template = document.querySelector("#" + templateName);
        var form = document.importNode(template.content, true);

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
    var form = this.print.nicknameForm();
    var message = document.querySelector("#nickMessage"); //TODO Kom på något bra sätt att lösa detta
    var _this = this;

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
    var ajaxConfig = {
        method: "GET",
        url: newURL || "http://vhost3.lnu.se:20080/question/1"
    };
    var _this = this;

    ajax.request(ajaxConfig, function(error, data) {
        var response = JSON.parse(data);
        _this.print.question(response.question);
        _this.postAnswer(response.nextURL, response.alternatives);
        _this.timer.startTimer();
    });
};




Quiz.prototype.postAnswer = function(newURL, alternatives) {
    var _this = this;
    var myAnswer;
    var answer = {};
    var form;

    form = this.print.answer(alternatives);

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        _this.timer.stopTimer();

        if (alternatives) {
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

        var ajaxConfig = {
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
    var time = this.timer.getTotalTime();
    var name = this.nickname;
    var highscore = JSON.parse(localStorage.getItem("highscore"));
    if (!highscore) {
        highscore = [
            {nickname: "", time: ""},
            {nickname: "", time: ""},
            {nickname: "", time: ""},
            {nickname: "", time: ""},
            {nickname: "", time: ""}
        ];
        highscore[0].nickname = name;
        highscore[0].time = time;
        localStorage.setItem("highscore", JSON.stringify(highscore));
    } else {
        for (var i = 0; i < 5; i += 1) {
            if (time < Number(highscore[i].time)) {
                for (var j = 3; j >= i; j -= 1) {
                    highscore[j + 1].nickname = highscore[j].nickname;
                    highscore[j + 1].time = highscore[j].time;
                }

                highscore[i].nickname = name;
                highscore[i].time = time;
                localStorage.setItem("highscore", JSON.stringify(highscore));
                break;
            } else if (highscore[i].time === "") {
                highscore[i].nickname = name;
                highscore[i].time = time;
                localStorage.setItem("highscore", JSON.stringify(highscore));
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHJpbnQuanMiLCJjbGllbnQvc291cmNlL2pzL1F1aXouanMiLCJjbGllbnQvc291cmNlL2pzL1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hamF4LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImZ1bmN0aW9uIFByaW50KCkge1xuXG4gICAgdGhpcy5xdWVzdGlvbiA9IGZ1bmN0aW9uKHF1ZXN0aW9uKSB7XG4gICAgICAgIHZhciBjb250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3F1ZXN0aW9uQ29udGFpbmVyXCIpO1xuICAgICAgICB2YXIgcCA9IGNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZDtcbiAgICAgICAgcC50ZXh0Q29udGVudCA9IHF1ZXN0aW9uO1xuICAgIH07XG5cblxuXG5cbiAgICB0aGlzLmFuc3dlciA9IGZ1bmN0aW9uKGFsdGVybmF0aXZlcykge1xuICAgICAgICB2YXIgZm9ybTtcbiAgICAgICAgaWYgKGFsdGVybmF0aXZlcykge1xuXG4gICAgICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwiYWx0ZXJuYXRpdmVBbnN3ZXJUZW1wbGF0ZVwiLCBcImZvcm1Db250YWluZXJcIik7XG4gICAgICAgICAgICBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNhbHRlcm5hdGl2ZUFuc3dlckZvcm1cIik7XG4gICAgICAgICAgICB2YXIgbGFibGVzID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwibGFibGVcIik7XG4gICAgICAgICAgICB2YXIgdGV4dE5vZGU7XG5cbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDEpO1xuICAgICAgICAgICAgbGFibGVzWzBdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDIpO1xuICAgICAgICAgICAgbGFibGVzWzFdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDMpO1xuICAgICAgICAgICAgbGFibGVzWzJdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDQpO1xuICAgICAgICAgICAgbGFibGVzWzNdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWRkVGVtcGxhdGUoXCJ0ZXh0QW5zd2VyVGVtcGxhdGVcIiwgXCJmb3JtQ29udGFpbmVyXCIpO1xuICAgICAgICAgICAgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dEFuc3dlckZvcm1cIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9ybTtcbiAgICB9O1xuXG5cblxuXG4gICAgdGhpcy5uaWNrbmFtZUZvcm0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcIm5pY2tuYW1lVGVtcGxhdGVcIiwgXCJmb3JtQ29udGFpbmVyXCIpO1xuICAgICAgICB2YXIgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmlja25hbWVGb3JtXCIpO1xuXG4gICAgICAgIHJldHVybiBmb3JtO1xuICAgIH07XG5cblxuXG5cbiAgICB0aGlzLmdhbWVXb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImdhbWVXb25UZW1wbGF0ZVwiLCBcImZvcm1Db250YWluZXJcIik7XG4gICAgICAgIHZhciBoaWdoc2NvcmUgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaHNjb3JlXCIpKTtcbiAgICAgICAgdmFyIHNjb3JlQm9hcmQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3Njb3JlQm9hcmRcIik7XG4gICAgICAgIHZhciBwID0gc2NvcmVCb2FyZC5xdWVyeVNlbGVjdG9yQWxsKFwicFwiKTtcbiAgICAgICAgdmFyIHN0cjtcbiAgICAgICAgdmFyIHRleHROb2RlO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhpZ2hzY29yZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgc3RyID0gKGkgKyAxKSArIFwiLiBcIjtcbiAgICAgICAgICAgIHN0ciArPSBcIk5hbWU6IFwiICsgaGlnaHNjb3JlW2ldLm5pY2tuYW1lICsgXCIgXCI7XG4gICAgICAgICAgICBzdHIgKz0gXCJUaW1lOiBcIiArIGhpZ2hzY29yZVtpXS50aW1lO1xuICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdHIpO1xuICAgICAgICAgICAgcFtpXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cblxuXG4gICAgdGhpcy5nYW1lTG9zdCA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImdhbWVMb3N0VGVtcGxhdGVcIiwgXCJmb3JtQ29udGFpbmVyXCIpO1xuICAgICAgICB2YXIgZm9ybUNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm9ybUNvbnRhaW5lclwiKTtcbiAgICAgICAgdmFyIG1lc3NhZ2VUYWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lc3NhZ2VcIik7XG4gICAgICAgIHZhciB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpO1xuICAgICAgICBmb3JtQ29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkLnJlbW92ZSgpO1xuICAgICAgICBtZXNzYWdlVGFnLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICB9O1xuXG5cblxuXG4gICAgdGhpcy5hZGRUZW1wbGF0ZSA9IGZ1bmN0aW9uKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgICAgICB2YXIgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIGNvbnRhaW5lck5hbWUpO1xuICAgICAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGVtcGxhdGVOYW1lKTtcbiAgICAgICAgdmFyIGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByaW50O1xuIiwidmFyIGFqYXggPSByZXF1aXJlKFwiLi9hamF4XCIpO1xudmFyIFRpbWVyID0gcmVxdWlyZShcIi4vVGltZXJcIik7XG52YXIgUHJpbnQgPSByZXF1aXJlKFwiLi9QcmludFwiKTtcblxuZnVuY3Rpb24gUXVpeigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMucHJpbnQgPSBuZXcgUHJpbnQoKTtcbiAgICB0aGlzLnRpbWVyID0gbmV3IFRpbWVyKGZ1bmN0aW9uKCkge1xuICAgICAgICBfdGhpcy5wcmludC5nYW1lTG9zdChcIllvdSByYW4gb3V0IG9mIHRpbWVcIik7XG4gICAgfSk7XG5cbiAgICB0aGlzLm5pY2tuYW1lID0gdGhpcy5nZXROaWNrbmFtZSgpO1xufVxuXG5cblxuXG5RdWl6LnByb3RvdHlwZS5nZXROaWNrbmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBmb3JtID0gdGhpcy5wcmludC5uaWNrbmFtZUZvcm0oKTtcbiAgICB2YXIgbWVzc2FnZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmlja01lc3NhZ2VcIik7IC8vVE9ETyBLb20gcMOlIG7DpWdvdCBicmEgc8OkdHQgYXR0IGzDtnNhIGRldHRhXG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfdGhpcy5uaWNrbmFtZSA9IGZvcm0uZmlyc3RFbGVtZW50Q2hpbGQudmFsdWU7XG4gICAgICAgIGlmIChfdGhpcy5uaWNrbmFtZSkge1xuICAgICAgICAgICAgbWVzc2FnZS5yZW1vdmUoKTtcbiAgICAgICAgICAgIGZvcm0ucmVtb3ZlKCk7XG4gICAgICAgICAgICBfdGhpcy5nZXRRdWVzdGlvbigpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFwiUGxlYXNlIHdyaXRlIHlvdXIgbmlja25hbWVcIjtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuXG5cblxuUXVpei5wcm90b3R5cGUuZ2V0UXVlc3Rpb24gPSBmdW5jdGlvbihuZXdVUkwpIHtcbiAgICB2YXIgYWpheENvbmZpZyA9IHtcbiAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICB1cmw6IG5ld1VSTCB8fCBcImh0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzFcIlxuICAgIH07XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGFqYXgucmVxdWVzdChhamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICBfdGhpcy5wcmludC5xdWVzdGlvbihyZXNwb25zZS5xdWVzdGlvbik7XG4gICAgICAgIF90aGlzLnBvc3RBbnN3ZXIocmVzcG9uc2UubmV4dFVSTCwgcmVzcG9uc2UuYWx0ZXJuYXRpdmVzKTtcbiAgICAgICAgX3RoaXMudGltZXIuc3RhcnRUaW1lcigpO1xuICAgIH0pO1xufTtcblxuXG5cblxuUXVpei5wcm90b3R5cGUucG9zdEFuc3dlciA9IGZ1bmN0aW9uKG5ld1VSTCwgYWx0ZXJuYXRpdmVzKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgbXlBbnN3ZXI7XG4gICAgdmFyIGFuc3dlciA9IHt9O1xuICAgIHZhciBmb3JtO1xuXG4gICAgZm9ybSA9IHRoaXMucHJpbnQuYW5zd2VyKGFsdGVybmF0aXZlcyk7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBfdGhpcy50aW1lci5zdG9wVGltZXIoKTtcblxuICAgICAgICBpZiAoYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgICAgICB2YXIgYnV0dG9ucyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbChcImlucHV0XCIpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aCAtIDE7IGkgKz0gMSkge1xuICAgICAgICAgICAgICAgIGlmIChidXR0b25zW2ldLmNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbXlBbnN3ZXIgPSBidXR0b25zW2ldLnZhbHVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG15QW5zd2VyID0gZm9ybS5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFuc3dlciA9IHtcbiAgICAgICAgICAgIGFuc3dlcjogbXlBbnN3ZXJcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgYWpheENvbmZpZyA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IG5ld1VSTCxcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgIGFuc3dlcjogSlNPTi5zdHJpbmdpZnkoYW5zd2VyKVxuICAgICAgICB9O1xuXG4gICAgICAgIGFqYXgucmVxdWVzdChhamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICAgICAgX3RoaXMuYW5hbHl6ZVJlc3BvbnNlKGVycm9yLCBKU09OLnBhcnNlKGRhdGEpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICB9KTtcbn07XG5cblxuXG5cblF1aXoucHJvdG90eXBlLmFuYWx5emVSZXNwb25zZSA9IGZ1bmN0aW9uKGVycm9yLCByZXNwb25zZSkge1xuICAgIGlmIChlcnJvcikge1xuICAgICAgICBpZiAocmVzcG9uc2UubWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5wcmludC5nYW1lTG9zdChyZXNwb25zZS5tZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAoXCJOZXR3b3JrIGVycm9yIFwiICsgZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVzcG9uc2UubmV4dFVSTCkge1xuICAgICAgICAgICAgdGhpcy5nZXRRdWVzdGlvbihyZXNwb25zZS5uZXh0VVJMKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2F2ZUhpZ2hzY29yZSgpO1xuICAgICAgICAgICAgdGhpcy5wcmludC5nYW1lV29uKCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5cblxuXG5RdWl6LnByb3RvdHlwZS5zYXZlSGlnaHNjb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLnRpbWVyLmdldFRvdGFsVGltZSgpO1xuICAgIHZhciBuYW1lID0gdGhpcy5uaWNrbmFtZTtcbiAgICB2YXIgaGlnaHNjb3JlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hzY29yZVwiKSk7XG4gICAgaWYgKCFoaWdoc2NvcmUpIHtcbiAgICAgICAgaGlnaHNjb3JlID0gW1xuICAgICAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAgICAgIHtuaWNrbmFtZTogXCJcIiwgdGltZTogXCJcIn0sXG4gICAgICAgICAgICB7bmlja25hbWU6IFwiXCIsIHRpbWU6IFwiXCJ9LFxuICAgICAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAgICAgIHtuaWNrbmFtZTogXCJcIiwgdGltZTogXCJcIn1cbiAgICAgICAgXTtcbiAgICAgICAgaGlnaHNjb3JlWzBdLm5pY2tuYW1lID0gbmFtZTtcbiAgICAgICAgaGlnaHNjb3JlWzBdLnRpbWUgPSB0aW1lO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hzY29yZVwiLCBKU09OLnN0cmluZ2lmeShoaWdoc2NvcmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHRpbWUgPCBOdW1iZXIoaGlnaHNjb3JlW2ldLnRpbWUpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDM7IGogPj0gaTsgaiAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtqICsgMV0ubmlja25hbWUgPSBoaWdoc2NvcmVbal0ubmlja25hbWU7XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtqICsgMV0udGltZSA9IGhpZ2hzY29yZVtqXS50aW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtpXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgaGlnaHNjb3JlW2ldLnRpbWUgPSB0aW1lO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaHNjb3JlXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hzY29yZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoaWdoc2NvcmVbaV0udGltZSA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtpXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgaGlnaHNjb3JlW2ldLnRpbWUgPSB0aW1lO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaHNjb3JlXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hzY29yZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWl6O1xuIiwiZnVuY3Rpb24gVGltZXIoY2FsbGJhY2spIHtcbiAgICB2YXIgdGltZTtcbiAgICB2YXIgdG90YWxUaW1lID0gMDtcbiAgICB2YXIgdGltZXJJbnRlcnZhbDtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5zdGFydFRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWUgPSAyMDtcbiAgICAgICAgdGltZXJJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLnVwZGF0ZVRpbWVyLCAxMDApO1xuICAgIH07XG5cbiAgICB0aGlzLnN0b3BUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0b3RhbFRpbWUgKz0gMjAgLSB0aW1lO1xuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aW1lckludGVydmFsKTtcbiAgICB9O1xuXG4gICAgdGhpcy51cGRhdGVUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdGltZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVcIik7XG4gICAgICAgIHRpbWUgLT0gMC4xO1xuICAgICAgICBpZiAodGltZSA8PSAwLjEpIHtcbiAgICAgICAgICAgIF90aGlzLnN0b3BUaW1lcigpO1xuICAgICAgICAgICAgdGltZXIudGV4dENvbnRlbnQgPSB0aW1lLnRvRml4ZWQoMSk7XG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGltZXIudGV4dENvbnRlbnQgPSB0aW1lLnRvRml4ZWQoMSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5nZXRUb3RhbFRpbWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRvdGFsVGltZS50b0ZpeGVkKDIpO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZXI7XG4iLCJmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZywgY2FsbGJhY2spIHtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChyZXEuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2socmVxLnN0YXR1cywgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmVxLm9wZW4oY29uZmlnLm1ldGhvZCwgY29uZmlnLnVybCk7XG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgY29uZmlnLmNvbnRlbnRUeXBlKTtcbiAgICByZXEuc2VuZChjb25maWcuYW5zd2VyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMucmVxdWVzdCA9IHJlcXVlc3Q7XG4iLCJ2YXIgUXVpeiA9IHJlcXVpcmUoXCIuL1F1aXpcIik7XG5cbnZhciB0ZXN0ID0gbmV3IFF1aXooKTtcbiJdfQ==
