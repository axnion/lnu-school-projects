(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ajax = require("./ajax");
var Timer = require("./Timer");

var ajaxConfig;
var response;
var newURL;

function Quiz() {
    var _this = this;
    this.nickname = this.getNickname();
    this.timer = new Timer(function() {
        _this.lostGame();
    });
}

Quiz.prototype.getNickname = function() {
    this.addTemplate("nicknameTemplate");
    var form = document.querySelector("#nicknameForm");
    var _this = this;

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        _this.nickname = form.firstElementChild.value;
        form.remove();
        _this.getQuestion();
    });
};

Quiz.prototype.addTemplate = function(templateName) {
    var formContainer = document.querySelector("#formContainer");
    var template = document.querySelector("#" + templateName);
    var form = document.importNode(template.content, true);

    formContainer.appendChild(form);
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
        this.printAlternatives();
    } else {
        this.addTemplate("textAnswerTemplate");
        form = document.querySelector("#textAnswerForm");
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        _this.timer.stopTimer();

        if (response.alternatives) {
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

        ajaxConfig = {
            method: "POST",
            url: newURL,
            contentType: "application/json",
            answer: JSON.stringify(answer)
        };

        console.log(ajaxConfig);
        ajax.request(ajaxConfig, function(error, data) {
            response = JSON.parse(data);
            if (error) {
                if (response.message) {
                    _this.lostGame(response.message);
                } else {
                    throw new Error ("Network error " + error);
                }

            } else {
                console.log("NOT ERROR");
                if (response.nextURL) {
                    newURL = response.nextURL;
                    _this.getQuestion();
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
    messageTag.appendChild(textNode);
    formContainer.firstElementChild.remove();
};

Quiz.prototype.finish = function() {
    this.saveHighscore();
    this.printScore();
};

Quiz.prototype.saveHighscore = function() {
    var time = this.timer.getTotalTime();
    var name = this.nickname;
    var temp;
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
            if (time < Number(highscore[i].time)) { //todo Konvertera från sträng till int
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
    var br = document.createElement("br");
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

Quiz.prototype.printQuestion = function() {
    var div = document.querySelector("#questionContainer");
    var p = div.firstElementChild;
    var question = response.question;
    p.textContent = question;
};

Quiz.prototype.printAlternatives = function() {
    var form = document.querySelector("#alternativeAnswerForm");
    var lables = form.querySelectorAll("lable");
    var alternatives = response.alternatives;
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
        console.log(totalTime);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUXVpei5qcyIsImNsaWVudC9zb3VyY2UvanMvVGltZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FqYXguanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFqYXggPSByZXF1aXJlKFwiLi9hamF4XCIpO1xudmFyIFRpbWVyID0gcmVxdWlyZShcIi4vVGltZXJcIik7XG5cbnZhciBhamF4Q29uZmlnO1xudmFyIHJlc3BvbnNlO1xudmFyIG5ld1VSTDtcblxuZnVuY3Rpb24gUXVpeigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMubmlja25hbWUgPSB0aGlzLmdldE5pY2tuYW1lKCk7XG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcihmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMubG9zdEdhbWUoKTtcbiAgICB9KTtcbn1cblxuUXVpei5wcm90b3R5cGUuZ2V0Tmlja25hbWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkZFRlbXBsYXRlKFwibmlja25hbWVUZW1wbGF0ZVwiKTtcbiAgICB2YXIgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmlja25hbWVGb3JtXCIpO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgX3RoaXMubmlja25hbWUgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgICAgICBfdGhpcy5nZXRRdWVzdGlvbigpO1xuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUuYWRkVGVtcGxhdGUgPSBmdW5jdGlvbih0ZW1wbGF0ZU5hbWUpIHtcbiAgICB2YXIgZm9ybUNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm9ybUNvbnRhaW5lclwiKTtcbiAgICB2YXIgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGVtcGxhdGVOYW1lKTtcbiAgICB2YXIgZm9ybSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG5cbiAgICBmb3JtQ29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xufTtcblxuUXVpei5wcm90b3R5cGUuZ2V0UXVlc3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICBhamF4Q29uZmlnID0ge1xuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIHVybDogbmV3VVJMIHx8IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiXG4gICAgfTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgYWpheC5yZXF1ZXN0KGFqYXhDb25maWcsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XG4gICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgbmV3VVJMID0gcmVzcG9uc2UubmV4dFVSTDtcbiAgICAgICAgX3RoaXMucHJpbnRRdWVzdGlvbigpO1xuICAgICAgICBfdGhpcy5wb3N0QW5zd2VyKCk7XG4gICAgfSk7XG59O1xuXG5RdWl6LnByb3RvdHlwZS5wb3N0QW5zd2VyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgbXlBbnN3ZXI7XG4gICAgdmFyIGFuc3dlciA9IHt9O1xuICAgIHZhciBmb3JtO1xuXG4gICAgaWYgKHJlc3BvbnNlLmFsdGVybmF0aXZlcykge1xuICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwiYWx0ZXJuYXRpdmVBbnN3ZXJUZW1wbGF0ZVwiKTtcbiAgICAgICAgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYWx0ZXJuYXRpdmVBbnN3ZXJGb3JtXCIpO1xuICAgICAgICB0aGlzLnByaW50QWx0ZXJuYXRpdmVzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcInRleHRBbnN3ZXJUZW1wbGF0ZVwiKTtcbiAgICAgICAgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dEFuc3dlckZvcm1cIik7XG4gICAgfVxuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgX3RoaXMudGltZXIuc3RvcFRpbWVyKCk7XG5cbiAgICAgICAgaWYgKHJlc3BvbnNlLmFsdGVybmF0aXZlcykge1xuICAgICAgICAgICAgdmFyIGJ1dHRvbnMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYnV0dG9ucy5sZW5ndGggLSAxOyBpICs9IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoYnV0dG9uc1tpXS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIG15QW5zd2VyID0gYnV0dG9uc1tpXS52YWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBteUFuc3dlciA9IGZvcm0uZmlyc3RFbGVtZW50Q2hpbGQudmFsdWU7XG4gICAgICAgIH1cblxuICAgICAgICBhbnN3ZXIgPSB7XG4gICAgICAgICAgICBhbnN3ZXI6IG15QW5zd2VyXG4gICAgICAgIH07XG5cbiAgICAgICAgYWpheENvbmZpZyA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IG5ld1VSTCxcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgIGFuc3dlcjogSlNPTi5zdHJpbmdpZnkoYW5zd2VyKVxuICAgICAgICB9O1xuXG4gICAgICAgIGNvbnNvbGUubG9nKGFqYXhDb25maWcpO1xuICAgICAgICBhamF4LnJlcXVlc3QoYWpheENvbmZpZywgZnVuY3Rpb24oZXJyb3IsIGRhdGEpIHtcbiAgICAgICAgICAgIHJlc3BvbnNlID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgICAgIGlmIChyZXNwb25zZS5tZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmxvc3RHYW1lKHJlc3BvbnNlLm1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAoXCJOZXR3b3JrIGVycm9yIFwiICsgZXJyb3IpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIk5PVCBFUlJPUlwiKTtcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UubmV4dFVSTCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdVUkwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy5nZXRRdWVzdGlvbigpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmZpbmlzaCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHRoaXMudGltZXIuc3RhcnRUaW1lcigpO1xufTtcblxuUXVpei5wcm90b3R5cGUubG9zdEdhbWUgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgdGhpcy5hZGRUZW1wbGF0ZShcImdhbWVMb3N0VGVtcGxhdGVcIik7XG4gICAgdmFyIGZvcm1Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Zvcm1Db250YWluZXJcIik7XG4gICAgdmFyIG1lc3NhZ2VUYWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI21lc3NhZ2VcIik7XG4gICAgdmFyIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSk7XG4gICAgbWVzc2FnZVRhZy5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgZm9ybUNvbnRhaW5lci5maXJzdEVsZW1lbnRDaGlsZC5yZW1vdmUoKTtcbn07XG5cblF1aXoucHJvdG90eXBlLmZpbmlzaCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2F2ZUhpZ2hzY29yZSgpO1xuICAgIHRoaXMucHJpbnRTY29yZSgpO1xufTtcblxuUXVpei5wcm90b3R5cGUuc2F2ZUhpZ2hzY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aW1lID0gdGhpcy50aW1lci5nZXRUb3RhbFRpbWUoKTtcbiAgICB2YXIgbmFtZSA9IHRoaXMubmlja25hbWU7XG4gICAgdmFyIHRlbXA7XG4gICAgdmFyIGhpZ2hzY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWdoc2NvcmVcIikpO1xuICAgIGlmICghaGlnaHNjb3JlKSB7XG4gICAgICAgIGhpZ2hzY29yZSA9IFtcbiAgICAgICAgICAgIHtuaWNrbmFtZTogXCJcIiwgdGltZTogXCJcIn0sXG4gICAgICAgICAgICB7bmlja25hbWU6IFwiXCIsIHRpbWU6IFwiXCJ9LFxuICAgICAgICAgICAge25pY2tuYW1lOiBcIlwiLCB0aW1lOiBcIlwifSxcbiAgICAgICAgICAgIHtuaWNrbmFtZTogXCJcIiwgdGltZTogXCJcIn0sXG4gICAgICAgICAgICB7bmlja25hbWU6IFwiXCIsIHRpbWU6IFwiXCJ9XG4gICAgICAgIF07XG4gICAgICAgIGhpZ2hzY29yZVswXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgIGhpZ2hzY29yZVswXS50aW1lID0gdGltZTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJoaWdoc2NvcmVcIiwgSlNPTi5zdHJpbmdpZnkoaGlnaHNjb3JlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA1OyBpICs9IDEpIHtcbiAgICAgICAgICAgIGlmICh0aW1lIDwgTnVtYmVyKGhpZ2hzY29yZVtpXS50aW1lKSkgeyAvL3RvZG8gS29udmVydGVyYSBmcsOlbiBzdHLDpG5nIHRpbGwgaW50XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaiA9IDM7IGogPj0gaTsgaiAtPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtqICsgMV0ubmlja25hbWUgPSBoaWdoc2NvcmVbal0ubmlja25hbWU7XG4gICAgICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtqICsgMV0udGltZSA9IGhpZ2hzY29yZVtqXS50aW1lO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtpXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgaGlnaHNjb3JlW2ldLnRpbWUgPSB0aW1lO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaHNjb3JlXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hzY29yZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChoaWdoc2NvcmVbaV0udGltZSA9PT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGhpZ2hzY29yZVtpXS5uaWNrbmFtZSA9IG5hbWU7XG4gICAgICAgICAgICAgICAgaGlnaHNjb3JlW2ldLnRpbWUgPSB0aW1lO1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaHNjb3JlXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hzY29yZSkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuUXVpei5wcm90b3R5cGUucHJpbnRTY29yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuYWRkVGVtcGxhdGUoXCJnYW1lV29uVGVtcGxhdGVcIik7XG4gICAgdmFyIGhpZ2hzY29yZSA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJoaWdoc2NvcmVcIikpO1xuICAgIHZhciBzY29yZUJvYXJkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZUJvYXJkXCIpO1xuICAgIHZhciBwID0gc2NvcmVCb2FyZC5xdWVyeVNlbGVjdG9yQWxsKFwicFwiKTtcbiAgICB2YXIgYnIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIik7XG4gICAgdmFyIHN0cjtcbiAgICB2YXIgdGV4dE5vZGU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBoaWdoc2NvcmUubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgc3RyID0gKGkgKyAxKSArIFwiLiBcIjtcbiAgICAgICAgc3RyICs9IFwiTmFtZTogXCIgKyBoaWdoc2NvcmVbaV0ubmlja25hbWUgKyBcIiBcIjtcbiAgICAgICAgc3RyICs9IFwiVGltZTogXCIgKyBoaWdoc2NvcmVbaV0udGltZTtcbiAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShzdHIpO1xuICAgICAgICBwW2ldLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICB9XG59O1xuXG5RdWl6LnByb3RvdHlwZS5wcmludFF1ZXN0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcXVlc3Rpb25Db250YWluZXJcIik7XG4gICAgdmFyIHAgPSBkaXYuZmlyc3RFbGVtZW50Q2hpbGQ7XG4gICAgdmFyIHF1ZXN0aW9uID0gcmVzcG9uc2UucXVlc3Rpb247XG4gICAgcC50ZXh0Q29udGVudCA9IHF1ZXN0aW9uO1xufTtcblxuUXVpei5wcm90b3R5cGUucHJpbnRBbHRlcm5hdGl2ZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjYWx0ZXJuYXRpdmVBbnN3ZXJGb3JtXCIpO1xuICAgIHZhciBsYWJsZXMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJsYWJsZVwiKTtcbiAgICB2YXIgYWx0ZXJuYXRpdmVzID0gcmVzcG9uc2UuYWx0ZXJuYXRpdmVzO1xuICAgIHZhciB0ZXh0Tm9kZTtcblxuICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDEpO1xuICAgIGxhYmxlc1swXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0Mik7XG4gICAgbGFibGVzWzFdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQzKTtcbiAgICBsYWJsZXNbMl0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDQpO1xuICAgIGxhYmxlc1szXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1aXo7XG4iLCJmdW5jdGlvbiBUaW1lcihjYWxsYmFjaykge1xuICAgIHZhciB0aW1lO1xuICAgIHZhciB0b3RhbFRpbWUgPSAwO1xuICAgIHZhciB0aW1lckludGVydmFsO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLnN0YXJ0VGltZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGltZSA9IDIwO1xuICAgICAgICB0aW1lckludGVydmFsID0gd2luZG93LnNldEludGVydmFsKHRoaXMudXBkYXRlVGltZXIsIDEwMCk7XG4gICAgfTtcblxuICAgIHRoaXMuc3RvcFRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRvdGFsVGltZSArPSAyMCAtIHRpbWU7XG4gICAgICAgIGNvbnNvbGUubG9nKHRvdGFsVGltZSk7XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRpbWVySW50ZXJ2YWwpO1xuICAgIH07XG5cbiAgICB0aGlzLnVwZGF0ZVRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aW1lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGltZVwiKTtcbiAgICAgICAgdGltZSAtPSAwLjE7XG4gICAgICAgIGlmICh0aW1lIDw9IDAuMSkge1xuICAgICAgICAgICAgX3RoaXMuc3RvcFRpbWVyKCk7XG4gICAgICAgICAgICB0aW1lci50ZXh0Q29udGVudCA9IHRpbWUudG9GaXhlZCgxKTtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aW1lci50ZXh0Q29udGVudCA9IHRpbWUudG9GaXhlZCgxKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB0aGlzLmdldFRvdGFsVGltZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdG90YWxUaW1lLnRvRml4ZWQoMik7XG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBUaW1lcjtcbiIsImZ1bmN0aW9uIHJlcXVlc3QoY29uZmlnLCBjYWxsYmFjaykge1xuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHJlcS5zdGF0dXMgPj0gNDAwKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhyZXEuc3RhdHVzLCByZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXEub3Blbihjb25maWcubWV0aG9kLCBjb25maWcudXJsKTtcbiAgICByZXEuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtdHlwZVwiLCBjb25maWcuY29udGVudFR5cGUpO1xuICAgIHJlcS5zZW5kKGNvbmZpZy5hbnN3ZXIpO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5yZXF1ZXN0ID0gcmVxdWVzdDtcbiIsInZhciBRdWl6ID0gcmVxdWlyZShcIi4vUXVpelwiKTtcblxudmFyIHRlc3QgPSBuZXcgUXVpeigpO1xuIl19
