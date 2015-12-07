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
