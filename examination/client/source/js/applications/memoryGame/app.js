var nickname;
var turn1;
var turn2;
var lastTile;
var pairs = 0;
var tries = 0;

function printStartScreen(container) {
    var template;
    var div;
    var i = 0;
    var boardSize;

    template = document.querySelector("#memoryGameStartTemplate");
    div = document.importNode(template.content.firstElementChild, true);

    container.appendChild(div);

    //TODO Lägg till en reject!
    return new Promise (function(resolve) {
        for (i = 0; i < 3; i += 1) {
            div.children[i].addEventListener("click", function(event) {
                event.preventDefault();
                boardSize = this.firstChild.lastChild.nodeValue;
                div.remove();
                resolve(boardSize);
            });
        }
    });
}

function getBricksArray(rows, cols) {
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

function gameLogic(tile, img, rows, cols, container) {
    if (turn2) {return;}
    if (img.getAttribute("data-bricknumber") === "-1") {return;}

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
                container.querySelector(".memoryGameBoard").remove();
                printHighScoreScreen(rows, cols, container);
            }

            setTimeout(function() {
                turn1.parentNode.classList.add("remove");
                turn2.parentNode.classList.add("remove");

                turn1.setAttribute("data-bricknumber", "-1");
                turn2.setAttribute("data-bricknumber", "-1");

                turn1 = null;
                turn2 = null;
            }, 100);
        } else {
            setTimeout(function() {
                turn1.src = "image/0.png";
                turn2.src = "image/0.png";
                turn1 = null;
                turn2 = null;
            }, 500);
        }
    }
}

function addGameMechanics(gameBoard, tiles, rows, cols, container) {
    gameBoard.addEventListener("click", function(event) {
        var img;
        var index;
        event.preventDefault();

        img = event.target.nodeName === "IMG" ? event.target : event.target.firstElementChild;
        index = parseInt(img.getAttribute("data-bricknumber"));
        gameLogic(tiles[index], img, rows, cols, container);
    });
}

function printHighScoreScreen(rows, cols, container) {
    var storageName = "memory" + rows + "x" + cols;
    var template;
    var gameEndDiv;
    var highScore;

    highScore = JSON.parse(localStorage.getItem(storageName));

    template = document.querySelector("#memoryGameEndTemplate");
    gameEndDiv = document.importNode(template.content.firstElementChild, true);

    gameEndDiv.querySelector(".saveHighscoreForm").addEventListener("submit", function(event) {
        event.preventDefault();
        saveHighScore(gameEndDiv.querySelectorAll("input")[0].value);
        gameEndDiv.querySelector(".saveHighscoreForm").remove();
        printHighScore();
    });

    printHighScore();

    container.appendChild(gameEndDiv);

    function printHighScore() {
        highScore = JSON.parse(localStorage.getItem(storageName));
        var oldScore = container.querySelector(".highScore");
        if (oldScore) {
            oldScore.remove();
        }

        if (highScore) {
            var i;
            var score;
            template = gameEndDiv.querySelector("#highScoreTempate");
            var scoreBoard = document.importNode(template.content.firstElementChild, true);

            for (i = 0; i < highScore.length; i += 1) {
                score = document.createTextNode("Nickname: " + highScore[i].nickname + " | Tries: " + highScore[i].tries);
                scoreBoard.children[i].appendChild(score);
            }

            gameEndDiv.appendChild(scoreBoard);

        } else {
            template = gameEndDiv.querySelector("#noHighScoreTempate");
            gameEndDiv.appendChild(document.importNode(template.content.firstElementChild, true));
        }
    }

    function saveHighScore(nickname) {
        if (highScore) {
            highScore.push({nickname: nickname, tries: tries});
            highScore.sort(function(a, b) {
                return Number(a.tries) - Number(b.tries);
            });

            highScore.splice(5, 1);

            localStorage.setItem(storageName, JSON.stringify(highScore));
        } else {
            highScore = [
                {nickname: nickname, tries: tries}
            ];

            localStorage.setItem(storageName, JSON.stringify(highScore));
        }
    }
}

function printGameScreen(cols, tiles) {
    var template;
    var templateContent;
    var div;

    template = document.querySelector("#memoryGameTemplate");
    templateContent = template.content.firstElementChild;
    div = document.importNode(templateContent, false);

    tiles.forEach(function(tile, index) {
        var a;

        a = document.importNode(templateContent.firstElementChild, true);
        a.firstElementChild.setAttribute("data-bricknumber", index);
        div.appendChild(a);

        if ((index + 1) % cols === 0) {
            div.appendChild(document.createElement("br"));
        }
    });

    return div;
}

function playGame(rows, cols, container) {
    var tiles = getBricksArray(rows, cols);
    var gameBoard = printGameScreen(cols, tiles);
    addGameMechanics(gameBoard, tiles, rows, cols, container);
    container.appendChild(gameBoard);
}

function launch(container) {
    printStartScreen(container).then(function(boardSize) {
        var size;
        size = boardSize.split("x");
        playGame(parseInt(size[0]), parseInt(size[1]), container);
    });
}

module.exports.launch = launch;
