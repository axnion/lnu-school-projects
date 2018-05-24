"use strict";

/**
 * This is the main memoryGame function. It creates a new game of memory and display it in the container.
 * @param container The HTML element the application is created in.
 */
function memoryGame(container) {
    var gameBoard;
    var rows;
    var cols;
    var turn1;
    var turn2;
    var lastTile;
    var pairs = 0;
    var tries = 0;

    printStartScreen().then(function(boardSize) {
        var size;
        size = boardSize.split("x");
        rows = parseInt(size[0]);
        cols = parseInt(size[1]);
        playGame();
    });

    /**
     * Starts the main game. Get's the randomized array of bricks, creates and prints the game to the container.
     */
    function playGame() {
        var tiles = getBricksArray();
        gameBoard = printGameScreen(tiles);
        container.appendChild(gameBoard);
    }

    /**
     * Prints the start screen for the memory game displaying the menu with the three chooses for board size. A promise
     * is returned with an event listener on each menu item. When one of the links is clicked an event is triggered and
     * the size of the board is set. The start screen is then removed and the resolve function is called with the board
     * size as an argument.
     * @returns Promise
     */
    function printStartScreen() {
        var template;
        var div;
        var credits;
        var i;
        var boardSize;

        template = document.querySelector("#memoryGameStartTemplate");
        div = document.importNode(template.content.firstElementChild, true);

        template = div.querySelector("#memoryCreditsTemplate");
        credits = document.importNode(template.content, true);
        div.appendChild(credits);

        container.appendChild(div);

        return new Promise (function(resolve) {
            for (i = 1; i < 4; i += 1) {
                div.children[i].addEventListener("click", function(event) {
                    event.preventDefault();
                    boardSize = this.firstChild.lastChild.nodeValue;
                    div.remove();
                    resolve(boardSize);
                });
            }
        });
    }

    /**
     * Prints the gameboard to the container. Loads templates for both game board and brick. Bricks are then loaded into
     * the game board and an event listener is added to every brick with addGameMechanics().
     * @param tiles An array of numbers representing bricks on the board.
     * @returns Node The element containing the gameboard.
     */
    function printGameScreen(tiles) {
        var template;
        var templateContent;
        var div;

        template = document.querySelector("#memoryBrickTemplate");
        templateContent = template.content.firstElementChild;

        template = document.querySelector("#memoryGameTemplate");
        div = document.importNode(template.content.firstElementChild, true);

        tiles.forEach(function(tile, index) {
            var a;

            a = document.importNode(templateContent, true);
            addGameMechanics(a, tile);
            div.appendChild(a);

            if (cols === 2) {
                a.firstElementChild.className = "brickWidth2";
            } else if (cols === 4) {
                a.firstElementChild.className = "brickWidth4";
            }

            if ((index + 1) % cols === 0) {
                div.appendChild(document.createElement("br"));
            }
        });

        return div;
    }

    /**
     * Adds an event listener to look for clicks on the brick. When the event triggers it checks if the target is an
     * image or the link surrounding the image and corrects it to the image. gameLogic is then called with tile, index
     * and image as arguments.
     * @param element An element representing a brick on the board.
     * @param tile A number identifying the type of a brick.
     */
    function addGameMechanics(element, tile) {
        element.addEventListener("click", function(event) {
            var img;
            event.preventDefault();

            img = event.target.nodeName === "IMG" ? event.target : event.target.firstElementChild;

            gameLogic(tile, img);
        });
    }

    /**
     * Creates a shuffled array of number representing the bricks on the board. There is two of each number. It's
     * created, suffled and returned.
     * @returns {Array} Shuffled array of number representing the bricks in the game.
     */
    function getBricksArray() {
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

    /**
     * Contains logic for the flow of the game. Keeps track of where in the game we are and what should happen in every
     * situation. Also keeps the user from breaking the game.
     * @param tile The number used to identify what brick we are dealing with.
     * @param img A reference to the brick on the board.
     */
    function gameLogic(tile, img) {
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
                    gameBoard.remove();
                    printHighScoreScreen();
                }

                setTimeout(function() {
                    turn1.parentNode.classList.add("remove");
                    turn2.parentNode.classList.add("remove");

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

    /**
     * Prints the scoreBoard for this board size and gives the user the option to save their score.
     */
    function printHighScoreScreen() {
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

        /**
         * Prints the score board. If one does not exists a different template is loaded telling the user that there is
         * no scores. If the user decides to save his/her score then one will be created and the correct scoreboard is
         * shown.
         */
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

        /**
         * Saves your nickname and amount of tries to local storage. If don't already have a stop for the score one will
         * be created. There is one for each board size.
         * @param nickname The nickname of the user.
         */
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
}

module.exports.launch = memoryGame;
