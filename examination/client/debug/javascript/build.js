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
    var nickname;
    var _this = this;

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        nickname = form.firstElementChild.value;
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
            newURL = response.nextURL;
            _this.getQuestion();
        });

        form.remove();
    });

    this.timer.startTimer();
};

Quiz.prototype.lostGame = function() {
    this.addTemplate("gameLostTemplate");
    var formContainer = document.querySelector("#formContainer");
    formContainer.firstElementChild.remove();
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
    var timerInterval;
    var _this = this;

    this.startTimer = function() {
        time = 5;
        timerInterval = window.setInterval(this.updateTimer, 100);
    };

    this.stopTimer = function() {
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
}

module.exports = Timer;

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
var Quiz = require("./Quiz");

var test = new Quiz();

},{"./Quiz":1}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUXVpei5qcyIsImNsaWVudC9zb3VyY2UvanMvVGltZXIuanMiLCJjbGllbnQvc291cmNlL2pzL2FqYXguanMiLCJjbGllbnQvc291cmNlL2pzL2FwcC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFqYXggPSByZXF1aXJlKFwiLi9hamF4XCIpO1xudmFyIFRpbWVyID0gcmVxdWlyZShcIi4vVGltZXJcIik7XG5cbnZhciBhamF4Q29uZmlnO1xudmFyIHJlc3BvbnNlO1xudmFyIG5ld1VSTDtcblxuZnVuY3Rpb24gUXVpeigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMubmlja25hbWUgPSB0aGlzLmdldE5pY2tuYW1lKCk7XG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcihmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMubG9zdEdhbWUoKTtcbiAgICB9KTtcbn1cblxuUXVpei5wcm90b3R5cGUuZ2V0Tmlja25hbWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkZFRlbXBsYXRlKFwibmlja25hbWVUZW1wbGF0ZVwiKTtcbiAgICB2YXIgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmlja25hbWVGb3JtXCIpO1xuICAgIHZhciBuaWNrbmFtZTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG5pY2tuYW1lID0gZm9ybS5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcbiAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICAgICAgX3RoaXMuZ2V0UXVlc3Rpb24oKTtcbiAgICB9KTtcbn07XG5cblF1aXoucHJvdG90eXBlLmFkZFRlbXBsYXRlID0gZnVuY3Rpb24odGVtcGxhdGVOYW1lKSB7XG4gICAgdmFyIGZvcm1Db250YWluZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2Zvcm1Db250YWluZXJcIik7XG4gICAgdmFyIHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIHRlbXBsYXRlTmFtZSk7XG4gICAgdmFyIGZvcm0gPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuXG4gICAgZm9ybUNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcbn07XG5cblF1aXoucHJvdG90eXBlLmdldFF1ZXN0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgYWpheENvbmZpZyA9IHtcbiAgICAgICAgbWV0aG9kOiBcIkdFVFwiLFxuICAgICAgICB1cmw6IG5ld1VSTCB8fCBcImh0dHA6Ly92aG9zdDMubG51LnNlOjIwMDgwL3F1ZXN0aW9uLzFcIlxuICAgIH07XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIGFqYXgucmVxdWVzdChhamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgIG5ld1VSTCA9IHJlc3BvbnNlLm5leHRVUkw7XG4gICAgICAgIF90aGlzLnByaW50UXVlc3Rpb24oKTtcbiAgICAgICAgX3RoaXMucG9zdEFuc3dlcigpO1xuICAgIH0pO1xufTtcblxuUXVpei5wcm90b3R5cGUucG9zdEFuc3dlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyIG15QW5zd2VyO1xuICAgIHZhciBhbnN3ZXIgPSB7fTtcbiAgICB2YXIgZm9ybTtcblxuICAgIGlmIChyZXNwb25zZS5hbHRlcm5hdGl2ZXMpIHtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImFsdGVybmF0aXZlQW5zd2VyVGVtcGxhdGVcIik7XG4gICAgICAgIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FsdGVybmF0aXZlQW5zd2VyRm9ybVwiKTtcbiAgICAgICAgdGhpcy5wcmludEFsdGVybmF0aXZlcygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuYWRkVGVtcGxhdGUoXCJ0ZXh0QW5zd2VyVGVtcGxhdGVcIik7XG4gICAgICAgIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RleHRBbnN3ZXJGb3JtXCIpO1xuICAgIH1cblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIF90aGlzLnRpbWVyLnN0b3BUaW1lcigpO1xuXG4gICAgICAgIGlmIChyZXNwb25zZS5hbHRlcm5hdGl2ZXMpIHtcbiAgICAgICAgICAgIHZhciBidXR0b25zID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRcIik7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoIC0gMTsgaSArPSAxKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJ1dHRvbnNbaV0uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICAgICBteUFuc3dlciA9IGJ1dHRvbnNbaV0udmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbXlBbnN3ZXIgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgICAgICB9XG5cbiAgICAgICAgYW5zd2VyID0ge1xuICAgICAgICAgICAgYW5zd2VyOiBteUFuc3dlclxuICAgICAgICB9O1xuXG4gICAgICAgIGFqYXhDb25maWcgPSB7XG4gICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgdXJsOiBuZXdVUkwsXG4gICAgICAgICAgICBjb250ZW50VHlwZTogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgICBhbnN3ZXI6IEpTT04uc3RyaW5naWZ5KGFuc3dlcilcbiAgICAgICAgfTtcblxuICAgICAgICBjb25zb2xlLmxvZyhhamF4Q29uZmlnKTtcbiAgICAgICAgYWpheC5yZXF1ZXN0KGFqYXhDb25maWcsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICBuZXdVUkwgPSByZXNwb25zZS5uZXh0VVJMO1xuICAgICAgICAgICAgX3RoaXMuZ2V0UXVlc3Rpb24oKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICB9KTtcblxuICAgIHRoaXMudGltZXIuc3RhcnRUaW1lcigpO1xufTtcblxuUXVpei5wcm90b3R5cGUubG9zdEdhbWUgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmFkZFRlbXBsYXRlKFwiZ2FtZUxvc3RUZW1wbGF0ZVwiKTtcbiAgICB2YXIgZm9ybUNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjZm9ybUNvbnRhaW5lclwiKTtcbiAgICBmb3JtQ29udGFpbmVyLmZpcnN0RWxlbWVudENoaWxkLnJlbW92ZSgpO1xufTtcblxuUXVpei5wcm90b3R5cGUucHJpbnRRdWVzdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkaXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3F1ZXN0aW9uQ29udGFpbmVyXCIpO1xuICAgIHZhciBwID0gZGl2LmZpcnN0RWxlbWVudENoaWxkO1xuICAgIHZhciBxdWVzdGlvbiA9IHJlc3BvbnNlLnF1ZXN0aW9uO1xuICAgIHAudGV4dENvbnRlbnQgPSBxdWVzdGlvbjtcbn07XG5cblF1aXoucHJvdG90eXBlLnByaW50QWx0ZXJuYXRpdmVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FsdGVybmF0aXZlQW5zd2VyRm9ybVwiKTtcbiAgICB2YXIgbGFibGVzID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwibGFibGVcIik7XG4gICAgdmFyIGFsdGVybmF0aXZlcyA9IHJlc3BvbnNlLmFsdGVybmF0aXZlcztcbiAgICB2YXIgdGV4dE5vZGU7XG5cbiAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQxKTtcbiAgICBsYWJsZXNbMF0uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoYWx0ZXJuYXRpdmVzLmFsdDIpO1xuICAgIGxhYmxlc1sxXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXMuYWx0Myk7XG4gICAgbGFibGVzWzJdLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQ0KTtcbiAgICBsYWJsZXNbM10uYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWl6O1xuIiwiZnVuY3Rpb24gVGltZXIoY2FsbGJhY2spIHtcbiAgICB2YXIgdGltZTtcbiAgICB2YXIgdGltZXJJbnRlcnZhbDtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy5zdGFydFRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHRpbWUgPSA1O1xuICAgICAgICB0aW1lckludGVydmFsID0gd2luZG93LnNldEludGVydmFsKHRoaXMudXBkYXRlVGltZXIsIDEwMCk7XG4gICAgfTtcblxuICAgIHRoaXMuc3RvcFRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRpbWVySW50ZXJ2YWwpO1xuICAgIH07XG5cbiAgICB0aGlzLnVwZGF0ZVRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aW1lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGltZVwiKTtcbiAgICAgICAgdGltZSAtPSAwLjE7XG4gICAgICAgIGlmICh0aW1lIDw9IDAuMSkge1xuICAgICAgICAgICAgX3RoaXMuc3RvcFRpbWVyKCk7XG4gICAgICAgICAgICB0aW1lci50ZXh0Q29udGVudCA9IHRpbWUudG9GaXhlZCgxKTtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aW1lci50ZXh0Q29udGVudCA9IHRpbWUudG9GaXhlZCgxKTtcbiAgICAgICAgfVxuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZXI7XG4iLCJmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZywgY2FsbGJhY2spIHtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICBjYWxsYmFjayhudWxsLCByZXEucmVzcG9uc2VUZXh0KTtcbiAgICB9KTtcblxuICAgIHJlcS5vcGVuKGNvbmZpZy5tZXRob2QsIGNvbmZpZy51cmwpO1xuICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIGNvbmZpZy5jb250ZW50VHlwZSk7XG4gICAgcmVxLnNlbmQoY29uZmlnLmFuc3dlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuIiwidmFyIFF1aXogPSByZXF1aXJlKFwiLi9RdWl6XCIpO1xuXG52YXIgdGVzdCA9IG5ldyBRdWl6KCk7XG4iXX0=
