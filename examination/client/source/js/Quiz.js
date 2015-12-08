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
