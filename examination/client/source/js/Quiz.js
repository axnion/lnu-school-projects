var ajax = require("./ajax");
var Timer = require("./Timer");
var Print = require("./Print");

/**
 * Constructs a Quiz object. This object contains the logic and communication tools for a quiz game.
 * @constructor
 */
function Quiz() {
    this.print = new Print();
    this.timer = new Timer();
    this.nickname = "";
}

Quiz.prototype.run = function() {
    this.nickname = this.getNickname();
};

/**
 * Gets the content of and input text to be used as a name for the player. It also
 */
Quiz.prototype.getNickname = function() {
    var _this = this;
    var form;
    var message;

    form = this.print.nicknameForm();
    message = document.querySelector("#nickMessage");

    form.addEventListener("submit", function setNickname(event) {
        event.preventDefault();
        _this.nickname = form.firstElementChild.value;
        if (_this.nickname) {
            form.removeEventListener("submit", setNickname);
            form.remove();
            _this.getQuestion();
            message.textContent = "";
        } else {
            message.textContent = "Please write your nickname";
        }
    });
};

/**
 * Gets the questions from the server and calls necessary functions when data from the server has been downloaded
 * to the client.
 * @throw error
 * @param newURL
 */
Quiz.prototype.getQuestion = function(newURL) {
    var _this = this;
    var ajaxConfig;
    var response;

    ajaxConfig = {
        method: "GET",
        url: newURL || "http://vhost3.lnu.se:20080/question/1"
    };

    ajax.request(ajaxConfig, function(error, data) {
        if (error) {
            throw new Error ("Network error " + error);
        } else {
            response = JSON.parse(data);
            _this.print.question(response.question);
            _this.postAnswer(response.nextURL, response.alternatives);
        }
    });
};

/**
 * Calls functions to render answer form, start the timer and creates an event listener on the form. When event is
 * triggered, timer stops, the form is removed and the answers are sent to the server. The response back is analysed
 * and depending on the response from the server something will happen.
 * @param newURL
 * @param alternatives
 */
Quiz.prototype.postAnswer = function(newURL, alternatives) {
    var _this = this;
    var answer;
    var form;
    var ajaxConfig;

    form = this.print.answer(alternatives);

    _this.timer.startTimer(function() {
        form.remove();
        _this.print.gameLost("You ran out of time");
    });

    form.addEventListener("submit", function submitAnswer(event) {
        event.preventDefault();
        _this.timer.stopTimer();

        answer = _this.getAnswer(alternatives, form);
        ajaxConfig = {
            method: "POST",
            url: newURL,
            contentType: "application/json",
            answer: JSON.stringify(answer)
        };
        form.remove();
        ajax.request(ajaxConfig, function(error, data) {
            _this.analyzeResponse(error, JSON.parse(data));
        });
    });
};

/**
 * Gets the answers from the answer form. Depending on if the answers has alternatives or if it's just a text box, the
 * way the function collects the answers differs. The answer is then returned.
 * @param alternatives
 * @param form
 * @returns {{answer: *}|*}
 */
Quiz.prototype.getAnswer = function(alternatives, form) {
    var answer;
    var answerObj;
    var buttons;
    var i;

    if (alternatives) {
        buttons = form.querySelectorAll("input");
        for (i = 0; i < buttons.length - 1; i += 1) {
            if (buttons[i].checked) {
                answer = buttons[i].value;
            }
        }
    } else {
        answer = form.firstElementChild.value;
    }

    answerObj = {
        answer: answer
    };

    return answerObj;
};

/**
 * This method analyses the response the server gave the client when it received the the answers. It checks if there
 * was an error, or if there are more questions, if the answer the client gave was wrong, and then it calls the
 * appropriate functions.
 * @param error
 * @param response
 */
Quiz.prototype.analyzeResponse = function(error, response) {
    var name;
    var time;

    if (error) {
        if (response.message) {
            this.print.gameLost(response.message);
        } else {
            throw new Error ("Network error " + error);
        }

    } else {
        if (response.nextURL) {
            this.getQuestion(response.nextURL);
        } else {
            time = this.timer.getTotalTime();
            name = this.nickname;
            this.saveHighScore(name, time);
            this.print.gameWon(name, time);
        }
    }
};

/**
 * This function checks if a new JSON abject need to be created to save the scores or if there already is one and we can
 * save in that one. It then calls the appropriate function.
 * @param name
 * @param time
 */
Quiz.prototype.saveHighScore = function(name, time) {
    var highScores;

    highScores = JSON.parse(localStorage.getItem("highScores"));
    if (highScores) {
        this.saveToScoreBoard(name, time, highScores);

    } else {
        this.createScoreBoard(name, time);
    }
};

/**
 * This function creates a new JSON object to keep the scores in. The object is turned to a string and saved in
 * local storage.
 * @param name
 * @param time
 */
Quiz.prototype.createScoreBoard = function(name, time) {
    var highScores;

    highScores = [
        {nickname: name, time: time}
    ];
    localStorage.setItem("highScores", JSON.stringify(highScores));
};

/**
 * This method is used to save the top 5 highscores of the game. It take the new score and pushes it into the array.
 * The array is then sorted, and if the array is longer than 5 element the 6th element is removed. The JSON object is
 * then put back into local storage.
 * @param name
 * @param time
 * @param highScores
 */
Quiz.prototype.saveToScoreBoard = function(name, time, highScores) {
    highScores.push({nickname: name, time: time});
    highScores.sort(function(a, b) {
        return Number(a.time) - Number(b.time);
    });

    highScores.splice(5, 1);

    localStorage.setItem("highScores", JSON.stringify(highScores));
};

module.exports = Quiz;
