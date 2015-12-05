var ajax = require("./ajax");

var ajaxConfig;
var response;
var newURL;

function Quiz() {
    this.nickname = this.getNickname();
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
        _this.playQuiz();
    });
};

Quiz.prototype.addTemplate = function(templateName) {
    var formContainer = document.querySelector("#formContainer");
    var template = document.querySelector("#" + templateName);
    var form = document.importNode(template.content, true);

    formContainer.appendChild(form);
};

Quiz.prototype.playQuiz = function() {
    this.getQuestion();

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

        if (response.alternatives) {
            _this.postAnswerAlt();
        } else {
            _this.postAnswerText();
        }
    });
};

Quiz.prototype.postAnswerAlt = function() {
    var _this = this;
    var myAnswer;
    var answer = {};
    var form;
    var i;

    this.addTemplate("alternativeAnswerTemplate");
    form = document.querySelector("#alternativeAnswerForm");

    var buttons = form.children;

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        for (i = 0; i < buttons.length - 1; i += 1) {
            if (buttons[i].checked) {
                myAnswer = buttons[i].value;
            }
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
};

Quiz.prototype.postAnswerText = function() {
    var _this = this;
    var myAnswer;
    var answer = {};
    var form;

    this.addTemplate("textAnswerTemplate");
    form = document.querySelector("#textAnswerForm");

    form.addEventListener("submit", function(event) {
        event.preventDefault();

        myAnswer = form.firstElementChild.value;

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
