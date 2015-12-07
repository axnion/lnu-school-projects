(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ajax = require("./ajax");
var Timer = require("./Timer");

function Quiz() {
    var _this = this;
    this.nickname = this.getNickname();
    this.timer = new Timer(function() {
        _this.lostGame("You ran out of time");
    });
}

Quiz.prototype.getNickname = function() {
    this.addTemplate("nicknameTemplate");
    var form = document.querySelector("#nicknameForm");
    var message = document.querySelector("#nickMessage");
    var _this = this;

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        _this.nickname = form.firstElementChild.value;
        if (_this.nickname) {
            _this.nickname = form.firstElementChild.value;
            message.remove();
            form.remove();
            _this.getQuestion();
        } else {

            message.textContent = "Please write your nickname";
        }
    });
};

Quiz.prototype.addTemplate = function(templateName) {
    var formContainer = document.querySelector("#formContainer");
    var template = document.querySelector("#" + templateName);
    var form = document.importNode(template.content, true);

    formContainer.appendChild(form);
};

Quiz.prototype.getQuestion = function(newURL) {
    var ajaxConfig = {
        method: "GET",
        url: newURL || "http://vhost3.lnu.se:20080/question/1"
    };
    var _this = this;

    ajax.request(ajaxConfig, function(error, data) {
        var response = JSON.parse(data);
        _this.printQuestion(response.question);
        _this.postAnswer(response.nextURL, response.alternatives);
    });
};

Quiz.prototype.postAnswer = function(newURL, alternatives) {
    var _this = this;
    var myAnswer;
    var answer = {};
    var form;

    if (alternatives) {
        this.addTemplate("alternativeAnswerTemplate");
        form = document.querySelector("#alternativeAnswerForm");
        this.printAlternatives(alternatives);
    } else {
        this.addTemplate("textAnswerTemplate");
        form = document.querySelector("#textAnswerForm");
    }

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
            var response = JSON.parse(data);
            if (error) {
                if (response.message) {
                    _this.lostGame(response.message);
                } else {
                    throw new Error ("Network error " + error);
                }

            } else {
                if (response.nextURL) {
                    _this.getQuestion(response.nextURL);
                } else {
                    _this.finish();
                }
            }
        });

        form.remove();
    });

    this.timer.startTimer();
};

Quiz.prototype.lostGame = function(message) {
    this.addTemplate("gameLostTemplate");
    var formContainer = document.querySelector("#formContainer");
    var messageTag = document.querySelector("#message");
    var textNode = document.createTextNode(message);
    formContainer.firstElementChild.remove();
    messageTag.appendChild(textNode);
};

Quiz.prototype.finish = function() {
    this.saveHighscore();
    this.printScore();
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

Quiz.prototype.printScore = function() {
    this.addTemplate("gameWonTemplate");
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

Quiz.prototype.printQuestion = function(question) {
    var div = document.querySelector("#questionContainer");
    var p = div.firstElementChild;
    p.textContent = question;
};

Quiz.prototype.printAlternatives = function(alternatives) {
    var form = document.querySelector("#alternativeAnswerForm");
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
};

module.exports = Quiz;

},{"./Timer":2,"./ajax":3}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
var Quiz = require("./Quiz");

var test = new Quiz();

},{"./Quiz":1}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUXVpei5qcyIsImNsaWVudC9zb3VyY2UvanMvVGltZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FqYXguanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG52YXIgVGltZXIgPSByZXF1aXJlKFwiLi9UaW1lclwiKTtcblxuZnVuY3Rpb24gUXVpeigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMubmlja25hbWUgPSB0aGlzLmdldE5pY2tuYW1lKCk7XG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcihmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMubG9zdEdhbWUoXCJZb3UgcmFuIG91dCBvZiB0aW1lXCIpO1xuICAgIH0pO1xufVxuXG5RdWl6LnByb3RvdHlwZS5nZXROaWNrbmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWRkVGVtcGxhdGUoXCJuaWNrbmFtZVRlbXBsYXRlXCIpO1xuICAgIHZhciBmb3JtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuaWNrbmFtZUZvcm1cIik7XG4gICAgdmFyIG1lc3NhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25pY2tNZXNzYWdlXCIpO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3RoaXMubmlja25hbWUgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICBpZiAoX3RoaXMubmlja25hbWUpIHtcbiAgICAgICAgICAgIF90aGlzLm5pY2tuYW1lID0gZm9ybS5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcbiAgICAgICAgICAgIG1lc3NhZ2UucmVtb3ZlKCk7XG4gICAgICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgICAgICAgICAgX3RoaXMuZ2V0UXVlc3Rpb24oKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFwiUGxlYXNlIHdyaXRlIHlvdXIgbmlja25hbWVcIjtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUuYWRkVGVtcGxhdGUgPSBmdW5jdGlvbih0ZW1wbGF0ZU5hbWUpIHtcbiAgICB2YXIgZm9ybUNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm9ybUNvbnRhaW5lclwiKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGVtcGxhdGVOYW1lKTtcbiAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgICBmb3JtQ29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xufTtcblxuUXVpei5wcm90b3R5cGUuZ2V0UXVlc3Rpb24gPSBmdW5jdGlvbihuZXdVUkwpIHtcbiAgICB2YXIgYWpheENvbmZpZyA9IHtcbiAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICB1cmw6IG5ld1VSTCB8fCBcImh0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzFcIlxuICAgIH07XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGFqYXgucmVxdWVzdChhamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICB2YXIgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICBfdGhpcy5wcmludFF1ZXN0aW9uKHJlc3BvbnNlLnF1ZXN0aW9uKTtcbiAgICAgICAgX3RoaXMucG9zdEFuc3dlcihyZXNwb25zZS5uZXh0VVJMLCByZXNwb25zZS5hbHRlcm5hdGl2ZXMpO1xuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUucG9zdEFuc3dlciA9IGZ1bmN0aW9uKG5ld1VSTCwgYWx0ZXJuYXRpdmVzKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgbXlBbnN3ZXI7XG4gICAgdmFyIGFuc3dlciA9IHt9O1xuICAgIHZhciBmb3JtO1xuXG4gICAgaWYgKGFsdGVybmF0aXZlcykge1xuICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwiYWx0ZXJuYXRpdmVBbnN3ZXJUZW1wbGF0ZVwiKTtcbiAgICAgICAgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYWx0ZXJuYXRpdmVBbnN3ZXJGb3JtXCIpO1xuICAgICAgICB0aGlzLnByaW50QWx0ZXJuYXRpdmVzKGFsdGVybmF0aXZlcyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcInRleHRBbnN3ZXJUZW1wbGF0ZVwiKTtcbiAgICAgICAgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dEFuc3dlckZvcm1cIik7XG4gICAgfVxuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgX3RoaXMudGltZXIuc3RvcFRpbWVyKCk7XG5cbiAgICAgICAgaWYgKGFsdGVybmF0aXZlcykge1xuICAgICAgICAgICAgdmFyIGJ1dHRvbnMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGggLSAxOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoYnV0dG9uc1tpXS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIG15QW5zd2VyID0gYnV0dG9uc1tpXS52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBteUFuc3dlciA9IGZvcm0uZmlyc3RFbGVtZW50Q2hpbGQudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBhbnN3ZXIgPSB7XG4gICAgICAgICAgICBhbnN3ZXI6IG15QW5zd2VyXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGFqYXhDb25maWcgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBuZXdVUkwsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBhbnN3ZXI6IEpTT04uc3RyaW5naWZ5KGFuc3dlcilcbiAgICAgICAgfTtcblxuICAgICAgICBhamF4LnJlcXVlc3QoYWpheENvbmZpZywgZnVuY3Rpb24oZXJyb3IsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubWVzc2FnZSkge1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5sb3N0R2FtZShyZXNwb25zZS5tZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgKFwiTmV0d29yayBlcnJvciBcIiArIGVycm9yKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLm5leHRVUkwpIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuZ2V0UXVlc3Rpb24ocmVzcG9uc2UubmV4dFVSTCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgX3RoaXMuZmluaXNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgIH0pO1xuXG4gICAgdGhpcy50aW1lci5zdGFydFRpbWVyKCk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5sb3N0R2FtZSA9IGZ1bmN0aW9uKG1lc3NhZ2UpIHtcbiAgICB0aGlzLmFkZFRlbXBsYXRlKFwiZ2FtZUxvc3RUZW1wbGF0ZVwiKTtcbiAgICB2YXIgZm9ybUNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm9ybUNvbnRhaW5lclwiKTtcbiAgICB2YXIgbWVzc2FnZVRhZyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVwiKTtcbiAgICB2YXIgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKTtcbiAgICBmb3JtQ29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkLnJlbW92ZSgpO1xuICAgIG1lc3NhZ2VUYWcuYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xufTtcblxuUXVpei5wcm90b3R5cGUuZmluaXNoID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zYXZlSGlnaHNjb3JlKCk7XG4gICAgdGhpcy5wcmludFNjb3JlKCk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5zYXZlSGlnaHNjb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRpbWUgPSB0aGlzLnRpbWVyLmdldFRvdGFsVGltZSgpO1xuICAgIHZhciBuYW1lID0gdGhpcy5uaWNrbmFtZTtcbiAgICB2YXIgaGlnaHNjb3JlID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hzY29yZVwiKSk7XG4gICAgaWYgKCFoaWdoc2NvcmUpIHtcbiAgICAgICAgaGlnaHNjb3JlID0gW1xuICAgICAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAgICAgIHtuaWNrbmFtZTogXCJcIiwgdGltZTogXCJcIn0sXG4gICAgICAgICAgICB7bmlja25hbWU6IFwiXCIsIHRpbWU6IFwiXCJ9LFxuICAgICAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAgICAgIHtuaWNrbmFtZTogXCJcIiwgdGltZTogXCJcIn1cbiAgICAgICAgXTtcbiAgICAgICAgaGlnaHNjb3JlWzBdLm5pY2tuYW1lID0gbmFtZTtcbiAgICAgICAgaGlnaHNjb3JlWzBdLnRpbWUgPSB0aW1lO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hzY29yZVwiLCBKU09OLnN0cmluZ2lmeShoaWdoc2NvcmUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDU7IGkgKz0gMSkge1xuICAgICAgICAgICAgaWYgKHRpbWUgPCBOdW1iZXIoaGlnaHNjb3JlW2ldLnRpbWUpKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDM7IGogPj0gaTsgaiAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtqICsgMV0ubmlja25hbWUgPSBoaWdoc2NvcmVbal0ubmlja25hbWU7XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtqICsgMV0udGltZSA9IGhpZ2hzY29yZVtqXS50aW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtpXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgaGlnaHNjb3JlW2ldLnRpbWUgPSB0aW1lO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaHNjb3JlXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hzY29yZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoaWdoc2NvcmVbaV0udGltZSA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtpXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgaGlnaHNjb3JlW2ldLnRpbWUgPSB0aW1lO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaHNjb3JlXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hzY29yZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuUXVpei5wcm90b3R5cGUucHJpbnRTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWRkVGVtcGxhdGUoXCJnYW1lV29uVGVtcGxhdGVcIik7XG4gICAgdmFyIGhpZ2hzY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWdoc2NvcmVcIikpO1xuICAgIHZhciBzY29yZUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZUJvYXJkXCIpO1xuICAgIHZhciBwID0gc2NvcmVCb2FyZC5xdWVyeVNlbGVjdG9yQWxsKFwicFwiKTtcbiAgICB2YXIgc3RyO1xuICAgIHZhciB0ZXh0Tm9kZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGhpZ2hzY29yZS5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICBzdHIgPSAoaSArIDEpICsgXCIuIFwiO1xuICAgICAgICBzdHIgKz0gXCJOYW1lOiBcIiArIGhpZ2hzY29yZVtpXS5uaWNrbmFtZSArIFwiIFwiO1xuICAgICAgICBzdHIgKz0gXCJUaW1lOiBcIiArIGhpZ2hzY29yZVtpXS50aW1lO1xuICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHN0cik7XG4gICAgICAgIHBbaV0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgIH1cbn07XG5cblF1aXoucHJvdG90eXBlLnByaW50UXVlc3Rpb24gPSBmdW5jdGlvbihxdWVzdGlvbikge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3F1ZXN0aW9uQ29udGFpbmVyXCIpO1xuICAgIHZhciBwID0gZGl2LmZpcnN0RWxlbWVudENoaWxkO1xuICAgIHAudGV4dENvbnRlbnQgPSBxdWVzdGlvbjtcbn07XG5cblF1aXoucHJvdG90eXBlLnByaW50QWx0ZXJuYXRpdmVzID0gZnVuY3Rpb24oYWx0ZXJuYXRpdmVzKSB7XG4gICAgdmFyIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FsdGVybmF0aXZlQW5zd2VyRm9ybVwiKTtcbiAgICB2YXIgbGFibGVzID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwibGFibGVcIik7XG4gICAgdmFyIHRleHROb2RlO1xuXG4gICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0MSk7XG4gICAgbGFibGVzWzBdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQyKTtcbiAgICBsYWJsZXNbMV0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDMpO1xuICAgIGxhYmxlc1syXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0NCk7XG4gICAgbGFibGVzWzNdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUXVpejtcbiIsImZ1bmN0aW9uIFRpbWVyKGNhbGxiYWNrKSB7XG4gICAgdmFyIHRpbWU7XG4gICAgdmFyIHRvdGFsVGltZSA9IDA7XG4gICAgdmFyIHRpbWVySW50ZXJ2YWw7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuc3RhcnRUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aW1lID0gMjA7XG4gICAgICAgIHRpbWVySW50ZXJ2YWwgPSB3aW5kb3cuc2V0SW50ZXJ2YWwodGhpcy51cGRhdGVUaW1lciwgMTAwKTtcbiAgICB9O1xuXG4gICAgdGhpcy5zdG9wVGltZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdG90YWxUaW1lICs9IDIwIC0gdGltZTtcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGltZXJJbnRlcnZhbCk7XG4gICAgfTtcblxuICAgIHRoaXMudXBkYXRlVGltZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRpbWVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lXCIpO1xuICAgICAgICB0aW1lIC09IDAuMTtcbiAgICAgICAgaWYgKHRpbWUgPD0gMC4xKSB7XG4gICAgICAgICAgICBfdGhpcy5zdG9wVGltZXIoKTtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gdGltZS50b0ZpeGVkKDEpO1xuICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gdGltZS50b0ZpeGVkKDEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuZ2V0VG90YWxUaW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0b3RhbFRpbWUudG9GaXhlZCgyKTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xuIiwiZnVuY3Rpb24gcmVxdWVzdChjb25maWcsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcS5zdGF0dXMsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJlcS5vcGVuKGNvbmZpZy5tZXRob2QsIGNvbmZpZy51cmwpO1xuICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIGNvbmZpZy5jb250ZW50VHlwZSk7XG4gICAgcmVxLnNlbmQoY29uZmlnLmFuc3dlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuIiwidmFyIFF1aXogPSByZXF1aXJlKFwiLi9RdWl6XCIpO1xuXG52YXIgdGVzdCA9IG5ldyBRdWl6KCk7XG4iXX0=
