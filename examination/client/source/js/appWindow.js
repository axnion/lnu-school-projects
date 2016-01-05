function moveElement(event, appWindow, offsetX, offsetY) {
    console.log(appWindow);
    if (pressed) {
        appWindow.style.left = event.clientX - (offsetX + 2);
        appWindow.style.top = event.clientY - (offsetY + 2);
    }
}

function releaseElement(event, appWindow) {
    console.log(appWindow);
    lastIndex += 1;
    appWindow.style.zIndex = lastIndex;

    pressed = false;
    document.removeEventListener("mouseup", releaseElement);
}

function grabElement(event, appWindow) {
    event.stopPropagation();
    var offsetX = event.offsetX;
    var offsetY = event.offsetY;
    pressed = true;

    console.log("lol");

    console.log(appWindow);
    document.addEventListener("mousemove", moveElement(event, appWindow, offsetX, offsetY));

    document.addEventListener("mouseup", releaseElement(event, appWindow));
}
