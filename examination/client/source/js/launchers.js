function test(container) {
    var text = document.createTextNode("It's working");
    container.appendChild(text);
}

function error(container) {
    var text = document.createTextNode("An error has occured");
    container.appendChild(text);
}

module.exports.test = test;
module.exports.error = error;
