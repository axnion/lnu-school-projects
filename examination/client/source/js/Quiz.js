var ajax = require("./ajax");

function Quiz() {
    if (sessionStorage.getItem("nickname")) {
        this.nickname = sessionStorage.getItem("nickname");
    } else {
        this.getNickname();
    }
}

Quiz.prototype.getNickname = function() {
    var nickContainer = document.querySelector("#nicknameContainer");
    var form = nickContainer.querySelector("form");

    var nickname;

    form.addEventListener("submit", function submit(event) {
        nickname = form.firstElementChild.value;
        sessionStorage.setItem("nickname", nickname);
        event.preventDefault();
    });
};

Quiz.prototype.playQuiz = function() {

    this.getQuestion();
};

Quiz.prototype.getQuestion = function(url) {
    var getAjaxConfig = {
        method: "GET",
        url: url || "http://vhost3.lnu.se:20080/question/1"
    };

    var _this = this;

    ajax.request(getAjaxConfig, function(error, data) {
        var response = JSON.parse(data);
        _this.printQuestion(response.question);
        _this.postAnswer(response.nextURL);
    });
};

Quiz.prototype.postAnswer = function(url) {
    var answerContainer = document.querySelector("#answerContainer");
    var form = answerContainer.querySelector("form");

    var _this = this;
    var myAnswer;
    var answer = {};
    var postAjaxConfig = {};

    form.addEventListener("submit", function submit(event) {
        event.preventDefault();
        event.stopPropagation();

        myAnswer = form.firstElementChild.value;

        answer = {
            answer: myAnswer
        };

        postAjaxConfig = {
            method: "POST",
            url: url,
            contentType: "application/json",
            answer: JSON.stringify(answer)
        };

        debugger;
        ajax.request(postAjaxConfig, function(error, data) {
            if (error) {
                console.log("Network error");
            }

            var response = JSON.parse(data);
            console.log(response);
            _this.getQuestion(response.nextURL);
            form.firstElementChild.value = null;
        });
    });
};

Quiz.prototype.printQuestion = function(question) {
    var div = document.querySelector("#questionContainer");
    var p = div.firstElementChild;

    p.textContent = question;
};

module.exports = Quiz;
