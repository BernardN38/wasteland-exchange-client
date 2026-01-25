import { Point, Sprite } from "pixi.js";

export default class Player {
    sprite: Sprite;
    speed = 200; // units per second
    constructor(sprite: Sprite) {
        this.sprite = sprite;
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