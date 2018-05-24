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
        var variableNameString;
        var textNode;
        var counter;
        var radioButton;
        var lable;
        var br;
        var submit;

        counter = 1;

        if (alternatives) {
            this.addTemplate("alternativeAnswerTemplate", "bottomContainer");
            form = document.querySelector("#alternativeAnswerForm");
            submit = document.createElement("input");
            submit.setAttribute("type", "submit");
            submit.setAttribute("value", "OK");

            do {
                variableNameString = "alt" + counter;

                radioButton = document.createElement("input");
                radioButton.setAttribute("type", "radio");
                radioButton.setAttribute("name", "alt");
                radioButton.setAttribute("value", variableNameString);
                lable = document.createElement("lable");
                lable.setAttribute("for", "radio");
                br = document.createElement("br");
                textNode = document.createTextNode(alternatives[variableNameString]);
                lable.appendChild(textNode);

                form.appendChild(radioButton);
                form.appendChild(lable);
                form.appendChild(br);

                counter += 1;
            } while (alternatives["alt" + counter]);

            form.appendChild(submit);
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
