function launch(container) {
    debugger;
    var rows = 4;
    var cols = 4;
    var a;
    var tiles;
    var templateDiv;
    var turn1;
    var turn2;
    var lastTile;
    var pairs = 0;
    var tries = 0;

    tiles = getPictureArray(rows, cols);

    templateDiv = document.querySelectorAll("#memoryGameTemplate")[0].content.firstElementChild;

    var div = document.importNode(templateDiv, false);

    tiles.forEach(function(tile, index) {
        a = document.importNode(templateDiv.firstElementChild, true);

        a.firstElementChild.setAttribute("data-bricknumber", index);

        div.appendChild(a);

        if ((index + 1) % cols === 0) {
            div.appendChild(document.createElement("br"));
        }
    });

    div.addEventListener("click", function(event) {
        event.preventDefault();
        var img = event.target.nodeName === "IMG" ? event.target : event.target.firstElementChild;

        var index = parseInt(img.getAttribute("data-bricknumber"));
        turnBrick(tiles[index], index, img);
    });

    container.appendChild(div);

    function turnBrick(tile, index, img) {
        if (turn2) {return;}

        img.src = "image/" + tile + ".png";

        if (!turn1) {
            turn1 = img;
            lastTile = tile;
        } else {
            if (img === turn1) {return;}

            tries += 1;

            turn2 = img;
            if (tile === lastTile) {
                pairs += 1;

                if (pairs === (cols * rows) / 2) {
                    console.log("Won on " + tries + "tries");
                }

                setTimeout(function(){
                    turn1.parentNode.classList.add("remove");
                    turn2.parentNode.classList.add("remove");

                    turn1 = null;
                    turn2 = null;
                }, 100);
            } else {
                setTimeout(function(){
                    turn1.src = "image/0.png";
                    turn2.src = "image/0.png";
                    turn1 = null;
                    turn2 = null;
                }, 500);
            }
        }
    }

    function getPictureArray(rows, cols) {
        var arr = [];
        var temp;
        var i;

        for (i = 1; i <= (rows * cols) / 2; i += 1) {
            arr.push(i);
            arr.push(i);
        }

        for (i = arr.length - 1; i > 0; i -= 1) {
            var randomNumber = Math.floor(Math.random() * i);
            temp = arr[i];
            arr[i] = arr[randomNumber];
            arr[randomNumber] = temp;
        }

        return arr;
    }
}

module.exports.launch = launch;
