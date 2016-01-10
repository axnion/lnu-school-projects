//TODO Spara settings i localstorage.
//TODO Hide taskbar

function launch(container) {
    var text = document.createTextNode("This is the settings. We are not home right now but leave a message");
    container.appendChild(text);
}

module.exports.launch = launch;
