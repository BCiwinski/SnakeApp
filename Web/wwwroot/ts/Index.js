import { SnakeGame, Mode } from "./SnakeGame.js";
var GameInProgess = false;
var Game;
var GameEnded = true;
const leaderboardScores = 10;
let Dialog;
let Score = 0;
$(function () {
    Dialog = $("#scoreDialog")[0];
    let dialogSubmit = $("#scoreDialogSubmit")[0];
    dialogSubmit.addEventListener("click", onDialogSubmitClick);
    //By default (on DOM load) assume first gamemode button's gamemode (its value)
    //This should be the most basic/stadard gamemode
    let parsed = JSON.parse($(".gamemode-button")[0].value);
    let gameMode = new Mode(parsed.Name, parsed.Description, parsed.Size, parsed.FruitSpawnChance, parsed.FruitSpawnPositionTries, parsed.FruitSpawnNumber, parsed.FruitMaxAmount, parsed.TickMiliseconds);
    getLeaderboardScores(leaderboardScores, gameMode.name);
    Game = prepareGame(gameMode);
    //Add event listener to all gamemode-controlling buttons for changing gamemodes
    $(".gamemode-button").each(function (index, element) {
        this.addEventListener('click', function (e) {
            //refuse changing gamemode if a game is in progress
            if (GameInProgess) {
                return;
            }
            let parsed = JSON.parse(element.value);
            gameMode = new Mode(parsed.Name, parsed.Description, parsed.Size, parsed.FruitSpawnChance, parsed.FruitSpawnPositionTries, parsed.FruitSpawnNumber, parsed.FruitMaxAmount, parsed.TickMiliseconds);
            getLeaderboardScores(leaderboardScores, gameMode.name);
            Game = prepareGame(gameMode);
        });
    });
    //Handle user input
    let current = "down";
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
                Game = prepareGame(gameMode);
            }
            startGame($('#game-message')[0], Game, 1000);
        }
    });
});
/**
 * Starts the snake game and modifies.
 * @param message - HTMLElement that shows a massage about game being started.
 * @param game - The game to be started.
 * @param delayMs - delay for starting the game, in miliseconds.
 */
function startGame(message, game, delayMs) {
    GameInProgess = true;
    message.innerText = "It's snake o'Clock!";
    //start the game - delay a bit
    new Promise(resolve => setTimeout(resolve, delayMs)).then(() => { game.start(); });
}
/**
 * Prepares html elements for the game a be displayed on and makes the game object.
 * @param grid - HTMLElement to create grid on.
 * @param gameMode - Game mode info.
 * @returns
 */
function prepareGame(gameMode) {
    const canvas = $("#game-canvas")[0];
    const context2d = canvas.getContext("2d");
    const snakeAtlas = $("#game-snake-atlas")[0];
    Game = new SnakeGame(gameMode, context2d, snakeAtlas);
    Game.addEventListener("tick", onGameTick);
    Game.addEventListener("victory", onGameVictory);
    Game.addEventListener("failure", onGameFailure);
    GameEnded = false;
    return Game;
}
function onGameTick() { }
/**
 * Finalazes the game when failed and uses '#game-message' for displaying failure message.
 * @param e - CustomEvenet having e.detail of type FailureEventDetail.
 */
function onGameFailure(e) {
    let detail = e.detail;
    GameEnded = true;
    GameInProgess = false;
    Game.removeEventListener("tick", onGameTick);
    Game.removeEventListener("victory", onGameVictory);
    Game.removeEventListener("failure", onGameFailure);
    let text = "Game over";
    if (detail.outcome == "bitSelf") {
        text = "Snake bit itself :(";
    }
    if (detail.outcome == "isOutside") {
        text = "Snake bumped its head :(";
    }
    $('#game-message')[0].innerHTML = text;
}
/**
 * Finalizes the game when won and uses '#game-message' for displaying victory message.
 * Shows a dialog for user to submit their score.
 * @param e - CustomEvenet having e.detail of type VictoryEventDetail.
 */
function onGameVictory(e) {
    let detail = e.detail;
    GameEnded = true;
    GameInProgess = false;
    Game.removeEventListener("tick", onGameTick);
    Game.removeEventListener("victory", onGameFailure);
    Game.removeEventListener("failure", onGameFailure);
    $('#game-message')[0].innerHTML = `You won with a score of: ${detail.score}, playing: ${detail.gameMode}`;
    //Show dialog for user to input their name and submit score
    Score = e.detail.score;
    Dialog.showModal();
}
/**
 * Fetch leaderboard info and update it.
 * @param amount - amount leaderboard's score to fetch.
 * @param gameMode - get scores of this game mode.
 */
function getLeaderboardScores(amount, gameMode) {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = onLeaderboardInfoRecived;
    xhttp.open("GET", "score/top?Amount=" + amount + "&GameMode=" + gameMode, true);
    xhttp.send();
}
/**
 * Update leaderboard with recived information.
 */
function onLeaderboardInfoRecived() {
    const response = JSON.parse(this.responseText);
    const scores = response.scores;
    let list = $("#leaderboards-list")[0];
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
function onDialogSubmitClick() {
    let nameInput = $("#scoreDialogNameInput")[0];
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
function postScore(name, score, gameMode) {
    const request = { Name: name, Score: score, GameMode: gameMode };
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function () { getLeaderboardScores(leaderboardScores, Game.mode.name); };
    xhttp.open("POST", "score/add", true);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(request));
}
//# sourceMappingURL=Index.js.map