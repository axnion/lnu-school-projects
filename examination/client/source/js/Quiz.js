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
