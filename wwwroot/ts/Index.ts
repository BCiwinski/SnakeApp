﻿import {Point, SnakeGame, Direction, Mode} from "./SnakeGame.js";

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

    //By default (on DOM load) assume first gamemode button's gamemode (it's value)
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
    Game.addEventListener("failure", finishGame);

    
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

function finishGame() : void {

    GameEnded = true;
    GameInProgess = false;

    Game.removeEventListener("tick", updateGridElements);
    Game.removeEventListener("victory", finishGameVictory);
    Game.removeEventListener("failure", finishGame);

    ($('#game-message')[0] as HTMLElement).innerHTML = "Game over";
}

function finishGameVictory() : void {

    GameEnded = true;
    GameInProgess = false;

    Game.removeEventListener("tick", updateGridElements);
    Game.removeEventListener("victory", finishGame);
    Game.removeEventListener("failure", finishGame);

    ($('#game-message')[0] as HTMLElement).innerHTML = "Victory!";
}

//retrive a tile/square element at position x - right, y - down
//position is {x: int, y: int}
function getTile(grid : HTMLElement, size : number, position: Point) : HTMLElement {

    return grid.childNodes[position.x + position.y * size] as HTMLElement;
}