var pwdWindow = require("./pwdWindow");

function launchApplication(appID) {
    var appWindow;
    var launcherSpace;
    var launcher;

    appWindow = pwdWindow.createWindow();
    launcherSpace = require("./launchers");

    try {
        launcher = launcherSpace[appID];
        launcher(appWindow);
    } catch (error) {
        launcherSpace.error(appWindow);
    }
}

module.exports.launchApplication = launchApplication;
