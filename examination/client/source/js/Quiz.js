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
