var pwdWindow = require("./window");

function launchApplication(app) {
    var appWindow;
    var launcherSpace;
    var launcher;

    appWindow = pwdWindow.createWindow(app);
    launcherSpace = require("./applications");

    try {
        launcher = launcherSpace[app.id];
        launcher(appWindow);
    } catch (error) {
        launcherSpace.error(appWindow);
    }
}

module.exports.launchApplication = launchApplication;
