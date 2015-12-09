function Print() {

    this.question = function(question) {
        var questionParagraph;

        questionParagraph = document.querySelector("#questionParagraph");
        questionParagraph.textContent = question;
    };

    this.answer = function(alternatives) {
        var form;
        var lables;
        var textNode;

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
        this.addTemplate("nicknameTemplate", "bottomContainer");
        return document.querySelector("#nicknameForm");
    };

    this.gameWon = function(name, time) {
        var highScores;
        var fragment;
        var textNode;
        var list;
        var listElement;
        var i;

        this.addTemplate("gameWonTemplate", "bottomContainer");
        highScores = JSON.parse(localStorage.getItem("highScores"));
        fragment = document.createDocumentFragment();
        list = document.querySelector("#scoreBoard");

        for (i = 0; i < highScores.length; i += 1) {
            listElement = document.createElement("li");
            textNode = document.createTextNode((i + 1) + ". Name: " + highScores[i].nickname + " Time: " + highScores[i].time);
            listElement.appendChild(textNode);
            fragment.appendChild(listElement);
        }

        list.appendChild(fragment);
    };

    //this.gameWon = function(name, time) {
    //    var highScores;
    //    var scoreBoard;
    //    var heading;
    //    var paragraphs;
    //    var str;
    //    var textNode;
    //    var i;
    //
    //    this.addTemplate("gameWonTemplate", "bottomContainer");
    //    highScores = JSON.parse(localStorage.getItem("highScores"));
    //    scoreBoard = document.querySelector("#scoreBoard");
    //    paragraphs = scoreBoard.querySelectorAll("p");
    //    heading = document.querySelector("#playerScore");
    //
    //    textNode = document.createTextNode("Nickname: " + name + " Time: " + time);
    //    heading.appendChild(textNode);
    //
    //    for (i = 0; i < highScores.length; i += 1) {
    //        str = (i + 1) + ". ";
    //        str += "Name: " + highScores[i].nickname + " ";
    //        str += "Time: " + highScores[i].time;
    //        textNode = document.createTextNode(str);
    //        paragraphs[i].appendChild(textNode);
    //    }
    //};

    this.gameLost = function(message) {
        var paragraph;
        var textNode;

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
}

module.exports = Print;
