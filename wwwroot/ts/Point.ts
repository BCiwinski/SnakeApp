export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Grid{

    tiles: Array<Array<number>>;

    size: number;

    constructor(size: number) {

        this.size = size;
        this.tiles = new Array<Array<number>>;


        for (let i = 0; i < size; i++) {

            let row = [];

            for (let j = 0; j < size; j++) {

                row.push(0);
            }

            this.tiles.push(row);
        }
    }

    setTile(value: number, atPoint: Point): void {

        this.tiles[atPoint.x][atPoint.y] = value;
    }

    getTile(atPoint: Point): number {

        return this.tiles[atPoint.x][atPoint.y];
    }
}

