import { Point, Grid, Snake } from "./SnakeGameTypes.js";

type StraightOrientation = "leftToRight" | "downToUp" | "rightToLeft" | "upToDown" | "invalid"

type BentOrientation = "leftToDown" | "downToRight" | "rightToUp" | "upToLeft"

type Orientation = StraightOrientation | BentOrientation;

const SpriteSize = 10;

const TailOrientationToAtlasPos = new Map<StraightOrientation, Point>();
TailOrientationToAtlasPos.set("leftToRight", new Point(0, 3));
TailOrientationToAtlasPos.set("downToUp", new Point(1, 3));
TailOrientationToAtlasPos.set("rightToLeft", new Point(2, 3));
TailOrientationToAtlasPos.set("upToDown", new Point(3, 3));

const BodyOrientationToAtlasPos = new Map<Orientation, Point>();
BodyOrientationToAtlasPos.set("leftToRight", new Point(0, 1));
BodyOrientationToAtlasPos.set("downToUp", new Point(1, 1));
BodyOrientationToAtlasPos.set("rightToLeft", new Point(2, 1));
BodyOrientationToAtlasPos.set("upToDown", new Point(3, 1));
BodyOrientationToAtlasPos.set("leftToDown", new Point(0, 2))
BodyOrientationToAtlasPos.set("downToRight", new Point(1, 2))
BodyOrientationToAtlasPos.set("rightToUp", new Point(2, 2))
BodyOrientationToAtlasPos.set("upToLeft", new Point(3, 2))

const HeadOrientationToAtlasPos = new Map<StraightOrientation, Point>();
HeadOrientationToAtlasPos.set("leftToRight", new Point(0, 0));
HeadOrientationToAtlasPos.set("downToUp", new Point(1, 0));
HeadOrientationToAtlasPos.set("rightToLeft", new Point(2, 0));
HeadOrientationToAtlasPos.set("upToDown", new Point(3, 0));

export default class Renderer {

    #context: CanvasRenderingContext2D

    #grid: Grid;

    #width: number;

    #height: number;

    #tileWidth: number;

    #tileHeight: number;

    #snake: Snake;

    #atlas: HTMLImageElement;

    #fruits: Array<Point>;

    #snakeEndBefore: Point;

    constructor(renderingContext: CanvasRenderingContext2D, snake: Snake, snakeAtlas: HTMLImageElement, grid: Grid) {

        this.#snakeEndBefore = snake.end;

        this.#snake = snake;
        this.#atlas = snakeAtlas;

        this.#fruits = new Array<Point>();

        this.#context = renderingContext;
        this.#grid = grid;

        this.#width = renderingContext.canvas.width;
        this.#height = renderingContext.canvas.height;

        this.#tileWidth = this.#width / grid.size;
        this.#tileHeight = this.#height / grid.size;

        //clear everything
        this.#context.clearRect(0, 0, this.#width, this.#height);
    }

    /**
     * Redraws snakes head and tail to match snake's state. Needs to be called every tick to work properly.
     * Draws fruits added with addFruits() before calling this.
     */
    update() : void {

        this.#drawFruits();

        this.#drawTail();
        this.#drawBody();
        this.#drawHead();
    }

    /**
     * Sets fruits to draw in next update() call.
     * @param fruits - points, where fruits will be drawn.
     */
    addFruits(fruits: Array<Point>) : void {

        this.#fruits = fruits;
    }

    /**
     * Draws fruits set by addFruit().
     */
    #drawFruits() : void {

        this.#fruits.forEach(f => {

            //e^10 = 22026 for ten different fruits
            const scale = 22000;
            const random = (Math.random() * scale) + 1;

            //make first fruits (like (0,4)) very probable and last one (like(9,4)) very improbable
            let atlasPos = new Point(10 - Math.ceil(Math.log(Math.round(random))), 4);

            this.#context.drawImage(
                this.#atlas,
                atlasPos.x * SpriteSize,
                atlasPos.y * SpriteSize,
                SpriteSize,
                SpriteSize,
                f.x * this.#tileHeight,
                f.y * this.#tileWidth,
                this.#tileWidth,
                this.#tileHeight);
        });

        this.#fruits = new Array<Point>();
    }

    /**
     * Clears previous tail's position and redraws in the current one.
     */
    #drawTail() : void {

        let pos: Point = this.#snake.body[0];
        let previous: Point;

        this.#clearTile(this.#snakeEndBefore);
        this.#clearTile(pos);

        if (this.#snake.length() == 1) {

            previous = this.#snake.head;
        }
        else {

            previous = this.#snake.body[1];
        }

        let orientation: StraightOrientation = this.#getStraightOrientation(pos, previous);

        if (orientation == "invalid") {

            throw "Error getting orientation in SnakeRenderer.#drawTail()";
        }

        let atlasPos = TailOrientationToAtlasPos.get(orientation);

        this.#context.drawImage(
            this.#atlas,
            atlasPos.x * SpriteSize,
            atlasPos.y * SpriteSize,
            SpriteSize,
            SpriteSize,
            pos.x * this.#tileHeight,
            pos.y * this.#tileWidth,
            this.#tileWidth,
            this.#tileHeight);

        this.#snakeEndBefore = pos;
    }

    /**
     * Redraws parts of snake's body that need changing.
     * Clears previous head's position and draws a part of body.
     */
    #drawBody() : void {

        if (this.#snake.length() < 2) {
            return;
        }

        let previous: Point = this.#snake.head;
        let pos: Point = this.#snake.body[this.#snake.length() - 1];
        let next: Point = this.#snake.body[this.#snake.length() - 2];

        this.#clearTile(pos);

        let orientation: Orientation = this.#getOrientation(pos, previous, next)

        if (orientation == "invalid") {

            throw "Error getting orientation in SnakeRenderer.#drawBody()";
        }

        let atlasPos = BodyOrientationToAtlasPos.get(orientation);

        this.#context.drawImage(
            this.#atlas,
            atlasPos.x * SpriteSize,
            atlasPos.y * SpriteSize,
            SpriteSize,
            SpriteSize,
            pos.x * this.#tileHeight,
            pos.y * this.#tileWidth,
            this.#tileWidth,
            this.#tileHeight);
    }

    /**
     * Draws snake's head over wheatever was in that space previously.
     */
    #drawHead() : void {

        let head: Point = this.#snake.head;
        let next: Point = this.#snake.body[this.#snake.length() - 1];

        let orientation: StraightOrientation = this.#getStraightOrientation(next, head);

        if (orientation == "invalid") {

            throw "Error getting orientation in SnakeRenderer.#drawHead()";
        }

        let atlasPos = HeadOrientationToAtlasPos.get(orientation);

        this.#context.drawImage(
            this.#atlas,
            atlasPos.x * SpriteSize,
            atlasPos.y * SpriteSize,
            SpriteSize,
            SpriteSize,
            head.x * this.#tileHeight,
            head.y * this.#tileWidth,
            this.#tileWidth,
            this.#tileHeight);
    }

    /**
     * Gets an orientation 'of' a point that's between 'previous' and 'next'.
     * This orientation represents how point 'of' needs to connect to 'previous' and 'next'
     * to create a continous piece.
     * 
     * Only 'next' and 'previous' that are left/right/above/below
     * 'of' are valid.
     * 
     * There is no distinction between "bent" orientations when
     * 'next' and 'previous' are swapped. For example there is "leftToDown", but no "downToLeft".
     * @param of
     * @param previous
     * @param next
     * @returns
     */
    #getOrientation(of: Point, previous: Point, next: Point) : Orientation {

        const previousStraight: StraightOrientation = this.#getStraightOrientation(of, previous);
        const nextStraight: StraightOrientation = this.#getStraightOrientation(next, of);

        if (previousStraight == nextStraight) {

            return previousStraight;
        }

        let result: Orientation = "invalid";

        //left to down (down to left)
        if (this.#grid.getPositionInDirection(of, "left").equals(previous)
            && this.#grid.getPositionInDirection(of, "down").equals(next)) {

            result = "leftToDown";
        }

        if (this.#grid.getPositionInDirection(of, "down").equals(previous)
            && this.#grid.getPositionInDirection(of, "left").equals(next)) {

            result = "leftToDown";
        }

        //down to right (right to down)
        if (this.#grid.getPositionInDirection(of, "down").equals(previous)
            && this.#grid.getPositionInDirection(of, "right").equals(next)) {

            result = "downToRight";
        }

        if (this.#grid.getPositionInDirection(of, "right").equals(previous)
            && this.#grid.getPositionInDirection(of, "down").equals(next)) {

            result = "downToRight";
        }

        //right to up (up to right)
        if (this.#grid.getPositionInDirection(of, "right").equals(previous)
            && this.#grid.getPositionInDirection(of, "up").equals(next)) {

            result = "rightToUp";
        }

        if (this.#grid.getPositionInDirection(of, "up").equals(previous)
            && this.#grid.getPositionInDirection(of, "right").equals(next)) {

            result = "rightToUp";
        }

        //up to left (left to up)
        if (this.#grid.getPositionInDirection(of, "up").equals(previous)
            && this.#grid.getPositionInDirection(of, "left").equals(next)) {

            result = "upToLeft";
        }

        if (this.#grid.getPositionInDirection(of, "left").equals(previous)
            && this.#grid.getPositionInDirection(of, "up").equals(next)) {

            result = "upToLeft";
        }

        return result;

    }

    /**
     * Gets a "straight" orientation 'of' a point in relation to 'previous'.
     * This orientation represents the direction you need to travel from 'previous'
     * to 'of'.
     * 
     * Only 'previous' that is left/right/above/below 'of' is valid.
     * @param of
     * @param previous
     * @returns
     */
    #getStraightOrientation(of: Point, previous: Point) : StraightOrientation {

        let result: StraightOrientation = "invalid";

        if (this.#grid.getPositionInDirection(previous, "right").equals(of)) {

            result = "leftToRight";
        }

        if (this.#grid.getPositionInDirection(previous, "left").equals(of)) {

            result = "rightToLeft";
        }

        if (this.#grid.getPositionInDirection(previous, "up").equals(of)) {

            result = "downToUp";
        }

        if (this.#grid.getPositionInDirection(previous, "down").equals(of)) {
            result = "upToDown";
        }

        return result;
    }

    /**
     * Clears #context's graphics in a region corresponding to given 'position'.
     * @param position
     */
    #clearTile(position: Point) : void {

        this.#context.clearRect(
            position.x * this.#tileWidth,
            position.y * this.#tileHeight,
            this.#tileHeight,
            this.#tileHeight
        );
    }
}