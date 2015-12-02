function getNickname() {
    var nickContainer = document.querySelector("#nicknameContainer");
    var form = nickContainer.querySelector("form");
    var nickname;

    form.addEventListener("submit", function submit(event) {
        nickname = form.firstElementChild.value;
        console.log(nickname);
        event.preventDefault();
    });
}

module.exports.getNickname = getNickname;
