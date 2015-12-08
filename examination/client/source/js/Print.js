function Print() {
    this.question = function(question) {
        var container;
        var paragraph;

        container = document.querySelector("#questionContainer");
        paragraph = container.firstElementChild;
        paragraph.textContent = question;
    };

    this.answer = function(alternatives) {
        var form;
        var lables;
        var textNode;

        if (alternatives) {

            this.addTemplate("alternativeAnswerTemplate", "formContainer");
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
            this.addTemplate("textAnswerTemplate", "formContainer");
            form = document.querySelector("#textAnswerForm");
        }

        return form;
    };

    this.nicknameForm = function() {
        this.addTemplate("nicknameTemplate", "formContainer");
        return document.querySelector("#nicknameForm");
    };

    this.gameWon = function() {
        var highScore;
        var scoreBoard;
        var paragraphs;
        var str;
        var textNode;
        var i;

        this.addTemplate("gameWonTemplate", "formContainer");
        highScore = JSON.parse(localStorage.getItem("highScore"));
        scoreBoard = document.querySelector("#scoreBoard");
        paragraphs = scoreBoard.querySelectorAll("p");

        for (i = 0; i < highScore.length; i += 1) {
            str = (i + 1) + ". ";
            str += "Name: " + highScore[i].nickname + " ";
            str += "Time: " + highScore[i].time;
            textNode = document.createTextNode(str);
            paragraphs[i].appendChild(textNode);
        }
    };

    this.gameLost = function(message) {
        var container;
        var paragraph;
        var textNode;

        this.addTemplate("gameLostTemplate", "formContainer");
        container = document.querySelector("#formContainer");
        paragraph = document.querySelector("#message");
        textNode = document.createTextNode(message);
        container.firstElementChild.remove();
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
}

module.exports = Print;
