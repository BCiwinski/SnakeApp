import {Point, SnakeGame, Direction, Mode, VictoryEventDetail, FailureEventDetail} from "./SnakeGame.js";

var GameInProgess = false;
var Game: SnakeGame;

var GameEnded: boolean = true;

const HEAD_ATTR = "head";
const SNAKE_ATTR = "snake";
const FRUIT_ATTR = "fruit";

const GameObjToAttr = new Map;
GameObjToAttr.set(1, HEAD_ATTR);
GameObjToAttr.set(2, SNAKE_ATTR);
GameObjToAttr.set(3, FRUIT_ATTR);

const leaderboardScores: number = 10;
let Dialog: HTMLDialogElement;
let Score: number = 0;

$(function () {

    Dialog = $("#scoreDialog")[0] as HTMLDialogElement;
    let dialogSubmit: HTMLInputElement = $("#scoreDialogSubmit")[0] as HTMLInputElement;
    dialogSubmit.addEventListener("click", onDialogSubmitClick);

    //By default (on DOM load) assume first gamemode button's gamemode (its value)
    //This should be the most basic/stadard gamemode
    let parsed = JSON.parse(($(".gamemode-button")[0] as HTMLInputElement).value);
    let gameMode = new Mode(
        parsed.Name,
        parsed.Description,
        parsed.Size,
        parsed.FruitSpawnChance,
        parsed.FruitSpawnPositionTries,
        parsed.FruitSpawnNumber,
        parsed.FruitMaxAmount,
        parsed.TickMiliseconds);

    getLeaderboardScores(leaderboardScores, gameMode.name);

    Game = prepareGame($('#game-grid')[0], gameMode);


    //Add event listener to all gamemode-controlling buttons for changing gamemodes
    $(".gamemode-button").each(function (index: number, element: HTMLInputElement) {

        this.addEventListener('click', function (e) {

            //refuse changing gamemode if a game is in progress
            if (GameInProgess) {
                return;
            }

            let parsed = JSON.parse(element.value);
            gameMode = new Mode(
                parsed.Name,
                parsed.Description,
                parsed.Size,
                parsed.FruitSpawnChance,
                parsed.FruitSpawnPositionTries,
                parsed.FruitSpawnNumber,
                parsed.FruitMaxAmount,
                parsed.TickMiliseconds);

            getLeaderboardScores(leaderboardScores, gameMode.name);

            Game = prepareGame($('#game-grid')[0], gameMode);
        })
    })

    //Handle user input
    let current: Direction = "down";

    window.addEventListener("keydown", function (e) {

        if (Dialog.open) {
            return;
        }

        //Map input
        switch (e.key) {
            case 's':
                current = "down";
                break;
            case 'w':
                current = "up";
                break;
            case 'd':
                current = "right";
                break;
            case 'a':
                current = "left";
                break;
        }

        if (GameInProgess) {

            Game.input(current);
        }

        if ((e.key == 's' || 'a' || 's' || 'd') && !GameInProgess) {

            if (GameEnded) {

                Game = prepareGame($('#game-grid')[0], gameMode);
            }

            startGame($('#game-message')[0], Game, 1000);
        }
    })
});

/**
 * Starts the snake game and modifies.
 * @param message - HTMLElement that shows a massage about game being started.
 * @param game - The game to be started.
 * @param delayMs - delay for starting the game, in miliseconds.
 */
function startGame(message: HTMLElement, game: SnakeGame, delayMs: number) : void{

    GameInProgess = true;
    message.innerText = "It's snake o'Clock!";

    //start the game - delay a bit
    new Promise<void>(resolve => setTimeout(resolve, delayMs)).then(() => { game.start(); });
}

/**
 * Prepares html elements for the game a be displayed on and makes the game object.
 * @param grid - HTMLElement to create grid on.
 * @param gameMode - Game mode info.
 * @returns 
 */
function prepareGame(grid: HTMLElement, gameMode: Mode): SnakeGame{

    removeChildren(grid);
    generateBoardElements(grid, gameMode.size);

    Game = new SnakeGame(grid, gameMode);

    Game.addEventListener("tick", updateGridElements);
    Game.addEventListener("victory", finishGameVictory);
    Game.addEventListener("failure", finishGameFailure);

    
    updateGridElements();

    GameEnded = false;

    return Game;
}

/**
 * Removes all childeren of a given element.
 * @param element - the element to remove childern of.
 */
function removeChildren(element : HTMLElement) : void {

    while (element.hasChildNodes()) {

        element.removeChild(element.firstElementChild);
    }
}

/**
 * Creates a size^2 <div> elements of class "square" and adds them as chldren to board.
 * @param board - the element to add generated elements to.
 * @param size
 */
function generateBoardElements(board : HTMLElement, size : number) : void {

    let columns = "auto";

    for (let i = 1; i < size; i++) {

        columns += " auto";
    }

    board.style.gridTemplateColumns = columns;

    for (let i = 0; i < size * size; i++) {

        let element = document.createElement("div");
        element.className = "square";

        board.appendChild(element);
    }
}

//adds and removes attributes of gridElement's child elements to reflect given gameState
/**
 * Compares Game's state against children of '#game-grid'. Removes and adds attributes accordingly.
 */
function updateGridElements() : void {

    let grid: HTMLElement = $('#game-grid')[0];

    for (let i = 0; i < Game.grid.size; i++) {

        for (let j = 0; j < Game.grid.size; j++) {

            const element = getTile(grid, Game.grid.size, new Point(i, j));

            for (let [obj, attr] of GameObjToAttr) {

                element.removeAttribute(attr);

                if (Game.grid.getTile(new Point(i, j)) == obj) {

                    element.setAttribute(attr, "");
                }
            }
        }
    }
}

/**
 * Finalazes the game when failed and uses '#game-message' for displaying failure message.
 * @param e - CustomEvenet having e.detail of type FailureEventDetail.
 */
function finishGameFailure(e: CustomEvent) : void {

    let detail: FailureEventDetail = e.detail;

    GameEnded = true;
    GameInProgess = false;

    Game.removeEventListener("tick", updateGridElements);
    Game.removeEventListener("victory", finishGameVictory);
    Game.removeEventListener("failure", finishGameFailure);

    let text: string = "Game over";

    if (detail.outcome == "bitSelf") {

        text = "Snake bit itself :(";
    }

    if (detail.outcome == "isOutside") {

        text = "Snake bumped its head :(";
    }

    ($('#game-message')[0] as HTMLElement).innerHTML = text;
}

/**
 * Finalizes the game when won and uses '#game-message' for displaying victory message.
 * Shows a dialog for user to submit their score.
 * @param e - CustomEvenet having e.detail of type VictoryEventDetail.
 */
function finishGameVictory(e: CustomEvent) : void {

    let detail: VictoryEventDetail = e.detail;

    GameEnded = true;
    GameInProgess = false;

    Game.removeEventListener("tick", updateGridElements);
    Game.removeEventListener("victory", finishGameFailure);
    Game.removeEventListener("failure", finishGameFailure);

    ($('#game-message')[0] as HTMLElement).innerHTML = `You won with a score of: ${detail.score}, playing: ${detail.gameMode}`;

    //Show dialog for user to input their name and submit score
    Score = e.detail.score;
    Dialog.showModal();
}

/**
 * Returns an element that is in x-column and y-row and a child of grid.
 * @param grid - the element to get the child of.
 * @param size - size of the board.
 * @param position - position of the child element.
 * @returns
 */
function getTile(grid : HTMLElement, size : number, position: Point) : HTMLElement {

    return grid.childNodes[position.x + position.y * size] as HTMLElement;
}

/**
 * Fetch leaderboard info and update it.
 * @param amount - amount leaderboard's score to fetch.
 * @param gameMode - get scores of this game mode.
 */
function getLeaderboardScores(amount: number, gameMode: string) : void {

    const xhttp = new XMLHttpRequest();
    xhttp.onload = onLeaderboardInfoRecived;
    xhttp.open("GET", "score/top?Amount=" + amount + "&GameMode=" + gameMode, true);
    xhttp.send();
}

/**
 * Update leaderboard with recived information.
 */
function onLeaderboardInfoRecived() : void {

    const response = JSON.parse(this.responseText);
    const scores = response.scores;

    let list = $("#leaderboards-list")[0] as HTMLElement;

    //remove current elements
    while (list.hasChildNodes()) {

        list.removeChild(list.firstElementChild);
    }

    for (let i = 0; i < scores.length; i++) {

        let element = document.createElement("li");
        element.innerHTML = `${scores[i].name} - ${scores[i].score}`;

        list.appendChild(element);
    }
}

/**
 * Posts user's score with provided name. Displays and error message for input shorter than 4 characters.
 */
function onDialogSubmitClick() : void {

    let nameInput: HTMLInputElement = $("#scoreDialogNameInput")[0] as HTMLInputElement;

    if (nameInput.value.length == 0) {
        Dialog.close();
        return;
    }

    if (nameInput.value.length <= 3) {

        alert("Please put in a name longer than 3 characters");
        return;
    }

    postScore(nameInput.value, Score, Game.mode.name);
    Dialog.close();
}

/**
 * Posts score with the given name, score and game mode.
 * @param name - name of the user achiving the score.
 * @param score - numeric value of the score.
 * @param gameMode - the game mode of the game.
 */
function postScore(name: string, score: number, gameMode: string) : void {

    const request = { Name: name, Score: score, GameMode: gameMode }

    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () {getLeaderboardScores(leaderboardScores, Game.mode.name) }
    xhttp.open("POST", "score/add", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(request));
}