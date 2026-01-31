import { Point, Sprite } from "pixi.js";

export default class Player {
    sprite: Sprite;
    speed = 200; // units per second
    location = { x: 0, y: 0 };
    constructor(sprite: Sprite, location = { x: 0, y: 0 }) {
        this.sprite = sprite;
        this.location = location;
        sprite.interactive = true;
        sprite.onmouseenter = () => {
            console.log("Player sprite entered");
        }
    }
    move(direction: Point, delta: number) {
        this.sprite.x += direction.x * this.speed * delta;
        this.sprite.y += direction.y * this.speed * delta;
    }
}