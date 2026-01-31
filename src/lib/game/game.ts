import axios, { type AxiosResponse } from "axios";
import { config } from "../config/config";
import {
  Application,
  Assets,
  Container,
  Point,
  Sprite,
  type Renderer,
  type FederatedPointerEvent,
  type Ticker,
  type Texture,
} from "pixi.js";

import playerTextureUrl from "$lib/assets/round-star.png";
import debugTextureUrl from "$lib/assets/player-base.svg";;
import circleUrl from "$lib/assets/circle.svg";
import Player from "./player";
import type { NewGameData } from "./api/responses";
import { asset } from "$app/paths";
type WorldObject = {
  sprite: Sprite;
  label: string;
};

function aabbIntersects(a: Sprite, b: Sprite): boolean {
  const ab = a.getBounds();
  const bb = b.getBounds();

  return (
    ab.x < bb.x + bb.width &&
    ab.x + ab.width > bb.x &&
    ab.y < bb.y + bb.height &&
    ab.y + ab.height > bb.y
  );
}

class Game {
  private world!: Container;
  private app!: Application;
  private player!: Player;
  private otherPlayers: Player[] = [];
  private readonly worldObjects: WorldObject[] = [];

  private moveTarget: Point | null = null;
  private readonly moveSpeed = 200; // world units / sec
  private readonly stopDistance = 1;

  private readonly update = (ticker: Ticker) => {
    const dt = ticker.deltaMS / 1000;

    this.stepMoveToTarget(dt);
    this.centerCameraOnPlayer();
    this.checkCollisions();
  };

  private readonly onPointerDown = (e: FederatedPointerEvent) => {
    // Convert global/screen position -> world local coordinates using Pixi transforms
    let { x, y } = this.world.toLocal(e.global)
    this.moveTarget = new Point(x, y);
  };

  private readonly onResize = () => {
    this.syncWorldToScreenCenter();
  };

  public async startNewGame(): Promise<void> {
    try {
      await this.createNewGame();
      this.initInput();
      this.initLoop();
      const resp: AxiosResponse<NewGameData> = await axios.post(`${config.apiBaseUrl}/api/v1/game/startnew`);
      console.log("Game started:", resp.data);
      const texture = await Assets.load<Texture>(playerTextureUrl);


      this.otherPlayers.push(...resp.data.players.map((pData) => {
        const sprite = this.createPlayerSprite(texture)
        sprite.position.set(pData.location.x, pData.location.y);
        return new Player(sprite, pData.location)
      }));

      this.world.addChild(...this.otherPlayers.map(p => p.sprite));
      console.log(this.otherPlayers);
    } catch (err) {
      console.error("Error starting game:", err);
    }
  }

  public destroy(): void {
    // Remove listeners + ticker if app exists
    if (this.app) {
      this.app.ticker.remove(this.update);
      this.app.stage.off("pointerdown", this.onPointerDown);
      // Destroys GPU resources + canvas; adjust flags if you want to reuse textures
      this.app.destroy(true);
    }

    window.removeEventListener("resize", this.onResize);

    // Reset state
    this.moveTarget = null;
    this.worldObjects.length = 0;
  }

  // ----------------------------
  // Setup
  // ----------------------------
  private async createNewGame(): Promise<void> {
    // If you ever start a new game while one is running
    this.destroy();
    const ws = new WebSocket('https://dev.bernardn.com/api/v1/connect');
    ws.addEventListener("open", () => {
      console.log("CONNECTED");
      const pingInterval = setInterval(() => {
        console.log(`SENT: ping: `);
        ws.send("ping");
      }, 1000);
    });
    ws.addEventListener("error", (e) => {
      console.log(e);
    });
    ws.addEventListener("message", (e) => {
      console.log(e)
    })
    this.app = new Application<Renderer>();
    await this.app.init({
      background: "#cb9135",
      resizeTo: window,
      antialias: true,
      autoDensity: true,
      preference: "webgpu",
      resolution: window.devicePixelRatio || 1,
    });
    console.log(this.app.renderer)
    this.world = new Container();
    this.app.stage.addChild(this.world);

    this.syncWorldToScreenCenter();
    window.addEventListener("resize", this.onResize);

    // Load textures (cached by Pixi once loaded)
    const [playerTex, debugTex] = await Promise.all([
      Assets.load<Texture>(playerTextureUrl),
      Assets.load<Texture>(debugTextureUrl),
    ]);

    // Place player at world origin so it starts centered immediately
    const playerSprite = this.createPlayerSprite(playerTex);
    playerSprite.position.set(0, 0);
    this.world.addChild(playerSprite);
    this.player = new Player(playerSprite);

    // Debug object offset from player
    const debugSprite = this.createDebugSprite(debugTex);
    debugSprite.scale.set(0.10)
    debugSprite.position.set(50, 100);
    this.world.addChild(debugSprite);
    this.worldObjects.push({ sprite: debugSprite, label: "Debug Object" });

    document.getElementById("game-container")?.appendChild(this.app.canvas);
  }

  private initInput(): void {
    // Let the stage receive pointer events everywhere
    this.app.stage.eventMode = "static";
    this.app.stage.hitArea = this.app.screen;

    this.app.stage.on("pointerdown", this.onPointerDown);
  }

  private initLoop(): void {
    this.app.ticker.add(this.update);
  }

  // ----------------------------
  // Update helpers
  // ----------------------------
  private stepMoveToTarget(dt: number): void {
    if (!this.moveTarget) return;

    const p = this.player.sprite.position;
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

  private centerCameraOnPlayer(): void {
    const p = this.player.sprite.position;
    this.world.pivot.set(p.x, p.y);
  }

  private syncWorldToScreenCenter(): void {
    // World origin stays at screen center; pivot acts as camera target
    if (!this.world || !this.app) return;
    this.world.position.set(this.app.screen.width / 2, this.app.screen.height / 2);
  }

  private checkCollisions(): void {
    for (const obj of this.worldObjects) {
      if (aabbIntersects(this.player.sprite, obj.sprite)) {
        console.log("Collision with:", obj.label);
      }
    }
  }

  // ----------------------------
  // Sprite factories
  // ----------------------------
  private createPlayerSprite(texture: Texture): Sprite {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.scale.set(0.05);
    return sprite;
  }

  private createDebugSprite(texture: Texture): Sprite {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5);
    sprite.scale.set(0.2);
    return sprite;
  }
}

export const game = new Game();
