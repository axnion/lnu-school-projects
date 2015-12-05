var ajax = require("./ajax");

var ajaxConfig;
var response;
var newURL;

function Quiz() {
    this.nickname = this.getNickname();
}

Quiz.prototype.getNickname = function() {
    var formContainer = document.querySelector("#formContainer");
    var template = document.querySelector("#nicknameTemplate");
    var form = document.importNode(template.content, true);
    formContainer.appendChild(form);
    formContainer.removeChild("form");
    var nickname;
    var _this = this;

    formContainer.addEventListener("submit", function(event) {
        nickname = form.firstElementChild.value;
        sessionStorage.setItem("nickname", nickname)
    });
};

Quiz.prototype.playQuiz = function() {
    if(!sessionStorage.getItem("nickname")) {
        ge
    }
    this.getQuestion();
    this.postAnswer();
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
        _this.printAnswers();
    });
};

Quiz.prototype.postAnswer = function() {
    var answerContainer = document.querySelector("#formContainer");
    var form = answerContainer.querySelector("form");
    var inputBox = form.firstElementChild;
    var _this = this;
    var myAnswer;
    var answer = {};

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        myAnswer = inputBox.value;
        inputBox.value = null;

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
    });
};

Quiz.prototype.printAnswers = function() {
    var formContainer = document.querySelector("#formContainer");
    var template;
    var form;

    if (response.alternatives) {
        template = document.querySelector("#alternativeAnswerTemplate");
    } else {
        template = document.querySelector("#textAnswerTemplate");
    }

    form = document.importNode(template.content, true);
    formContainer.appendChild(form);

};

Quiz.prototype.printQuestion = function() {
    var div = document.querySelector("#questionContainer");
    var p = div.firstElementChild;
    var question = response.question;
    var alt = response.alternatives;

    if (alt) {
        p.textContent = question + "\n Alt1: " + alt.alt1 + "\n Alt2: " + alt.alt2 + "\n Alt3: " + alt.alt3 + "\n Alt4: " + alt.alt4;
    } else {
        p.textContent = question;
    }
};

module.exports = Quiz;
