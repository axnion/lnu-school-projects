/**
 * This is the Print object. In the Quiz game this object contains most of the functionallity used when altering the HTML.
 * @constructor
 */
function Print() {

    /**
     * Prints the questions to the questionParagraph in the html file.
     * @param question
     */
    this.question = function(question) {
        var questionParagraph;

        questionParagraph = document.querySelector("#questionParagraph");
        questionParagraph.textContent = question;
    };

    /**
     * Loads the correct template and put's it into the bottom container. The form is then returned so it
     * can be removed easily.
     * @param alternatives
     * @returns {*}
     */
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

    /**
     * Loads the template so the user can fill in it's nickname
     * @returns {Element}
     */
    this.nicknameForm = function() {
        this.addTemplate("nicknameTemplate", "bottomContainer");
        return document.querySelector("#nicknameForm");
    };

    /**
     * Loads the correct template and presents the player with his score this round and the top 5 scores saved on
     * this local storage.
     * @param name
     * @param time
     */
    this.gameWon = function(name, time) {
        var highScores;
        var fragment;
        var textNode;
        var list;
        var listElement;
        var playerScore;
        var i;

        this.addTemplate("gameWonTemplate", "bottomContainer");
        playerScore = document.querySelector("#playerScore");
        textNode = document.createTextNode(name + ", your time was: " + time);
        playerScore.appendChild(textNode);
        highScores = JSON.parse(localStorage.getItem("highScores"));
        fragment = document.createDocumentFragment();
        list = document.querySelector("#scoreBoard");

        for (i = 0; i < highScores.length; i += 1) {
            listElement = document.createElement("li");
            textNode = document.createTextNode("Name: " + highScores[i].nickname + " Time: " + highScores[i].time);
            listElement.appendChild(textNode);
            fragment.appendChild(listElement);
        }

        list.appendChild(fragment);

        document.querySelector("#timeParagraph").textContent = "";
        document.querySelector("#questionParagraph").textContent = "";
    };

    /**
     * Loads the correct template and presents a message to tell the player that he/she lost and why they lost.
     * @param message
     */
    this.gameLost = function(message) {
        var paragraph;
        var textNode;

        this.addTemplate("gameLostTemplate", "bottomContainer");
        paragraph = document.querySelector("#message");
        textNode = document.createTextNode(message);
        paragraph.appendChild(textNode);
    };

    /**
     * This is a helper method used in many of the other print methods. It's used to load a template into a container.
     * @param templateName
     * @param containerName
     */
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
