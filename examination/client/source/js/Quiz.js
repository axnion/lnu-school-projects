var ajax = require("./ajax");

function Quiz() {

}

Quiz.prototype.getNickname = function() {
    var nickContainer = document.querySelector("#nicknameContainer");
    var form = nickContainer.querySelector("form");
    var nickname;

    form.addEventListener("submit", function submit(event) {
        nickname = form.firstElementChild.value;
        console.log(nickname);

        var query = {
            query: form.value
        };

        var ajaxConfig = {
            method: "GET",
            contentType: "application/json",
            url: "http://vhost3.lnu.se:20080/question/1",
            query: JSON.stringify(query)
        };

        ajax.request(ajaxConfig, function(error, data) {
            console.log(data);
        });

        event.preventDefault();
    });
};

module.exports = Quiz;
