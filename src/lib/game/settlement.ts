import type { Sprite } from "pixi.js";

class Settlement {
    sprite: Sprite;
    name: string;
    location: {
        x: number;
        y: number;
    };
    constructor(name: string, sprite: Sprite, x: number, y: number) {
        this.sprite = sprite;
        this.name = name;
        this.location = { x, y };
    }
}