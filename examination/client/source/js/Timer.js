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
