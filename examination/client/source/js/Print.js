function Print() {

    this.title = function() {
        this.clearContainer("topContainer");
        this.addTemplate("titleTemplate", "topContainer");
    };

    this.question = function(question) {
        var container;
        var questionParagraph;

        this.clearContainer("topContainer");
        this.addTemplate("questionTemplate", "topContainer");
        questionParagraph = document.querySelector("#questionParagraph");
        questionParagraph.textContent = question;
    };

    this.answer = function(alternatives) {
        var form;
        var lables;
        var textNode;

        this.clearContainer("bottomContainer");

        if (alternatives) {

            this.addTemplate("alternativeAnswerTemplate", "bottomContainer");
            form = document.querySelector("#alternativeAnswerForm");
            lables = form.querySelectorAll("lable");

            textNode = document.createTextNode(alternatives.alt1);
            lables[0].appendChild(textNode);
            textNode = document.createTextNode(alternatives.alt2);
            lables[1].appendChild(textNode);
            textNode = document.createTextNode(alternatives.alt3);
            lables[2].appendChild(textNode);
            textNode = document.createTextNode(alternatives.alt4);
            lables[3].appendChild(textNode);
        } else {
            this.addTemplate("textAnswerTemplate", "bottomContainer");
            form = document.querySelector("#textAnswerForm");
        }

        return form;
    };

    this.nicknameForm = function() {
        this.title();
        this.addTemplate("nicknameTemplate", "bottomContainer");
        return document.querySelector("#nicknameForm");
    };

    this.gameWon = function(name, time) {
        var highScore;
        var scoreBoard;
        var heading;
        var paragraphs;
        var str;
        var textNode;
        var i;

        this.title();
        this.clearContainer("bottomContainer");
        this.addTemplate("gameWonTemplate", "bottomContainer");
        highScore = JSON.parse(localStorage.getItem("highScore"));
        scoreBoard = document.querySelector("#scoreBoard");
        paragraphs = scoreBoard.querySelectorAll("p");
        heading = document.querySelector("#playerScore");

        textNode = document.createTextNode("Nickname: " + name + " Time: " + time);
        heading.appendChild(textNode);

        for (i = 0; i < highScore.length; i += 1) {
            str = (i + 1) + ". ";
            str += "Name: " + highScore[i].nickname + " ";
            str += "Time: " + highScore[i].time;
            textNode = document.createTextNode(str);
            paragraphs[i].appendChild(textNode);
        }
    };

    this.gameLost = function(message) {
        var paragraph;
        var textNode;

        this.clearContainer("bottomContainer");

        this.title();
        this.addTemplate("gameLostTemplate", "bottomContainer");
        paragraph = document.querySelector("#message");
        textNode = document.createTextNode(message);
        paragraph.appendChild(textNode);
    };

    this.addTemplate = function(templateName, containerName) {
        var container;
        var template;
        var form;

        container = document.querySelector("#" + containerName);
        template = document.querySelector("#" + templateName);
        form = document.importNode(template.content, true);

        container.appendChild(form);
    };

    this.clearContainer = function(containerName) {
        var container;
        var content;
        var i;

        container = document.querySelector("#" + containerName);
        content = container.children;

        for (i = 0; i < content.length; i += 1) {
            content[i].remove();
        }
    };
}

module.exports = Print;
