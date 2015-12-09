(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
var ajax = require("./ajax");
var Timer = require("./Timer");
var Print = require("./Print");

/**
 * Constructs a Quiz object. This object contains the logic and communication tools for a quiz game.
 * @constructor
 */
function Quiz() {
    var _this = this;
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

},{"./Print":1,"./Timer":3,"./ajax":4}],3:[function(require,module,exports){
/**
 * This is a Timer object. It's used to take the time a player takes to answer a question. It can start, stop, and
 * updates the html to show the time. It also saves the total amount of time the player took to answer all the
 * questions.
 * @constructor
 */
function Timer() {
    var time;
    var totalTime = 0;
    var timerInterval;
    var _this = this;
    var myCallback ;

    /**
     * This method starts the timer. It's paramater is a callback function used in the update method for when the time
     * runs out. Here we also set the time and the start the timer.
     * @param callback
     */
    this.startTimer = function(callback) {
        myCallback = callback;
        time = 20;
        timerInterval = window.setInterval(this.updateTimer, 100);
    };

    /**
     * This method stops the timer and adds the time spent to the total time.
     */
    this.stopTimer = function() {
        totalTime += 20 - time;
        window.clearInterval(timerInterval);
    };

    /**
     * This method updates the html file on how much time is left. It also checks if the time has run out. It it has it
     * will stop the timer and call the callback function.
     */
    this.updateTimer = function() {
        var timer = document.querySelector("#timeParagraph");
        time -= 0.1;
        if (time <= 0) {
            _this.stopTimer();
            timer.textContent = time.toFixed(1);
            myCallback();
        } else {
            timer.textContent = time.toFixed(1);
        }
    };

    /**
     * This method returnes the total time spent.
     * @returns {string}
     */
    this.getTotalTime = function() {
        return totalTime.toFixed(2);
    };
}

module.exports = Timer;

},{}],4:[function(require,module,exports){
function request(config, callback) {
    var req = new XMLHttpRequest();

    req.addEventListener("load", function() {
        if (req.status >= 400) {
            callback(req.status, req.responseText);
        } else {
            callback(null, req.responseText);
        }
    });

    req.open(config.method, config.url);
    req.setRequestHeader("Content-type", config.contentType);
    req.send(config.answer);
}

module.exports.request = request;

},{}],5:[function(require,module,exports){
var Quiz = require("./Quiz");

var quizGame = new Quiz();

quizGame.run();

},{"./Quiz":2}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHJpbnQuanMiLCJjbGllbnQvc291cmNlL2pzL1F1aXouanMiLCJjbGllbnQvc291cmNlL2pzL1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hamF4LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIFRoaXMgaXMgdGhlIFByaW50IG9iamVjdC4gSW4gdGhlIFF1aXogZ2FtZSB0aGlzIG9iamVjdCBjb250YWlucyBtb3N0IG9mIHRoZSBmdW5jdGlvbmFsbGl0eSB1c2VkIHdoZW4gYWx0ZXJpbmcgdGhlIEhUTUwuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gUHJpbnQoKSB7XG5cbiAgICAvKipcbiAgICAgKiBQcmludHMgdGhlIHF1ZXN0aW9ucyB0byB0aGUgcXVlc3Rpb25QYXJhZ3JhcGggaW4gdGhlIGh0bWwgZmlsZS5cbiAgICAgKiBAcGFyYW0gcXVlc3Rpb25cbiAgICAgKi9cbiAgICB0aGlzLnF1ZXN0aW9uID0gZnVuY3Rpb24ocXVlc3Rpb24pIHtcbiAgICAgICAgdmFyIHF1ZXN0aW9uUGFyYWdyYXBoO1xuXG4gICAgICAgIHF1ZXN0aW9uUGFyYWdyYXBoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNxdWVzdGlvblBhcmFncmFwaFwiKTtcbiAgICAgICAgcXVlc3Rpb25QYXJhZ3JhcGgudGV4dENvbnRlbnQgPSBxdWVzdGlvbjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhlIGNvcnJlY3QgdGVtcGxhdGUgYW5kIHB1dCdzIGl0IGludG8gdGhlIGJvdHRvbSBjb250YWluZXIuIFRoZSBmb3JtIGlzIHRoZW4gcmV0dXJuZWQgc28gaXRcbiAgICAgKiBjYW4gYmUgcmVtb3ZlZCBlYXNpbHkuXG4gICAgICogQHBhcmFtIGFsdGVybmF0aXZlc1xuICAgICAqIEByZXR1cm5zIHsqfVxuICAgICAqL1xuICAgIHRoaXMuYW5zd2VyID0gZnVuY3Rpb24oYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgIHZhciBmb3JtO1xuICAgICAgICB2YXIgbGFibGVzO1xuICAgICAgICB2YXIgdGV4dE5vZGU7XG5cbiAgICAgICAgaWYgKGFsdGVybmF0aXZlcykge1xuXG4gICAgICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwiYWx0ZXJuYXRpdmVBbnN3ZXJUZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgICAgIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FsdGVybmF0aXZlQW5zd2VyRm9ybVwiKTtcbiAgICAgICAgICAgIGxhYmxlcyA9IGZvcm0ucXVlcnlTZWxlY3RvckFsbChcImxhYmxlXCIpO1xuXG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQxKTtcbiAgICAgICAgICAgIGxhYmxlc1swXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQyKTtcbiAgICAgICAgICAgIGxhYmxlc1sxXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQzKTtcbiAgICAgICAgICAgIGxhYmxlc1syXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGFsdGVybmF0aXZlcy5hbHQ0KTtcbiAgICAgICAgICAgIGxhYmxlc1szXS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwidGV4dEFuc3dlclRlbXBsYXRlXCIsIFwiYm90dG9tQ29udGFpbmVyXCIpO1xuICAgICAgICAgICAgZm9ybSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGV4dEFuc3dlckZvcm1cIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZm9ybTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhlIHRlbXBsYXRlIHNvIHRoZSB1c2VyIGNhbiBmaWxsIGluIGl0J3Mgbmlja25hbWVcbiAgICAgKiBAcmV0dXJucyB7RWxlbWVudH1cbiAgICAgKi9cbiAgICB0aGlzLm5pY2tuYW1lRm9ybSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwibmlja25hbWVUZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbmlja25hbWVGb3JtXCIpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBMb2FkcyB0aGUgY29ycmVjdCB0ZW1wbGF0ZSBhbmQgcHJlc2VudHMgdGhlIHBsYXllciB3aXRoIGhpcyBzY29yZSB0aGlzIHJvdW5kIGFuZCB0aGUgdG9wIDUgc2NvcmVzIHNhdmVkIG9uXG4gICAgICogdGhpcyBsb2NhbCBzdG9yYWdlLlxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHBhcmFtIHRpbWVcbiAgICAgKi9cbiAgICB0aGlzLmdhbWVXb24gPSBmdW5jdGlvbihuYW1lLCB0aW1lKSB7XG4gICAgICAgIHZhciBoaWdoU2NvcmVzO1xuICAgICAgICB2YXIgZnJhZ21lbnQ7XG4gICAgICAgIHZhciB0ZXh0Tm9kZTtcbiAgICAgICAgdmFyIGxpc3Q7XG4gICAgICAgIHZhciBsaXN0RWxlbWVudDtcbiAgICAgICAgdmFyIHBsYXllclNjb3JlO1xuICAgICAgICB2YXIgaTtcblxuICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwiZ2FtZVdvblRlbXBsYXRlXCIsIFwiYm90dG9tQ29udGFpbmVyXCIpO1xuICAgICAgICBwbGF5ZXJTY29yZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcGxheWVyU2NvcmVcIik7XG4gICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobmFtZSArIFwiLCB5b3VyIHRpbWUgd2FzOiBcIiArIHRpbWUpO1xuICAgICAgICBwbGF5ZXJTY29yZS5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICAgIGhpZ2hTY29yZXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaFNjb3Jlc1wiKSk7XG4gICAgICAgIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICAgICAgICBsaXN0ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNzY29yZUJvYXJkXCIpO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBoaWdoU2NvcmVzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICAgICAgICBsaXN0RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgICAgICAgIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJOYW1lOiBcIiArIGhpZ2hTY29yZXNbaV0ubmlja25hbWUgKyBcIiBUaW1lOiBcIiArIGhpZ2hTY29yZXNbaV0udGltZSk7XG4gICAgICAgICAgICBsaXN0RWxlbWVudC5hcHBlbmRDaGlsZCh0ZXh0Tm9kZSk7XG4gICAgICAgICAgICBmcmFnbWVudC5hcHBlbmRDaGlsZChsaXN0RWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICBsaXN0LmFwcGVuZENoaWxkKGZyYWdtZW50KTtcblxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RpbWVQYXJhZ3JhcGhcIikudGV4dENvbnRlbnQgPSBcIlwiO1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3F1ZXN0aW9uUGFyYWdyYXBoXCIpLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhlIGNvcnJlY3QgdGVtcGxhdGUgYW5kIHByZXNlbnRzIGEgbWVzc2FnZSB0byB0ZWxsIHRoZSBwbGF5ZXIgdGhhdCBoZS9zaGUgbG9zdCBhbmQgd2h5IHRoZXkgbG9zdC5cbiAgICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgICAqL1xuICAgIHRoaXMuZ2FtZUxvc3QgPSBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgICAgIHZhciBwYXJhZ3JhcGg7XG4gICAgICAgIHZhciB0ZXh0Tm9kZTtcblxuICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwiZ2FtZUxvc3RUZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgcGFyYWdyYXBoID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNtZXNzYWdlXCIpO1xuICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpO1xuICAgICAgICBwYXJhZ3JhcGguYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIGlzIGEgaGVscGVyIG1ldGhvZCB1c2VkIGluIG1hbnkgb2YgdGhlIG90aGVyIHByaW50IG1ldGhvZHMuIEl0J3MgdXNlZCB0byBsb2FkIGEgdGVtcGxhdGUgaW50byBhIGNvbnRhaW5lci5cbiAgICAgKiBAcGFyYW0gdGVtcGxhdGVOYW1lXG4gICAgICogQHBhcmFtIGNvbnRhaW5lck5hbWVcbiAgICAgKi9cbiAgICB0aGlzLmFkZFRlbXBsYXRlID0gZnVuY3Rpb24odGVtcGxhdGVOYW1lLCBjb250YWluZXJOYW1lKSB7XG4gICAgICAgIHZhciBjb250YWluZXI7XG4gICAgICAgIHZhciB0ZW1wbGF0ZTtcbiAgICAgICAgdmFyIGZvcm07XG5cbiAgICAgICAgY29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNcIiArIGNvbnRhaW5lck5hbWUpO1xuICAgICAgICB0ZW1wbGF0ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyB0ZW1wbGF0ZU5hbWUpO1xuICAgICAgICBmb3JtID0gZG9jdW1lbnQuaW1wb3J0Tm9kZSh0ZW1wbGF0ZS5jb250ZW50LCB0cnVlKTtcbiAgICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKGZvcm0pO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gUHJpbnQ7XG4iLCJ2YXIgYWpheCA9IHJlcXVpcmUoXCIuL2FqYXhcIik7XG52YXIgVGltZXIgPSByZXF1aXJlKFwiLi9UaW1lclwiKTtcbnZhciBQcmludCA9IHJlcXVpcmUoXCIuL1ByaW50XCIpO1xuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBRdWl6IG9iamVjdC4gVGhpcyBvYmplY3QgY29udGFpbnMgdGhlIGxvZ2ljIGFuZCBjb21tdW5pY2F0aW9uIHRvb2xzIGZvciBhIHF1aXogZ2FtZS5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBRdWl6KCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpcy5wcmludCA9IG5ldyBQcmludCgpO1xuICAgIHRoaXMudGltZXIgPSBuZXcgVGltZXIoKTtcbiAgICB0aGlzLm5pY2tuYW1lID0gXCJcIjtcbn1cblxuUXVpei5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5uaWNrbmFtZSA9IHRoaXMuZ2V0Tmlja25hbWUoKTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgY29udGVudCBvZiBhbmQgaW5wdXQgdGV4dCB0byBiZSB1c2VkIGFzIGEgbmFtZSBmb3IgdGhlIHBsYXllci4gSXQgYWxzb1xuICovXG5RdWl6LnByb3RvdHlwZS5nZXROaWNrbmFtZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyIGZvcm07XG4gICAgdmFyIG1lc3NhZ2U7XG5cbiAgICBmb3JtID0gdGhpcy5wcmludC5uaWNrbmFtZUZvcm0oKTtcbiAgICBtZXNzYWdlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNuaWNrTWVzc2FnZVwiKTtcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbiBzZXROaWNrbmFtZShldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfdGhpcy5uaWNrbmFtZSA9IGZvcm0uZmlyc3RFbGVtZW50Q2hpbGQudmFsdWU7XG4gICAgICAgIGlmIChfdGhpcy5uaWNrbmFtZSkge1xuICAgICAgICAgICAgZm9ybS5yZW1vdmVFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIHNldE5pY2tuYW1lKTtcbiAgICAgICAgICAgIGZvcm0ucmVtb3ZlKCk7XG4gICAgICAgICAgICBfdGhpcy5nZXRRdWVzdGlvbigpO1xuICAgICAgICAgICAgbWVzc2FnZS50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gXCJQbGVhc2Ugd3JpdGUgeW91ciBuaWNrbmFtZVwiO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIHF1ZXN0aW9ucyBmcm9tIHRoZSBzZXJ2ZXIgYW5kIGNhbGxzIG5lY2Vzc2FyeSBmdW5jdGlvbnMgd2hlbiBkYXRhIGZyb20gdGhlIHNlcnZlciBoYXMgYmVlbiBkb3dubG9hZGVkXG4gKiB0byB0aGUgY2xpZW50LlxuICogQHRocm93IGVycm9yXG4gKiBAcGFyYW0gbmV3VVJMXG4gKi9cblF1aXoucHJvdG90eXBlLmdldFF1ZXN0aW9uID0gZnVuY3Rpb24obmV3VVJMKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgYWpheENvbmZpZztcbiAgICB2YXIgcmVzcG9uc2U7XG5cbiAgICBhamF4Q29uZmlnID0ge1xuICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXG4gICAgICAgIHVybDogbmV3VVJMIHx8IFwiaHR0cDovL3Zob3N0My5sbnUuc2U6MjAwODAvcXVlc3Rpb24vMVwiXG4gICAgfTtcblxuICAgIGFqYXgucmVxdWVzdChhamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAoXCJOZXR3b3JrIGVycm9yIFwiICsgZXJyb3IpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzcG9uc2UgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgX3RoaXMucHJpbnQucXVlc3Rpb24ocmVzcG9uc2UucXVlc3Rpb24pO1xuICAgICAgICAgICAgX3RoaXMucG9zdEFuc3dlcihyZXNwb25zZS5uZXh0VVJMLCByZXNwb25zZS5hbHRlcm5hdGl2ZXMpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIENhbGxzIGZ1bmN0aW9ucyB0byByZW5kZXIgYW5zd2VyIGZvcm0sIHN0YXJ0IHRoZSB0aW1lciBhbmQgY3JlYXRlcyBhbiBldmVudCBsaXN0ZW5lciBvbiB0aGUgZm9ybS4gV2hlbiBldmVudCBpc1xuICogdHJpZ2dlcmVkLCB0aW1lciBzdG9wcywgdGhlIGZvcm0gaXMgcmVtb3ZlZCBhbmQgdGhlIGFuc3dlcnMgYXJlIHNlbnQgdG8gdGhlIHNlcnZlci4gVGhlIHJlc3BvbnNlIGJhY2sgaXMgYW5hbHlzZWRcbiAqIGFuZCBkZXBlbmRpbmcgb24gdGhlIHJlc3BvbnNlIGZyb20gdGhlIHNlcnZlciBzb21ldGhpbmcgd2lsbCBoYXBwZW4uXG4gKiBAcGFyYW0gbmV3VVJMXG4gKiBAcGFyYW0gYWx0ZXJuYXRpdmVzXG4gKi9cblF1aXoucHJvdG90eXBlLnBvc3RBbnN3ZXIgPSBmdW5jdGlvbihuZXdVUkwsIGFsdGVybmF0aXZlcykge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdmFyIGFuc3dlcjtcbiAgICB2YXIgZm9ybTtcbiAgICB2YXIgYWpheENvbmZpZztcblxuICAgIGZvcm0gPSB0aGlzLnByaW50LmFuc3dlcihhbHRlcm5hdGl2ZXMpO1xuXG4gICAgX3RoaXMudGltZXIuc3RhcnRUaW1lcihmdW5jdGlvbigpIHtcbiAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICAgICAgX3RoaXMucHJpbnQuZ2FtZUxvc3QoXCJZb3UgcmFuIG91dCBvZiB0aW1lXCIpO1xuICAgIH0pO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uIHN1Ym1pdEFuc3dlcihldmVudCkge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBfdGhpcy50aW1lci5zdG9wVGltZXIoKTtcblxuICAgICAgICBhbnN3ZXIgPSBfdGhpcy5nZXRBbnN3ZXIoYWx0ZXJuYXRpdmVzLCBmb3JtKTtcbiAgICAgICAgYWpheENvbmZpZyA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICB1cmw6IG5ld1VSTCxcbiAgICAgICAgICAgIGNvbnRlbnRUeXBlOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICAgIGFuc3dlcjogSlNPTi5zdHJpbmdpZnkoYW5zd2VyKVxuICAgICAgICB9O1xuICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgICAgICBhamF4LnJlcXVlc3QoYWpheENvbmZpZywgZnVuY3Rpb24oZXJyb3IsIGRhdGEpIHtcbiAgICAgICAgICAgIF90aGlzLmFuYWx5emVSZXNwb25zZShlcnJvciwgSlNPTi5wYXJzZShkYXRhKSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBhbnN3ZXJzIGZyb20gdGhlIGFuc3dlciBmb3JtLiBEZXBlbmRpbmcgb24gaWYgdGhlIGFuc3dlcnMgaGFzIGFsdGVybmF0aXZlcyBvciBpZiBpdCdzIGp1c3QgYSB0ZXh0IGJveCwgdGhlXG4gKiB3YXkgdGhlIGZ1bmN0aW9uIGNvbGxlY3RzIHRoZSBhbnN3ZXJzIGRpZmZlcnMuIFRoZSBhbnN3ZXIgaXMgdGhlbiByZXR1cm5lZC5cbiAqIEBwYXJhbSBhbHRlcm5hdGl2ZXNcbiAqIEBwYXJhbSBmb3JtXG4gKiBAcmV0dXJucyB7e2Fuc3dlcjogKn18Kn1cbiAqL1xuUXVpei5wcm90b3R5cGUuZ2V0QW5zd2VyID0gZnVuY3Rpb24oYWx0ZXJuYXRpdmVzLCBmb3JtKSB7XG4gICAgdmFyIGFuc3dlcjtcbiAgICB2YXIgYW5zd2VyT2JqO1xuICAgIHZhciBidXR0b25zO1xuICAgIHZhciBpO1xuXG4gICAgaWYgKGFsdGVybmF0aXZlcykge1xuICAgICAgICBidXR0b25zID0gZm9ybS5xdWVyeVNlbGVjdG9yQWxsKFwiaW5wdXRcIik7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBidXR0b25zLmxlbmd0aCAtIDE7IGkgKz0gMSkge1xuICAgICAgICAgICAgaWYgKGJ1dHRvbnNbaV0uY2hlY2tlZCkge1xuICAgICAgICAgICAgICAgIGFuc3dlciA9IGJ1dHRvbnNbaV0udmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBhbnN3ZXIgPSBmb3JtLmZpcnN0RWxlbWVudENoaWxkLnZhbHVlO1xuICAgIH1cblxuICAgIGFuc3dlck9iaiA9IHtcbiAgICAgICAgYW5zd2VyOiBhbnN3ZXJcbiAgICB9O1xuXG4gICAgcmV0dXJuIGFuc3dlck9iajtcbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgYW5hbHlzZXMgdGhlIHJlc3BvbnNlIHRoZSBzZXJ2ZXIgZ2F2ZSB0aGUgY2xpZW50IHdoZW4gaXQgcmVjZWl2ZWQgdGhlIHRoZSBhbnN3ZXJzLiBJdCBjaGVja3MgaWYgdGhlcmVcbiAqIHdhcyBhbiBlcnJvciwgb3IgaWYgdGhlcmUgYXJlIG1vcmUgcXVlc3Rpb25zLCBpZiB0aGUgYW5zd2VyIHRoZSBjbGllbnQgZ2F2ZSB3YXMgd3JvbmcsIGFuZCB0aGVuIGl0IGNhbGxzIHRoZVxuICogYXBwcm9wcmlhdGUgZnVuY3Rpb25zLlxuICogQHBhcmFtIGVycm9yXG4gKiBAcGFyYW0gcmVzcG9uc2VcbiAqL1xuUXVpei5wcm90b3R5cGUuYW5hbHl6ZVJlc3BvbnNlID0gZnVuY3Rpb24oZXJyb3IsIHJlc3BvbnNlKSB7XG4gICAgdmFyIG5hbWU7XG4gICAgdmFyIHRpbWU7XG5cbiAgICBpZiAoZXJyb3IpIHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMucHJpbnQuZ2FtZUxvc3QocmVzcG9uc2UubWVzc2FnZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgKFwiTmV0d29yayBlcnJvciBcIiArIGVycm9yKTtcbiAgICAgICAgfVxuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlc3BvbnNlLm5leHRVUkwpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0UXVlc3Rpb24ocmVzcG9uc2UubmV4dFVSTCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aW1lID0gdGhpcy50aW1lci5nZXRUb3RhbFRpbWUoKTtcbiAgICAgICAgICAgIG5hbWUgPSB0aGlzLm5pY2tuYW1lO1xuICAgICAgICAgICAgdGhpcy5zYXZlSGlnaFNjb3JlKG5hbWUsIHRpbWUpO1xuICAgICAgICAgICAgdGhpcy5wcmludC5nYW1lV29uKG5hbWUsIHRpbWUpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBpZiBhIG5ldyBKU09OIGFiamVjdCBuZWVkIHRvIGJlIGNyZWF0ZWQgdG8gc2F2ZSB0aGUgc2NvcmVzIG9yIGlmIHRoZXJlIGFscmVhZHkgaXMgb25lIGFuZCB3ZSBjYW5cbiAqIHNhdmUgaW4gdGhhdCBvbmUuIEl0IHRoZW4gY2FsbHMgdGhlIGFwcHJvcHJpYXRlIGZ1bmN0aW9uLlxuICogQHBhcmFtIG5hbWVcbiAqIEBwYXJhbSB0aW1lXG4gKi9cblF1aXoucHJvdG90eXBlLnNhdmVIaWdoU2NvcmUgPSBmdW5jdGlvbihuYW1lLCB0aW1lKSB7XG4gICAgdmFyIGhpZ2hTY29yZXM7XG5cbiAgICBoaWdoU2NvcmVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hTY29yZXNcIikpO1xuICAgIGlmIChoaWdoU2NvcmVzKSB7XG4gICAgICAgIHRoaXMuc2F2ZVRvU2NvcmVCb2FyZChuYW1lLCB0aW1lLCBoaWdoU2NvcmVzKTtcblxuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY3JlYXRlU2NvcmVCb2FyZChuYW1lLCB0aW1lKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY3JlYXRlcyBhIG5ldyBKU09OIG9iamVjdCB0byBrZWVwIHRoZSBzY29yZXMgaW4uIFRoZSBvYmplY3QgaXMgdHVybmVkIHRvIGEgc3RyaW5nIGFuZCBzYXZlZCBpblxuICogbG9jYWwgc3RvcmFnZS5cbiAqIEBwYXJhbSBuYW1lXG4gKiBAcGFyYW0gdGltZVxuICovXG5RdWl6LnByb3RvdHlwZS5jcmVhdGVTY29yZUJvYXJkID0gZnVuY3Rpb24obmFtZSwgdGltZSkge1xuICAgIHZhciBoaWdoU2NvcmVzO1xuXG4gICAgaGlnaFNjb3JlcyA9IFtcbiAgICAgICAge25pY2tuYW1lOiBuYW1lLCB0aW1lOiB0aW1lfVxuICAgIF07XG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJoaWdoU2NvcmVzXCIsIEpTT04uc3RyaW5naWZ5KGhpZ2hTY29yZXMpKTtcbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBzYXZlIHRoZSB0b3AgNSBoaWdoc2NvcmVzIG9mIHRoZSBnYW1lLiBJdCB0YWtlIHRoZSBuZXcgc2NvcmUgYW5kIHB1c2hlcyBpdCBpbnRvIHRoZSBhcnJheS5cbiAqIFRoZSBhcnJheSBpcyB0aGVuIHNvcnRlZCwgYW5kIGlmIHRoZSBhcnJheSBpcyBsb25nZXIgdGhhbiA1IGVsZW1lbnQgdGhlIDZ0aCBlbGVtZW50IGlzIHJlbW92ZWQuIFRoZSBKU09OIG9iamVjdCBpc1xuICogdGhlbiBwdXQgYmFjayBpbnRvIGxvY2FsIHN0b3JhZ2UuXG4gKiBAcGFyYW0gbmFtZVxuICogQHBhcmFtIHRpbWVcbiAqIEBwYXJhbSBoaWdoU2NvcmVzXG4gKi9cblF1aXoucHJvdG90eXBlLnNhdmVUb1Njb3JlQm9hcmQgPSBmdW5jdGlvbihuYW1lLCB0aW1lLCBoaWdoU2NvcmVzKSB7XG4gICAgaGlnaFNjb3Jlcy5wdXNoKHtuaWNrbmFtZTogbmFtZSwgdGltZTogdGltZX0pO1xuICAgIGhpZ2hTY29yZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBOdW1iZXIoYS50aW1lKSAtIE51bWJlcihiLnRpbWUpO1xuICAgIH0pO1xuXG4gICAgaGlnaFNjb3Jlcy5zcGxpY2UoNSwgMSk7XG5cbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hTY29yZXNcIiwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlcykpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBRdWl6O1xuIiwiLyoqXG4gKiBUaGlzIGlzIGEgVGltZXIgb2JqZWN0LiBJdCdzIHVzZWQgdG8gdGFrZSB0aGUgdGltZSBhIHBsYXllciB0YWtlcyB0byBhbnN3ZXIgYSBxdWVzdGlvbi4gSXQgY2FuIHN0YXJ0LCBzdG9wLCBhbmRcbiAqIHVwZGF0ZXMgdGhlIGh0bWwgdG8gc2hvdyB0aGUgdGltZS4gSXQgYWxzbyBzYXZlcyB0aGUgdG90YWwgYW1vdW50IG9mIHRpbWUgdGhlIHBsYXllciB0b29rIHRvIGFuc3dlciBhbGwgdGhlXG4gKiBxdWVzdGlvbnMuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gVGltZXIoKSB7XG4gICAgdmFyIHRpbWU7XG4gICAgdmFyIHRvdGFsVGltZSA9IDA7XG4gICAgdmFyIHRpbWVySW50ZXJ2YWw7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgbXlDYWxsYmFjayA7XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBzdGFydHMgdGhlIHRpbWVyLiBJdCdzIHBhcmFtYXRlciBpcyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHVzZWQgaW4gdGhlIHVwZGF0ZSBtZXRob2QgZm9yIHdoZW4gdGhlIHRpbWVcbiAgICAgKiBydW5zIG91dC4gSGVyZSB3ZSBhbHNvIHNldCB0aGUgdGltZSBhbmQgdGhlIHN0YXJ0IHRoZSB0aW1lci5cbiAgICAgKiBAcGFyYW0gY2FsbGJhY2tcbiAgICAgKi9cbiAgICB0aGlzLnN0YXJ0VGltZXIgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgICAgICBteUNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIHRpbWUgPSAyMDtcbiAgICAgICAgdGltZXJJbnRlcnZhbCA9IHdpbmRvdy5zZXRJbnRlcnZhbCh0aGlzLnVwZGF0ZVRpbWVyLCAxMDApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBzdG9wcyB0aGUgdGltZXIgYW5kIGFkZHMgdGhlIHRpbWUgc3BlbnQgdG8gdGhlIHRvdGFsIHRpbWUuXG4gICAgICovXG4gICAgdGhpcy5zdG9wVGltZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdG90YWxUaW1lICs9IDIwIC0gdGltZTtcbiAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGltZXJJbnRlcnZhbCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHVwZGF0ZXMgdGhlIGh0bWwgZmlsZSBvbiBob3cgbXVjaCB0aW1lIGlzIGxlZnQuIEl0IGFsc28gY2hlY2tzIGlmIHRoZSB0aW1lIGhhcyBydW4gb3V0LiBJdCBpdCBoYXMgaXRcbiAgICAgKiB3aWxsIHN0b3AgdGhlIHRpbWVyIGFuZCBjYWxsIHRoZSBjYWxsYmFjayBmdW5jdGlvbi5cbiAgICAgKi9cbiAgICB0aGlzLnVwZGF0ZVRpbWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aW1lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdGltZVBhcmFncmFwaFwiKTtcbiAgICAgICAgdGltZSAtPSAwLjE7XG4gICAgICAgIGlmICh0aW1lIDw9IDApIHtcbiAgICAgICAgICAgIF90aGlzLnN0b3BUaW1lcigpO1xuICAgICAgICAgICAgdGltZXIudGV4dENvbnRlbnQgPSB0aW1lLnRvRml4ZWQoMSk7XG4gICAgICAgICAgICBteUNhbGxiYWNrKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aW1lci50ZXh0Q29udGVudCA9IHRpbWUudG9GaXhlZCgxKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCByZXR1cm5lcyB0aGUgdG90YWwgdGltZSBzcGVudC5cbiAgICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMuZ2V0VG90YWxUaW1lID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0b3RhbFRpbWUudG9GaXhlZCgyKTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFRpbWVyO1xuIiwiZnVuY3Rpb24gcmVxdWVzdChjb25maWcsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG4gICAgcmVxLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAocmVxLnN0YXR1cyA+PSA0MDApIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKHJlcS5zdGF0dXMsIHJlcS5yZXNwb25zZVRleHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJlcS5vcGVuKGNvbmZpZy5tZXRob2QsIGNvbmZpZy51cmwpO1xuICAgIHJlcS5zZXRSZXF1ZXN0SGVhZGVyKFwiQ29udGVudC10eXBlXCIsIGNvbmZpZy5jb250ZW50VHlwZSk7XG4gICAgcmVxLnNlbmQoY29uZmlnLmFuc3dlcik7XG59XG5cbm1vZHVsZS5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuIiwidmFyIFF1aXogPSByZXF1aXJlKFwiLi9RdWl6XCIpO1xuXG52YXIgcXVpekdhbWUgPSBuZXcgUXVpeigpO1xuXG5xdWl6R2FtZS5ydW4oKTtcbiJdfQ==
