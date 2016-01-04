var test = document.querySelector("#test");

test.addEventListener("mousedown", function(event) {
    var startX = event.offsetX;
    var startY = event.offsetY;

    document.addEventListener("mouseup", function(event) {
        var endX = event.clientX;
        var endY = event.clientY;

        test.style.left = endX - startX;
        test.style.top = endY - startY;
    });
});
