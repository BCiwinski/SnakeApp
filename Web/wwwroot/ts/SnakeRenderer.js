var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Renderer_instances, _Renderer_context, _Renderer_grid, _Renderer_width, _Renderer_height, _Renderer_tileWidth, _Renderer_tileHeight, _Renderer_snake, _Renderer_atlas, _Renderer_fruits, _Renderer_snakeEndBefore, _Renderer_drawFruits, _Renderer_drawTail, _Renderer_drawBody, _Renderer_drawHead, _Renderer_getOrientation, _Renderer_getStraightOrientation, _Renderer_clearTile;
import { Point } from "./SnakeGameTypes.js";
const SpriteSize = 10;
const TailOrientationToAtlasPos = new Map();
TailOrientationToAtlasPos.set("leftToRight", new Point(0, 3));
TailOrientationToAtlasPos.set("downToUp", new Point(1, 3));
TailOrientationToAtlasPos.set("rightToLeft", new Point(2, 3));
TailOrientationToAtlasPos.set("upToDown", new Point(3, 3));
const BodyOrientationToAtlasPos = new Map();
BodyOrientationToAtlasPos.set("leftToRight", new Point(0, 1));
BodyOrientationToAtlasPos.set("downToUp", new Point(1, 1));
BodyOrientationToAtlasPos.set("rightToLeft", new Point(2, 1));
BodyOrientationToAtlasPos.set("upToDown", new Point(3, 1));
BodyOrientationToAtlasPos.set("leftToDown", new Point(0, 2));
BodyOrientationToAtlasPos.set("downToRight", new Point(1, 2));
BodyOrientationToAtlasPos.set("rightToUp", new Point(2, 2));
BodyOrientationToAtlasPos.set("upToLeft", new Point(3, 2));
const HeadOrientationToAtlasPos = new Map();
HeadOrientationToAtlasPos.set("leftToRight", new Point(0, 0));
HeadOrientationToAtlasPos.set("downToUp", new Point(1, 0));
HeadOrientationToAtlasPos.set("rightToLeft", new Point(2, 0));
HeadOrientationToAtlasPos.set("upToDown", new Point(3, 0));
class Renderer {
    constructor(renderingContext, snake, snakeAtlas, grid) {
        _Renderer_instances.add(this);
        _Renderer_context.set(this, void 0);
        _Renderer_grid.set(this, void 0);
        _Renderer_width.set(this, void 0);
        _Renderer_height.set(this, void 0);
        _Renderer_tileWidth.set(this, void 0);
        _Renderer_tileHeight.set(this, void 0);
        _Renderer_snake.set(this, void 0);
        _Renderer_atlas.set(this, void 0);
        _Renderer_fruits.set(this, void 0);
        _Renderer_snakeEndBefore.set(this, void 0);
        __classPrivateFieldSet(this, _Renderer_snakeEndBefore, snake.end, "f");
        __classPrivateFieldSet(this, _Renderer_snake, snake, "f");
        __classPrivateFieldSet(this, _Renderer_atlas, snakeAtlas, "f");
        __classPrivateFieldSet(this, _Renderer_fruits, new Array(), "f");
        __classPrivateFieldSet(this, _Renderer_context, renderingContext, "f");
        __classPrivateFieldSet(this, _Renderer_grid, grid, "f");
        __classPrivateFieldSet(this, _Renderer_width, renderingContext.canvas.width, "f");
        __classPrivateFieldSet(this, _Renderer_height, renderingContext.canvas.height, "f");
        __classPrivateFieldSet(this, _Renderer_tileWidth, __classPrivateFieldGet(this, _Renderer_width, "f") / grid.size, "f");
        __classPrivateFieldSet(this, _Renderer_tileHeight, __classPrivateFieldGet(this, _Renderer_height, "f") / grid.size, "f");
        //clear everything
        __classPrivateFieldGet(this, _Renderer_context, "f").clearRect(0, 0, __classPrivateFieldGet(this, _Renderer_width, "f"), __classPrivateFieldGet(this, _Renderer_height, "f"));
    }
    /**
     * Redraws the game on CanvasRenderingContext2D used for this object's construction.
     */
    update() {
        __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_drawFruits).call(this);
        __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_drawTail).call(this);
        __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_drawBody).call(this);
        __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_drawHead).call(this);
    }
    addFruits(fruits) {
        __classPrivateFieldSet(this, _Renderer_fruits, fruits, "f");
    }
}
_Renderer_context = new WeakMap(), _Renderer_grid = new WeakMap(), _Renderer_width = new WeakMap(), _Renderer_height = new WeakMap(), _Renderer_tileWidth = new WeakMap(), _Renderer_tileHeight = new WeakMap(), _Renderer_snake = new WeakMap(), _Renderer_atlas = new WeakMap(), _Renderer_fruits = new WeakMap(), _Renderer_snakeEndBefore = new WeakMap(), _Renderer_instances = new WeakSet(), _Renderer_drawFruits = function _Renderer_drawFruits() {
    __classPrivateFieldGet(this, _Renderer_fruits, "f").forEach(f => {
        //2^10 = 1024 for ten different fruits
        const scale = 1024;
        const random = Math.random() * scale;
        let atlasPos = new Point(10 - Math.round(Math.log2(random)), 4);
        __classPrivateFieldGet(this, _Renderer_context, "f").drawImage(__classPrivateFieldGet(this, _Renderer_atlas, "f"), atlasPos.x * SpriteSize, atlasPos.y * SpriteSize, SpriteSize, SpriteSize, f.x * __classPrivateFieldGet(this, _Renderer_tileHeight, "f"), f.y * __classPrivateFieldGet(this, _Renderer_tileWidth, "f"), __classPrivateFieldGet(this, _Renderer_tileWidth, "f"), __classPrivateFieldGet(this, _Renderer_tileHeight, "f"));
    });
    __classPrivateFieldSet(this, _Renderer_fruits, new Array(), "f");
}, _Renderer_drawTail = function _Renderer_drawTail() {
    let pos = __classPrivateFieldGet(this, _Renderer_snake, "f").body[0];
    let previous;
    __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_clearTile).call(this, __classPrivateFieldGet(this, _Renderer_snakeEndBefore, "f"));
    __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_clearTile).call(this, pos);
    if (__classPrivateFieldGet(this, _Renderer_snake, "f").length() == 1) {
        previous = __classPrivateFieldGet(this, _Renderer_snake, "f").head;
    }
    else {
        previous = __classPrivateFieldGet(this, _Renderer_snake, "f").body[1];
    }
    let orientation = __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_getStraightOrientation).call(this, pos, previous);
    if (orientation == "invalid") {
        throw "Error getting orientation in SnakeRenderer.#drawTail()";
    }
    let atlasPos = TailOrientationToAtlasPos.get(orientation);
    __classPrivateFieldGet(this, _Renderer_context, "f").drawImage(__classPrivateFieldGet(this, _Renderer_atlas, "f"), atlasPos.x * SpriteSize, atlasPos.y * SpriteSize, SpriteSize, SpriteSize, pos.x * __classPrivateFieldGet(this, _Renderer_tileHeight, "f"), pos.y * __classPrivateFieldGet(this, _Renderer_tileWidth, "f"), __classPrivateFieldGet(this, _Renderer_tileWidth, "f"), __classPrivateFieldGet(this, _Renderer_tileHeight, "f"));
    __classPrivateFieldSet(this, _Renderer_snakeEndBefore, pos, "f");
}, _Renderer_drawBody = function _Renderer_drawBody() {
    if (__classPrivateFieldGet(this, _Renderer_snake, "f").length() < 2) {
        return;
    }
    let previous = __classPrivateFieldGet(this, _Renderer_snake, "f").head;
    let pos = __classPrivateFieldGet(this, _Renderer_snake, "f").body[__classPrivateFieldGet(this, _Renderer_snake, "f").length() - 1];
    let next = __classPrivateFieldGet(this, _Renderer_snake, "f").body[__classPrivateFieldGet(this, _Renderer_snake, "f").length() - 2];
    __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_clearTile).call(this, pos);
    let orientation = __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_getOrientation).call(this, pos, previous, next);
    if (orientation == "invalid") {
        throw "Error getting orientation in SnakeRenderer.#drawBody()";
    }
    let atlasPos = BodyOrientationToAtlasPos.get(orientation);
    __classPrivateFieldGet(this, _Renderer_context, "f").drawImage(__classPrivateFieldGet(this, _Renderer_atlas, "f"), atlasPos.x * SpriteSize, atlasPos.y * SpriteSize, SpriteSize, SpriteSize, pos.x * __classPrivateFieldGet(this, _Renderer_tileHeight, "f"), pos.y * __classPrivateFieldGet(this, _Renderer_tileWidth, "f"), __classPrivateFieldGet(this, _Renderer_tileWidth, "f"), __classPrivateFieldGet(this, _Renderer_tileHeight, "f"));
}, _Renderer_drawHead = function _Renderer_drawHead() {
    let head = __classPrivateFieldGet(this, _Renderer_snake, "f").head;
    let next = __classPrivateFieldGet(this, _Renderer_snake, "f").body[__classPrivateFieldGet(this, _Renderer_snake, "f").length() - 1];
    let orientation = __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_getStraightOrientation).call(this, next, head);
    if (orientation == "invalid") {
        throw "Error getting orientation in SnakeRenderer.#drawHead()";
    }
    let atlasPos = HeadOrientationToAtlasPos.get(orientation);
    __classPrivateFieldGet(this, _Renderer_context, "f").drawImage(__classPrivateFieldGet(this, _Renderer_atlas, "f"), atlasPos.x * SpriteSize, atlasPos.y * SpriteSize, SpriteSize, SpriteSize, head.x * __classPrivateFieldGet(this, _Renderer_tileHeight, "f"), head.y * __classPrivateFieldGet(this, _Renderer_tileWidth, "f"), __classPrivateFieldGet(this, _Renderer_tileWidth, "f"), __classPrivateFieldGet(this, _Renderer_tileHeight, "f"));
}, _Renderer_getOrientation = function _Renderer_getOrientation(of, previous, next) {
    const previousStraight = __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_getStraightOrientation).call(this, of, previous);
    const nextStraight = __classPrivateFieldGet(this, _Renderer_instances, "m", _Renderer_getStraightOrientation).call(this, next, of);
    if (previousStraight == nextStraight) {
        return previousStraight;
    }
    let result = "invalid";
    //left to down (down to left)
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "left").equals(previous)
        && __classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "down").equals(next)) {
        result = "leftToDown";
    }
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "down").equals(previous)
        && __classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "left").equals(next)) {
        result = "leftToDown";
    }
    //down to right (right to down)
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "down").equals(previous)
        && __classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "right").equals(next)) {
        result = "downToRight";
    }
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "right").equals(previous)
        && __classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "down").equals(next)) {
        result = "downToRight";
    }
    //right to up (up to right)
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "right").equals(previous)
        && __classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "up").equals(next)) {
        result = "rightToUp";
    }
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "up").equals(previous)
        && __classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "right").equals(next)) {
        result = "rightToUp";
    }
    //up to left (left to up)
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "up").equals(previous)
        && __classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "left").equals(next)) {
        result = "upToLeft";
    }
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "left").equals(previous)
        && __classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(of, "up").equals(next)) {
        result = "upToLeft";
    }
    return result;
}, _Renderer_getStraightOrientation = function _Renderer_getStraightOrientation(of, previous) {
    let result = "invalid";
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(previous, "right").equals(of)) {
        result = "leftToRight";
    }
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(previous, "left").equals(of)) {
        result = "rightToLeft";
    }
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(previous, "up").equals(of)) {
        result = "downToUp";
    }
    if (__classPrivateFieldGet(this, _Renderer_grid, "f").getPositionInDirection(previous, "down").equals(of)) {
        result = "upToDown";
    }
    return result;
}, _Renderer_clearTile = function _Renderer_clearTile(position) {
    __classPrivateFieldGet(this, _Renderer_context, "f").clearRect(position.x * __classPrivateFieldGet(this, _Renderer_tileWidth, "f"), position.y * __classPrivateFieldGet(this, _Renderer_tileHeight, "f"), __classPrivateFieldGet(this, _Renderer_tileHeight, "f"), __classPrivateFieldGet(this, _Renderer_tileHeight, "f"));
};
export default Renderer;
//# sourceMappingURL=SnakeRenderer.js.map