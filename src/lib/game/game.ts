import axios from "axios";

import { config } from "../config/config";
import { Application, Assets, Container, Point, Sprite, type Renderer } from "pixi.js";
import playersvg from "$lib/assets/round-star.png";
import playerbase from "$lib/assets/player-base.svg";
import Player from "./player";

interface worldObjects {
    sprite: Sprite;
    label: string;
}

class Game {
    app!: Application<Renderer>;
    world!: Container;
    private moveTarget: Point | null = null;
    private player!: Player;
    private worldObjects: worldObjects[] = [];
    private readonly moveSpeed = 200; // world units/sec
    private readonly stopDistance = 1;
    constructor() {

    }
    async startNewGame(): Promise<void> {
        axios.post(`${config.apiBaseUrl}/api/v1/game/startnew`)
            .then(async response => {
                console.log("Game started:", response.data);
                await this.createNewGame();
                this.initInput();
                this.initLoop();
            })
            .catch(error => {
                console.error("Error starting game:", error);
            });
    }
    // ----------------------------
    // Loop
    // ----------------------------
    private initLoop() {
        this.app.ticker.add((ticker) => {
            const dt = ticker.deltaMS / 1000;
            this.checkCollision()
            this.stepMoveToTarget(dt);
            this.centerCameraOnPlayer();
        });
    }

    private stepMoveToTarget(dt: number) {
        if (!this.moveTarget) return;

        const p = this.player.sprite.position;
        // console.log('Player position:', p);
        const dx = this.moveTarget.x - p.x;
        const dy = this.moveTarget.y - p.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= this.stopDistance) {
            this.moveTarget = null;
            return;
        }

        const step = Math.min(this.moveSpeed * dt, dist);
        p.x += (dx / dist) * step;
        p.y += (dy / dist) * step;
    }

    // ----------------------------
    // Camera + Coords
    // ----------------------------
    private centerCameraOnPlayer() {
        const p = this.player.sprite.position;
        this.world.pivot.set(p.x, p.y);
    }

    /** Convert a screen point to world coordinates (container local space). */
    private screenToWorld(screenX: number, screenY: number): Point {
        // world is positioned at screen center, pivot defines camera target
        const cx = this.world.x;
        const cy = this.world.y;

        return new Point(
            (screenX - cx) + this.world.pivot.x,
            (screenY - cy) + this.world.pivot.y
        );
    }
    private initInput() {
        // Let the stage receive pointer events everywhere
        this.app.stage.eventMode = "static";
        this.app.stage.hitArea = this.app.screen;

        this.app.stage.on("pointerdown", (e) => {
            this.moveTarget = this.screenToWorld(e.global.x, e.global.y);
        });
    }

    async createNewGame(): Promise<void> {
        // Create a new application
        const app = new Application();
        this.app = app;
        // Initialize the application
        await app.init({ background: '#1099bb', resizeTo: window, antialias: true, autoDensity: true, resolution: window.devicePixelRatio || 1, });

        const world = new Container();
        this.world = world;

        this.app.stage.addChild(world);
        world.interactive = true;
        this.world.position.set(this.app.screen.width / 2, this.app.screen.height / 2);

        this.player = await addPlayer(world, app)
        debug(world, app)

        document.getElementById("game-container")?.appendChild(app.canvas);
    }
    checkCollision() {
        this.worldObjects.forEach((obj) => {
            if (testForAABB(this.player.sprite, obj.sprite)) {
                console.log('Checking collision between player and object:', obj.label);
            }
        });
    }
}
function testForAABB(object1: { getBounds: () => any; }, object2: { getBounds: () => any; }) {
    const bounds1 = object1.getBounds();
    const bounds2 = object2.getBounds();

    return (
        bounds1.x < bounds2.x + bounds2.width &&
        bounds1.x + bounds1.width > bounds2.x &&
        bounds1.y < bounds2.y + bounds2.height &&
        bounds1.y + bounds1.height > bounds2.y
    );
}

export const game = new Game();


async function addPlayer(world: Container, app: Application<Renderer>): Promise<Player> {
    // Load the bunny texture
    const texture = await Assets.load(playersvg);

    const player = new Sprite(texture);
    player.scale.set(.05);
    player.anchor.set(0.5);
    player.x = app.screen.width / 2;
    player.y = app.screen.height / 2;
    world.addChild(player);
    return new Player(player)
}

async function debug(world: Container, app: Application<Renderer>) {
    // Load the bunny texture
    const texture2 = await Assets.load(playerbase);

    // Create a bunny Sprite
    const player2 = new Sprite(texture2);

    player2.scale.set(.05);
    // Center the sprite's anchor point
    player2.anchor.set(0.5);

    // Move the sprite to the center of the screen
    player2.x = (app.screen.width / 2) + 50;
    player2.y = (app.screen.height / 2) + 100;


    world.addChild(player2);
}