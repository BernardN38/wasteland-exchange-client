import axios from "axios";

import { config } from "../config/config";
import { Application, Assets, Sprite } from "pixi.js";


export class Game  {
    async startNewGame(): Promise<void> {
        axios.post(`${config.apiBaseUrl}/api/v1/game/startnew`)
            .then(async response => {
                console.log("Game started:", response.data);
               await this.createCanvas();
                
            })
            .catch(error => {
                console.error("Error starting game:", error);
            });
    }

   async createCanvas(): Promise<HTMLCanvasElement> {
        const canvas = document.createElement("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        window.onresize = () => {   
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        canvas.style.backgroundColor = "black";
        document.querySelector("#game-container")?.appendChild(canvas);
            // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Load the bunny texture
    const texture = await Assets.load('https://pixijs.com/assets/bunny.png');

    // Create a bunny Sprite
    const bunny = new Sprite(texture);

    // Center the sprite's anchor point
    bunny.anchor.set(0.5);

    // Move the sprite to the center of the screen
    bunny.x = app.screen.width / 2;
    bunny.y = app.screen.height / 2;

    app.stage.addChild(bunny);

    // Listen for animate update
    app.ticker.add((time) =>
    {
        // Just for fun, let's rotate mr rabbit a little.
        // * Delta is 1 if running at 100% performance *
        // * Creates frame-independent transformation *
        bunny.rotation += 0.1 * time.deltaTime;
    });
    console.log("Canvas created", app.renderer)
        return canvas;
    }
}