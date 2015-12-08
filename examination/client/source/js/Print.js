function Print() {

    this.question = function(question) {
        var container = document.querySelector("#questionContainer");
        var p = container.firstElementChild;
        p.textContent = question;
    };




    this.answer = function(alternatives) {
        var form;
        if (alternatives) {

            this.addTemplate("alternativeAnswerTemplate", "formContainer");
            form = document.querySelector("#alternativeAnswerForm");
            var lables = form.querySelectorAll("lable");
            var textNode;

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
        var form = document.querySelector("#nicknameForm");

        return form;
    };




    this.gameWon = function() {
        this.addTemplate("gameWonTemplate", "formContainer");
        var highscore = JSON.parse(localStorage.getItem("highscore"));
        var scoreBoard = document.querySelector("#scoreBoard");
        var p = scoreBoard.querySelectorAll("p");
        var str;
        var textNode;
        for (var i = 0; i < highscore.length; i += 1) {
            str = (i + 1) + ". ";
            str += "Name: " + highscore[i].nickname + " ";
            str += "Time: " + highscore[i].time;
            textNode = document.createTextNode(str);
            p[i].appendChild(textNode);
        }
    };




    this.gameLost = function(message) {
        this.addTemplate("gameLostTemplate", "formContainer");
        var formContainer = document.querySelector("#formContainer");
        var messageTag = document.querySelector("#message");
        var textNode = document.createTextNode(message);
        formContainer.firstElementChild.remove();
        messageTag.appendChild(textNode);
    };




    this.addTemplate = function(templateName, containerName) {
        var container = document.querySelector("#" + containerName);
        var template = document.querySelector("#" + templateName);
        var form = document.importNode(template.content, true);

        container.appendChild(form);
    };
}

module.exports = Print;
