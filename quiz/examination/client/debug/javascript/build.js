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

},{}],2:[function(require,module,exports){
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

    req.open(config.method, config.url, true);
    req.setRequestHeader("Content-type", config.contentType);
    req.send(config.answer);
}

module.exports.request = request;

},{}],5:[function(require,module,exports){
var Quiz = require("./Quiz");

var quizGame = new Quiz();

quizGame.run();

},{"./Quiz":2}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL2hvbWUvdmFncmFudC8ubnZtL3ZlcnNpb25zL25vZGUvdjUuMS4wL2xpYi9ub2RlX21vZHVsZXMvd2F0Y2hpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImNsaWVudC9zb3VyY2UvanMvUHJpbnQuanMiLCJjbGllbnQvc291cmNlL2pzL1F1aXouanMiLCJjbGllbnQvc291cmNlL2pzL1RpbWVyLmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hamF4LmpzIiwiY2xpZW50L3NvdXJjZS9qcy9hcHAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBUaGlzIGlzIHRoZSBQcmludCBvYmplY3QuIEluIHRoZSBRdWl6IGdhbWUgdGhpcyBvYmplY3QgY29udGFpbnMgbW9zdCBvZiB0aGUgZnVuY3Rpb25hbGxpdHkgdXNlZCB3aGVuIGFsdGVyaW5nIHRoZSBIVE1MLlxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFByaW50KCkge1xuXG4gICAgLyoqXG4gICAgICogUHJpbnRzIHRoZSBxdWVzdGlvbnMgdG8gdGhlIHF1ZXN0aW9uUGFyYWdyYXBoIGluIHRoZSBodG1sIGZpbGUuXG4gICAgICogQHBhcmFtIHF1ZXN0aW9uXG4gICAgICovXG4gICAgdGhpcy5xdWVzdGlvbiA9IGZ1bmN0aW9uKHF1ZXN0aW9uKSB7XG4gICAgICAgIHZhciBxdWVzdGlvblBhcmFncmFwaDtcblxuICAgICAgICBxdWVzdGlvblBhcmFncmFwaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjcXVlc3Rpb25QYXJhZ3JhcGhcIik7XG4gICAgICAgIHF1ZXN0aW9uUGFyYWdyYXBoLnRleHRDb250ZW50ID0gcXVlc3Rpb247XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIExvYWRzIHRoZSBjb3JyZWN0IHRlbXBsYXRlIGFuZCBwdXQncyBpdCBpbnRvIHRoZSBib3R0b20gY29udGFpbmVyLiBUaGUgZm9ybSBpcyB0aGVuIHJldHVybmVkIHNvIGl0XG4gICAgICogY2FuIGJlIHJlbW92ZWQgZWFzaWx5LlxuICAgICAqIEBwYXJhbSBhbHRlcm5hdGl2ZXNcbiAgICAgKiBAcmV0dXJucyB7Kn1cbiAgICAgKi9cbiAgICB0aGlzLmFuc3dlciA9IGZ1bmN0aW9uKGFsdGVybmF0aXZlcykge1xuICAgICAgICB2YXIgZm9ybTtcbiAgICAgICAgdmFyIHZhcmlhYmxlTmFtZVN0cmluZztcbiAgICAgICAgdmFyIHRleHROb2RlO1xuICAgICAgICB2YXIgY291bnRlcjtcbiAgICAgICAgdmFyIHJhZGlvQnV0dG9uO1xuICAgICAgICB2YXIgbGFibGU7XG4gICAgICAgIHZhciBicjtcbiAgICAgICAgdmFyIHN1Ym1pdDtcblxuICAgICAgICBjb3VudGVyID0gMTtcblxuICAgICAgICBpZiAoYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFRlbXBsYXRlKFwiYWx0ZXJuYXRpdmVBbnN3ZXJUZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgICAgIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI2FsdGVybmF0aXZlQW5zd2VyRm9ybVwiKTtcbiAgICAgICAgICAgIHN1Ym1pdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgICAgIHN1Ym1pdC5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsIFwic3VibWl0XCIpO1xuICAgICAgICAgICAgc3VibWl0LnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIFwiT0tcIik7XG5cbiAgICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgICAgICB2YXJpYWJsZU5hbWVTdHJpbmcgPSBcImFsdFwiICsgY291bnRlcjtcblxuICAgICAgICAgICAgICAgIHJhZGlvQnV0dG9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICAgICAgICAgIHJhZGlvQnV0dG9uLnNldEF0dHJpYnV0ZShcInR5cGVcIiwgXCJyYWRpb1wiKTtcbiAgICAgICAgICAgICAgICByYWRpb0J1dHRvbi5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsIFwiYWx0XCIpO1xuICAgICAgICAgICAgICAgIHJhZGlvQnV0dG9uLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsIHZhcmlhYmxlTmFtZVN0cmluZyk7XG4gICAgICAgICAgICAgICAgbGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFibGVcIik7XG4gICAgICAgICAgICAgICAgbGFibGUuc2V0QXR0cmlidXRlKFwiZm9yXCIsIFwicmFkaW9cIik7XG4gICAgICAgICAgICAgICAgYnIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnJcIik7XG4gICAgICAgICAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShhbHRlcm5hdGl2ZXNbdmFyaWFibGVOYW1lU3RyaW5nXSk7XG4gICAgICAgICAgICAgICAgbGFibGUuYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuXG4gICAgICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChyYWRpb0J1dHRvbik7XG4gICAgICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChsYWJsZSk7XG4gICAgICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChicik7XG5cbiAgICAgICAgICAgICAgICBjb3VudGVyICs9IDE7XG4gICAgICAgICAgICB9IHdoaWxlIChhbHRlcm5hdGl2ZXNbXCJhbHRcIiArIGNvdW50ZXJdKTtcblxuICAgICAgICAgICAgZm9ybS5hcHBlbmRDaGlsZChzdWJtaXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcInRleHRBbnN3ZXJUZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgICAgIGZvcm0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3RleHRBbnN3ZXJGb3JtXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGZvcm07XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIExvYWRzIHRoZSB0ZW1wbGF0ZSBzbyB0aGUgdXNlciBjYW4gZmlsbCBpbiBpdCdzIG5pY2tuYW1lXG4gICAgICogQHJldHVybnMge0VsZW1lbnR9XG4gICAgICovXG4gICAgdGhpcy5uaWNrbmFtZUZvcm0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcIm5pY2tuYW1lVGVtcGxhdGVcIiwgXCJib3R0b21Db250YWluZXJcIik7XG4gICAgICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25pY2tuYW1lRm9ybVwiKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTG9hZHMgdGhlIGNvcnJlY3QgdGVtcGxhdGUgYW5kIHByZXNlbnRzIHRoZSBwbGF5ZXIgd2l0aCBoaXMgc2NvcmUgdGhpcyByb3VuZCBhbmQgdGhlIHRvcCA1IHNjb3JlcyBzYXZlZCBvblxuICAgICAqIHRoaXMgbG9jYWwgc3RvcmFnZS5cbiAgICAgKiBAcGFyYW0gbmFtZVxuICAgICAqIEBwYXJhbSB0aW1lXG4gICAgICovXG4gICAgdGhpcy5nYW1lV29uID0gZnVuY3Rpb24obmFtZSwgdGltZSkge1xuICAgICAgICB2YXIgaGlnaFNjb3JlcztcbiAgICAgICAgdmFyIGZyYWdtZW50O1xuICAgICAgICB2YXIgdGV4dE5vZGU7XG4gICAgICAgIHZhciBsaXN0O1xuICAgICAgICB2YXIgbGlzdEVsZW1lbnQ7XG4gICAgICAgIHZhciBwbGF5ZXJTY29yZTtcbiAgICAgICAgdmFyIGk7XG5cbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImdhbWVXb25UZW1wbGF0ZVwiLCBcImJvdHRvbUNvbnRhaW5lclwiKTtcbiAgICAgICAgcGxheWVyU2NvcmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3BsYXllclNjb3JlXCIpO1xuICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG5hbWUgKyBcIiwgeW91ciB0aW1lIHdhczogXCIgKyB0aW1lKTtcbiAgICAgICAgcGxheWVyU2NvcmUuYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICBoaWdoU2NvcmVzID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImhpZ2hTY29yZXNcIikpO1xuICAgICAgICBmcmFnbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtcbiAgICAgICAgbGlzdCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjc2NvcmVCb2FyZFwiKTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgaGlnaFNjb3Jlcy5sZW5ndGg7IGkgKz0gMSkge1xuICAgICAgICAgICAgbGlzdEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICAgICAgICB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTmFtZTogXCIgKyBoaWdoU2NvcmVzW2ldLm5pY2tuYW1lICsgXCIgVGltZTogXCIgKyBoaWdoU2NvcmVzW2ldLnRpbWUpO1xuICAgICAgICAgICAgbGlzdEVsZW1lbnQuYXBwZW5kQ2hpbGQodGV4dE5vZGUpO1xuICAgICAgICAgICAgZnJhZ21lbnQuYXBwZW5kQ2hpbGQobGlzdEVsZW1lbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGlzdC5hcHBlbmRDaGlsZChmcmFnbWVudCk7XG5cbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lUGFyYWdyYXBoXCIpLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiNxdWVzdGlvblBhcmFncmFwaFwiKS50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIExvYWRzIHRoZSBjb3JyZWN0IHRlbXBsYXRlIGFuZCBwcmVzZW50cyBhIG1lc3NhZ2UgdG8gdGVsbCB0aGUgcGxheWVyIHRoYXQgaGUvc2hlIGxvc3QgYW5kIHdoeSB0aGV5IGxvc3QuXG4gICAgICogQHBhcmFtIG1lc3NhZ2VcbiAgICAgKi9cbiAgICB0aGlzLmdhbWVMb3N0ID0gZnVuY3Rpb24obWVzc2FnZSkge1xuICAgICAgICB2YXIgcGFyYWdyYXBoO1xuICAgICAgICB2YXIgdGV4dE5vZGU7XG5cbiAgICAgICAgdGhpcy5hZGRUZW1wbGF0ZShcImdhbWVMb3N0VGVtcGxhdGVcIiwgXCJib3R0b21Db250YWluZXJcIik7XG4gICAgICAgIHBhcmFncmFwaCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjbWVzc2FnZVwiKTtcbiAgICAgICAgdGV4dE5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKTtcbiAgICAgICAgcGFyYWdyYXBoLmFwcGVuZENoaWxkKHRleHROb2RlKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBpcyBhIGhlbHBlciBtZXRob2QgdXNlZCBpbiBtYW55IG9mIHRoZSBvdGhlciBwcmludCBtZXRob2RzLiBJdCdzIHVzZWQgdG8gbG9hZCBhIHRlbXBsYXRlIGludG8gYSBjb250YWluZXIuXG4gICAgICogQHBhcmFtIHRlbXBsYXRlTmFtZVxuICAgICAqIEBwYXJhbSBjb250YWluZXJOYW1lXG4gICAgICovXG4gICAgdGhpcy5hZGRUZW1wbGF0ZSA9IGZ1bmN0aW9uKHRlbXBsYXRlTmFtZSwgY29udGFpbmVyTmFtZSkge1xuICAgICAgICB2YXIgY29udGFpbmVyO1xuICAgICAgICB2YXIgdGVtcGxhdGU7XG4gICAgICAgIHZhciBmb3JtO1xuXG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjXCIgKyBjb250YWluZXJOYW1lKTtcbiAgICAgICAgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI1wiICsgdGVtcGxhdGVOYW1lKTtcbiAgICAgICAgZm9ybSA9IGRvY3VtZW50LmltcG9ydE5vZGUodGVtcGxhdGUuY29udGVudCwgdHJ1ZSk7XG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChmb3JtKTtcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByaW50O1xuIiwidmFyIGFqYXggPSByZXF1aXJlKFwiLi9hamF4XCIpO1xudmFyIFRpbWVyID0gcmVxdWlyZShcIi4vVGltZXJcIik7XG52YXIgUHJpbnQgPSByZXF1aXJlKFwiLi9QcmludFwiKTtcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgUXVpeiBvYmplY3QuIFRoaXMgb2JqZWN0IGNvbnRhaW5zIHRoZSBsb2dpYyBhbmQgY29tbXVuaWNhdGlvbiB0b29scyBmb3IgYSBxdWl6IGdhbWUuXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gUXVpeigpIHtcbiAgICB0aGlzLnByaW50ID0gbmV3IFByaW50KCk7XG4gICAgdGhpcy50aW1lciA9IG5ldyBUaW1lcigpO1xuICAgIHRoaXMubmlja25hbWUgPSBcIlwiO1xufVxuXG5RdWl6LnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLm5pY2tuYW1lID0gdGhpcy5nZXROaWNrbmFtZSgpO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBjb250ZW50IG9mIGFuZCBpbnB1dCB0ZXh0IHRvIGJlIHVzZWQgYXMgYSBuYW1lIGZvciB0aGUgcGxheWVyLiBJdCBhbHNvXG4gKi9cblF1aXoucHJvdG90eXBlLmdldE5pY2tuYW1lID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgZm9ybTtcbiAgICB2YXIgbWVzc2FnZTtcblxuICAgIGZvcm0gPSB0aGlzLnByaW50Lm5pY2tuYW1lRm9ybSgpO1xuICAgIG1lc3NhZ2UgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI25pY2tNZXNzYWdlXCIpO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGZ1bmN0aW9uIHNldE5pY2tuYW1lKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIF90aGlzLm5pY2tuYW1lID0gZm9ybS5maXJzdEVsZW1lbnRDaGlsZC52YWx1ZTtcbiAgICAgICAgaWYgKF90aGlzLm5pY2tuYW1lKSB7XG4gICAgICAgICAgICBmb3JtLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgc2V0Tmlja25hbWUpO1xuICAgICAgICAgICAgZm9ybS5yZW1vdmUoKTtcbiAgICAgICAgICAgIF90aGlzLmdldFF1ZXN0aW9uKCk7XG4gICAgICAgICAgICBtZXNzYWdlLnRleHRDb250ZW50ID0gXCJcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSBcIlBsZWFzZSB3cml0ZSB5b3VyIG5pY2tuYW1lXCI7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogR2V0cyB0aGUgcXVlc3Rpb25zIGZyb20gdGhlIHNlcnZlciBhbmQgY2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB3aGVuIGRhdGEgZnJvbSB0aGUgc2VydmVyIGhhcyBiZWVuIGRvd25sb2FkZWRcbiAqIHRvIHRoZSBjbGllbnQuXG4gKiBAdGhyb3cgZXJyb3JcbiAqIEBwYXJhbSBuZXdVUkxcbiAqL1xuUXVpei5wcm90b3R5cGUuZ2V0UXVlc3Rpb24gPSBmdW5jdGlvbihuZXdVUkwpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBhamF4Q29uZmlnO1xuICAgIHZhciByZXNwb25zZTtcblxuICAgIGFqYXhDb25maWcgPSB7XG4gICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgdXJsOiBuZXdVUkwgfHwgXCJodHRwOi8vdmhvc3QzLmxudS5zZToyMDA4MC9xdWVzdGlvbi8xXCJcbiAgICB9O1xuXG4gICAgYWpheC5yZXF1ZXN0KGFqYXhDb25maWcsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yIChcIk5ldHdvcmsgZXJyb3IgXCIgKyBlcnJvcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICBfdGhpcy5wcmludC5xdWVzdGlvbihyZXNwb25zZS5xdWVzdGlvbik7XG4gICAgICAgICAgICBfdGhpcy5wb3N0QW5zd2VyKHJlc3BvbnNlLm5leHRVUkwsIHJlc3BvbnNlLmFsdGVybmF0aXZlcyk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogQ2FsbHMgZnVuY3Rpb25zIHRvIHJlbmRlciBhbnN3ZXIgZm9ybSwgc3RhcnQgdGhlIHRpbWVyIGFuZCBjcmVhdGVzIGFuIGV2ZW50IGxpc3RlbmVyIG9uIHRoZSBmb3JtLiBXaGVuIGV2ZW50IGlzXG4gKiB0cmlnZ2VyZWQsIHRpbWVyIHN0b3BzLCB0aGUgZm9ybSBpcyByZW1vdmVkIGFuZCB0aGUgYW5zd2VycyBhcmUgc2VudCB0byB0aGUgc2VydmVyLiBUaGUgcmVzcG9uc2UgYmFjayBpcyBhbmFseXNlZFxuICogYW5kIGRlcGVuZGluZyBvbiB0aGUgcmVzcG9uc2UgZnJvbSB0aGUgc2VydmVyIHNvbWV0aGluZyB3aWxsIGhhcHBlbi5cbiAqIEBwYXJhbSBuZXdVUkxcbiAqIEBwYXJhbSBhbHRlcm5hdGl2ZXNcbiAqL1xuUXVpei5wcm90b3R5cGUucG9zdEFuc3dlciA9IGZ1bmN0aW9uKG5ld1VSTCwgYWx0ZXJuYXRpdmVzKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB2YXIgYW5zd2VyO1xuICAgIHZhciBmb3JtO1xuICAgIHZhciBhamF4Q29uZmlnO1xuXG4gICAgZm9ybSA9IHRoaXMucHJpbnQuYW5zd2VyKGFsdGVybmF0aXZlcyk7XG5cbiAgICBfdGhpcy50aW1lci5zdGFydFRpbWVyKGZ1bmN0aW9uKCkge1xuICAgICAgICBmb3JtLnJlbW92ZSgpO1xuICAgICAgICBfdGhpcy5wcmludC5nYW1lTG9zdChcIllvdSByYW4gb3V0IG9mIHRpbWVcIik7XG4gICAgfSk7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24gc3VibWl0QW5zd2VyKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIF90aGlzLnRpbWVyLnN0b3BUaW1lcigpO1xuXG4gICAgICAgIGFuc3dlciA9IF90aGlzLmdldEFuc3dlcihhbHRlcm5hdGl2ZXMsIGZvcm0pO1xuICAgICAgICBhamF4Q29uZmlnID0ge1xuICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgICAgIHVybDogbmV3VVJMLFxuICAgICAgICAgICAgY29udGVudFR5cGU6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgYW5zd2VyOiBKU09OLnN0cmluZ2lmeShhbnN3ZXIpXG4gICAgICAgIH07XG4gICAgICAgIGZvcm0ucmVtb3ZlKCk7XG4gICAgICAgIGFqYXgucmVxdWVzdChhamF4Q29uZmlnLCBmdW5jdGlvbihlcnJvciwgZGF0YSkge1xuICAgICAgICAgICAgX3RoaXMuYW5hbHl6ZVJlc3BvbnNlKGVycm9yLCBKU09OLnBhcnNlKGRhdGEpKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIGFuc3dlcnMgZnJvbSB0aGUgYW5zd2VyIGZvcm0uIERlcGVuZGluZyBvbiBpZiB0aGUgYW5zd2VycyBoYXMgYWx0ZXJuYXRpdmVzIG9yIGlmIGl0J3MganVzdCBhIHRleHQgYm94LCB0aGVcbiAqIHdheSB0aGUgZnVuY3Rpb24gY29sbGVjdHMgdGhlIGFuc3dlcnMgZGlmZmVycy4gVGhlIGFuc3dlciBpcyB0aGVuIHJldHVybmVkLlxuICogQHBhcmFtIGFsdGVybmF0aXZlc1xuICogQHBhcmFtIGZvcm1cbiAqIEByZXR1cm5zIHt7YW5zd2VyOiAqfXwqfVxuICovXG5RdWl6LnByb3RvdHlwZS5nZXRBbnN3ZXIgPSBmdW5jdGlvbihhbHRlcm5hdGl2ZXMsIGZvcm0pIHtcbiAgICB2YXIgYW5zd2VyO1xuICAgIHZhciBhbnN3ZXJPYmo7XG4gICAgdmFyIGJ1dHRvbnM7XG4gICAgdmFyIGk7XG5cbiAgICBpZiAoYWx0ZXJuYXRpdmVzKSB7XG4gICAgICAgIGJ1dHRvbnMgPSBmb3JtLnF1ZXJ5U2VsZWN0b3JBbGwoXCJpbnB1dFwiKTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGJ1dHRvbnMubGVuZ3RoIC0gMTsgaSArPSAxKSB7XG4gICAgICAgICAgICBpZiAoYnV0dG9uc1tpXS5jaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgYW5zd2VyID0gYnV0dG9uc1tpXS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGFuc3dlciA9IGZvcm0uZmlyc3RFbGVtZW50Q2hpbGQudmFsdWU7XG4gICAgfVxuXG4gICAgYW5zd2VyT2JqID0ge1xuICAgICAgICBhbnN3ZXI6IGFuc3dlclxuICAgIH07XG5cbiAgICByZXR1cm4gYW5zd2VyT2JqO1xufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBhbmFseXNlcyB0aGUgcmVzcG9uc2UgdGhlIHNlcnZlciBnYXZlIHRoZSBjbGllbnQgd2hlbiBpdCByZWNlaXZlZCB0aGUgdGhlIGFuc3dlcnMuIEl0IGNoZWNrcyBpZiB0aGVyZVxuICogd2FzIGFuIGVycm9yLCBvciBpZiB0aGVyZSBhcmUgbW9yZSBxdWVzdGlvbnMsIGlmIHRoZSBhbnN3ZXIgdGhlIGNsaWVudCBnYXZlIHdhcyB3cm9uZywgYW5kIHRoZW4gaXQgY2FsbHMgdGhlXG4gKiBhcHByb3ByaWF0ZSBmdW5jdGlvbnMuXG4gKiBAcGFyYW0gZXJyb3JcbiAqIEBwYXJhbSByZXNwb25zZVxuICovXG5RdWl6LnByb3RvdHlwZS5hbmFseXplUmVzcG9uc2UgPSBmdW5jdGlvbihlcnJvciwgcmVzcG9uc2UpIHtcbiAgICB2YXIgbmFtZTtcbiAgICB2YXIgdGltZTtcblxuICAgIGlmIChlcnJvcikge1xuICAgICAgICBpZiAocmVzcG9uc2UubWVzc2FnZSkge1xuICAgICAgICAgICAgdGhpcy5wcmludC5nYW1lTG9zdChyZXNwb25zZS5tZXNzYWdlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciAoXCJOZXR3b3JrIGVycm9yIFwiICsgZXJyb3IpO1xuICAgICAgICB9XG5cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAocmVzcG9uc2UubmV4dFVSTCkge1xuICAgICAgICAgICAgdGhpcy5nZXRRdWVzdGlvbihyZXNwb25zZS5uZXh0VVJMKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWUgPSB0aGlzLnRpbWVyLmdldFRvdGFsVGltZSgpO1xuICAgICAgICAgICAgbmFtZSA9IHRoaXMubmlja25hbWU7XG4gICAgICAgICAgICB0aGlzLnNhdmVIaWdoU2NvcmUobmFtZSwgdGltZSk7XG4gICAgICAgICAgICB0aGlzLnByaW50LmdhbWVXb24obmFtZSwgdGltZSk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gY2hlY2tzIGlmIGEgbmV3IEpTT04gYWJqZWN0IG5lZWQgdG8gYmUgY3JlYXRlZCB0byBzYXZlIHRoZSBzY29yZXMgb3IgaWYgdGhlcmUgYWxyZWFkeSBpcyBvbmUgYW5kIHdlIGNhblxuICogc2F2ZSBpbiB0aGF0IG9uZS4gSXQgdGhlbiBjYWxscyB0aGUgYXBwcm9wcmlhdGUgZnVuY3Rpb24uXG4gKiBAcGFyYW0gbmFtZVxuICogQHBhcmFtIHRpbWVcbiAqL1xuUXVpei5wcm90b3R5cGUuc2F2ZUhpZ2hTY29yZSA9IGZ1bmN0aW9uKG5hbWUsIHRpbWUpIHtcbiAgICB2YXIgaGlnaFNjb3JlcztcblxuICAgIGhpZ2hTY29yZXMgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiaGlnaFNjb3Jlc1wiKSk7XG4gICAgaWYgKGhpZ2hTY29yZXMpIHtcbiAgICAgICAgdGhpcy5zYXZlVG9TY29yZUJvYXJkKG5hbWUsIHRpbWUsIGhpZ2hTY29yZXMpO1xuXG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jcmVhdGVTY29yZUJvYXJkKG5hbWUsIHRpbWUpO1xuICAgIH1cbn07XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBjcmVhdGVzIGEgbmV3IEpTT04gb2JqZWN0IHRvIGtlZXAgdGhlIHNjb3JlcyBpbi4gVGhlIG9iamVjdCBpcyB0dXJuZWQgdG8gYSBzdHJpbmcgYW5kIHNhdmVkIGluXG4gKiBsb2NhbCBzdG9yYWdlLlxuICogQHBhcmFtIG5hbWVcbiAqIEBwYXJhbSB0aW1lXG4gKi9cblF1aXoucHJvdG90eXBlLmNyZWF0ZVNjb3JlQm9hcmQgPSBmdW5jdGlvbihuYW1lLCB0aW1lKSB7XG4gICAgdmFyIGhpZ2hTY29yZXM7XG5cbiAgICBoaWdoU2NvcmVzID0gW1xuICAgICAgICB7bmlja25hbWU6IG5hbWUsIHRpbWU6IHRpbWV9XG4gICAgXTtcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImhpZ2hTY29yZXNcIiwgSlNPTi5zdHJpbmdpZnkoaGlnaFNjb3JlcykpO1xufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyB1c2VkIHRvIHNhdmUgdGhlIHRvcCA1IGhpZ2hzY29yZXMgb2YgdGhlIGdhbWUuIEl0IHRha2UgdGhlIG5ldyBzY29yZSBhbmQgcHVzaGVzIGl0IGludG8gdGhlIGFycmF5LlxuICogVGhlIGFycmF5IGlzIHRoZW4gc29ydGVkLCBhbmQgaWYgdGhlIGFycmF5IGlzIGxvbmdlciB0aGFuIDUgZWxlbWVudCB0aGUgNnRoIGVsZW1lbnQgaXMgcmVtb3ZlZC4gVGhlIEpTT04gb2JqZWN0IGlzXG4gKiB0aGVuIHB1dCBiYWNrIGludG8gbG9jYWwgc3RvcmFnZS5cbiAqIEBwYXJhbSBuYW1lXG4gKiBAcGFyYW0gdGltZVxuICogQHBhcmFtIGhpZ2hTY29yZXNcbiAqL1xuUXVpei5wcm90b3R5cGUuc2F2ZVRvU2NvcmVCb2FyZCA9IGZ1bmN0aW9uKG5hbWUsIHRpbWUsIGhpZ2hTY29yZXMpIHtcbiAgICBoaWdoU2NvcmVzLnB1c2goe25pY2tuYW1lOiBuYW1lLCB0aW1lOiB0aW1lfSk7XG4gICAgaGlnaFNjb3Jlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIE51bWJlcihhLnRpbWUpIC0gTnVtYmVyKGIudGltZSk7XG4gICAgfSk7XG5cbiAgICBoaWdoU2NvcmVzLnNwbGljZSg1LCAxKTtcblxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiaGlnaFNjb3Jlc1wiLCBKU09OLnN0cmluZ2lmeShoaWdoU2NvcmVzKSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1aXo7XG4iLCIvKipcbiAqIFRoaXMgaXMgYSBUaW1lciBvYmplY3QuIEl0J3MgdXNlZCB0byB0YWtlIHRoZSB0aW1lIGEgcGxheWVyIHRha2VzIHRvIGFuc3dlciBhIHF1ZXN0aW9uLiBJdCBjYW4gc3RhcnQsIHN0b3AsIGFuZFxuICogdXBkYXRlcyB0aGUgaHRtbCB0byBzaG93IHRoZSB0aW1lLiBJdCBhbHNvIHNhdmVzIHRoZSB0b3RhbCBhbW91bnQgb2YgdGltZSB0aGUgcGxheWVyIHRvb2sgdG8gYW5zd2VyIGFsbCB0aGVcbiAqIHF1ZXN0aW9ucy5cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBUaW1lcigpIHtcbiAgICB2YXIgdGltZTtcbiAgICB2YXIgdG90YWxUaW1lID0gMDtcbiAgICB2YXIgdGltZXJJbnRlcnZhbDtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHZhciBteUNhbGxiYWNrIDtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHN0YXJ0cyB0aGUgdGltZXIuIEl0J3MgcGFyYW1hdGVyIGlzIGEgY2FsbGJhY2sgZnVuY3Rpb24gdXNlZCBpbiB0aGUgdXBkYXRlIG1ldGhvZCBmb3Igd2hlbiB0aGUgdGltZVxuICAgICAqIHJ1bnMgb3V0LiBIZXJlIHdlIGFsc28gc2V0IHRoZSB0aW1lIGFuZCB0aGUgc3RhcnQgdGhlIHRpbWVyLlxuICAgICAqIEBwYXJhbSBjYWxsYmFja1xuICAgICAqL1xuICAgIHRoaXMuc3RhcnRUaW1lciA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIG15Q2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgdGltZSA9IDIwO1xuICAgICAgICB0aW1lckludGVydmFsID0gd2luZG93LnNldEludGVydmFsKHRoaXMudXBkYXRlVGltZXIsIDEwMCk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHN0b3BzIHRoZSB0aW1lciBhbmQgYWRkcyB0aGUgdGltZSBzcGVudCB0byB0aGUgdG90YWwgdGltZS5cbiAgICAgKi9cbiAgICB0aGlzLnN0b3BUaW1lciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB0b3RhbFRpbWUgKz0gMjAgLSB0aW1lO1xuICAgICAgICB3aW5kb3cuY2xlYXJJbnRlcnZhbCh0aW1lckludGVydmFsKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgdXBkYXRlcyB0aGUgaHRtbCBmaWxlIG9uIGhvdyBtdWNoIHRpbWUgaXMgbGVmdC4gSXQgYWxzbyBjaGVja3MgaWYgdGhlIHRpbWUgaGFzIHJ1biBvdXQuIEl0IGl0IGhhcyBpdFxuICAgICAqIHdpbGwgc3RvcCB0aGUgdGltZXIgYW5kIGNhbGwgdGhlIGNhbGxiYWNrIGZ1bmN0aW9uLlxuICAgICAqL1xuICAgIHRoaXMudXBkYXRlVGltZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHRpbWVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN0aW1lUGFyYWdyYXBoXCIpO1xuICAgICAgICB0aW1lIC09IDAuMTtcbiAgICAgICAgaWYgKHRpbWUgPD0gMCkge1xuICAgICAgICAgICAgX3RoaXMuc3RvcFRpbWVyKCk7XG4gICAgICAgICAgICB0aW1lci50ZXh0Q29udGVudCA9IHRpbWUudG9GaXhlZCgxKTtcbiAgICAgICAgICAgIG15Q2FsbGJhY2soKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRpbWVyLnRleHRDb250ZW50ID0gdGltZS50b0ZpeGVkKDEpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIHJldHVybmVzIHRoZSB0b3RhbCB0aW1lIHNwZW50LlxuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgdGhpcy5nZXRUb3RhbFRpbWUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRvdGFsVGltZS50b0ZpeGVkKDIpO1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gVGltZXI7XG4iLCJmdW5jdGlvbiByZXF1ZXN0KGNvbmZpZywgY2FsbGJhY2spIHtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChyZXEuc3RhdHVzID49IDQwMCkge1xuICAgICAgICAgICAgY2FsbGJhY2socmVxLnN0YXR1cywgcmVxLnJlc3BvbnNlVGV4dCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXEucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmVxLm9wZW4oY29uZmlnLm1ldGhvZCwgY29uZmlnLnVybCwgdHJ1ZSk7XG4gICAgcmVxLnNldFJlcXVlc3RIZWFkZXIoXCJDb250ZW50LXR5cGVcIiwgY29uZmlnLmNvbnRlbnRUeXBlKTtcbiAgICByZXEuc2VuZChjb25maWcuYW5zd2VyKTtcbn1cblxubW9kdWxlLmV4cG9ydHMucmVxdWVzdCA9IHJlcXVlc3Q7XG4iLCJ2YXIgUXVpeiA9IHJlcXVpcmUoXCIuL1F1aXpcIik7XG5cbnZhciBxdWl6R2FtZSA9IG5ldyBRdWl6KCk7XG5cbnF1aXpHYW1lLnJ1bigpO1xuIl19
