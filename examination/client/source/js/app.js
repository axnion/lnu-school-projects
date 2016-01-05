var button = document.querySelector("#button");
var lastIndex = 0;

function addTemplate(templateName, containerName) {
    var container;
    var template;
    var form;

    container = document.querySelector(containerName);
    template = document.querySelector(templateName);
    form = document.importNode(template.content, true);
    container.appendChild(form);
}

function printWindow() {
    var topbars;
    var appWindows;
    var topbar;
    var appWindow;
    var offsetX;
    var offsetY;
    var newPositionX;
    var newPositionY;
    var i;

    addTemplate("#appWindowTemplate", "body");

    topbars = document.querySelectorAll(".topbar");
    appWindows = document.querySelectorAll(".appWindow");

    topbar = topbars[topbars.length - 1];
    appWindow = appWindows[appWindows.length - 1];

    topbar.addEventListener("mousedown", function pressMouseButton(event) {
        offsetX = event.offsetX;
        offsetY = event.offsetY;

        document.addEventListener("mouseup", function releaseMouseButton(event) {
            newPositionX = event.clientX;
            newPositionY = event.clientY;

            appWindow.style.left = newPositionX - (offsetX + 2);
            appWindow.style.top = newPositionY - (offsetY + 2);

            lastIndex += 1;
            appWindow.style.zIndex = lastIndex;

            document.removeEventListener("mouseup", releaseMouseButton);
        });
    });

    appWindow.addEventListener("click", function() {
        lastIndex += 1;
        appWindow.style.zIndex = lastIndex;
    });
}

button.addEventListener("click", printWindow);
