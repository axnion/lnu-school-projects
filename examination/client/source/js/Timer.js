function Timer(callback) {
    var time;
    var timerInterval;
    var _this = this;

    this.startTimer = function() {
        time = 5;
        timerInterval = window.setInterval(this.updateTimer, 100);
    };

    this.stopTimer = function() {
        window.clearInterval(timerInterval);
    };

    this.updateTimer = function() {
        var timer = document.querySelector("#time");
        time -= 0.1;
        if (time <= 0.1) {
            _this.stopTimer();
            timer.textContent = time.toFixed(1);
            callback();
        } else {
            timer.textContent = time.toFixed(1);
        }
    };
}

module.exports = Timer;
