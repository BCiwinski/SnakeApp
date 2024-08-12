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

$(function () {

    let dialog: HTMLDialogElement = $("#scoreDialog")[0] as HTMLDialogElement;

    //TODO: Show when a game is won - remove from here
    dialog.showModal();

    let nameInput: HTMLInputElement = $("#scoreDialogNameInput")[0] as HTMLInputElement;

    let dialogSubmit: HTMLInputElement = $("#scoreDialogSubmit")[0] as HTMLInputElement;
    dialogSubmit.addEventListener("click", function (e) {

        if (nameInput.value.length == 0) {
            dialog.close();
            return;
        }

        if (nameInput.value.length <= 3) {

            alert("Please put in a name longer than 3 characters");
            return;
        }

        const request = { Name: nameInput.value, Score: 100 }
        const string = JSON.stringify(request);

        const xhttp = new XMLHttpRequest();
        xhttp.open("POST", "score/add", true);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send(string);
    });

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
        parsed.TickMiliseconds);


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
                parsed.TickMiliseconds);

            Game = prepareGame($('#game-grid')[0], gameMode);
        })
    })

    //Handle user input
    var current: Direction = "down";

    window.addEventListener("keydown", function (e) {

        //Change direction-controlling var depending on user input
        //Refuse changing the direction to the opposite - snake cant move that way
        switch (e.key) {
            case 's':
                current = current == "up" ? "up" : "down";
                break;
            case 'w':
                current = current == "down" ? "down" : "up";
                break;
            case 'd':
                current = current == "left" ? "left" : "right";
                break;
            case 'a':
                current = current == "right" ? "right" : "left";
                break;
        }

        if (GameInProgess) {

            Game.currentDirection = current;
        }

        if ((e.key == 's' || 'a' || 's' || 'd') && !GameInProgess) {

            if (GameEnded) {

                Game = prepareGame($('#game-grid')[0], gameMode);
            }

            startGame($('#game-message')[0], Game);
        }
    })
});

function startGame(message: HTMLElement, state: SnakeGame) : void{

    GameInProgess = true;
    message.innerText = "It's snake o'Clock!";

    //start the game - delay a bit
    new Promise<void>(resolve => setTimeout(resolve, 1000)).then(() => { state.start(); });
}

function prepareGame(grid: HTMLElement, gameMode: Mode): SnakeGame{

    clearBoard(grid);
    generateBoardElements(grid, gameMode.size);

    Game = new SnakeGame(grid, gameMode);

    Game.addEventListener("tick", updateGridElements);
    Game.addEventListener("victory", finishGameVictory);
    Game.addEventListener("failure", finishGameFailure);

    
    updateGridElements();

    GameEnded = false;

    return Game;
}

//function for removing all tiles/squares the game takes place on
function clearBoard(grid : HTMLElement) : void {

    while (grid.hasChildNodes()) {

        grid.removeChild(grid.firstElementChild);
    }
}

//create size^2 elements as child nods of gridElement
function generateBoardElements(grid : HTMLElement, size : number) : void {

    let columns = "auto";

    for (let i = 1; i < size; i++) {

        columns += " auto";
    }

    grid.style.gridTemplateColumns = columns;

    for (let i = 0; i < size * size; i++) {

        let tag = document.createElement("div");
        tag.className = "square";

        grid.appendChild(tag);
    }
}

//main function for "rendering" the game
//adds and removes attributes of gridElement's child elements to reflect given gameState
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

function finishGameVictory(e: CustomEvent) : void {

    let detail: VictoryEventDetail = e.detail;

    GameEnded = true;
    GameInProgess = false;

    Game.removeEventListener("tick", updateGridElements);
    Game.removeEventListener("victory", finishGameFailure);
    Game.removeEventListener("failure", finishGameFailure);

    ($('#game-message')[0] as HTMLElement).innerHTML = `You won with a score of: ${detail.score}, playing: ${detail.gameMode}`;
}

function getTile(grid : HTMLElement, size : number, position: Point) : HTMLElement {

    return grid.childNodes[position.x + position.y * size] as HTMLElement;
}