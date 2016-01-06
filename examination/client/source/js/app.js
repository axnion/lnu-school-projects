var pwdApplication = require("./pwdApplication");

var launchTest = document.querySelector("#launchTest");
var launchError = document.querySelector("#launchError");

launchTest.addEventListener("click", function() {
    pwdApplication.launchApplication("test");
});
launchError.addEventListener("click", function() {
    pwdApplication.launchApplication("error");
});
