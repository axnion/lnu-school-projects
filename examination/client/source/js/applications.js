function test(container) {
    var text = document.createTextNode("This is a test application");
    container.appendChild(text);
}

function error(container) {
    var text = document.createTextNode("An error has occured");
    container.appendChild(text);
}

module.exports.test = test;
module.exports.error = error;
