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

    form.addEventListener("submit", function submit() {
        nickname = form.firstElementChild.value;
        sessionStorage.setItem("nickname", nickname);
    });
};

Quiz.prototype.playQuiz = function() {
    this.getQuestion("http://vhost3.lnu.se:20080/question/1");
    document.addEventListener();
    this.postAnswer(response.nextURL);
};

Quiz.prototype.getQuestion = function(url) {
    var getAjaxConfig = {
        method: "GET",
        url: url
    };

    var _this = this;

    ajax.request(getAjaxConfig, function(error, data) {
        var response = JSON.parse(data);
        _this.printQuestion(response.question);

    });
};

Quiz.prototype.postAnswer = function(url) {
    var answerContainer = document.querySelector("#answerContainer");
    var form = answerContainer.querySelector("form");

    var _this = this;

    form.addEventListener("submit", function submit(event) {

        var myAnswer = form.firstElementChild.value;
        form.firstElementChild.value = null;
        var answer = {
            answer: myAnswer
        };

        var postAjaxConfig = {
            method: "POST",
            url: url,
            contentType: "application/json",
            answer: JSON.stringify(answer)
        };

        ajax.request(postAjaxConfig, function(error, data) {
            if (error) {
                console.log("Network error");
            }

            var response = JSON.parse(data);
            _this.getQuestion(response.nextURL);
        });

        event.preventDefault();
    });
};

Quiz.prototype.printQuestion = function(question) {
    var div = document.querySelector("#questionContainer");
    var p = div.firstElementChild;

    p.textContent = question;
};

module.exports = Quiz;
