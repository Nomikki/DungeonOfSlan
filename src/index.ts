import "@/index.scss";
import Actor from "./actor";
import { MonsterAi, PlayerAI } from "./actor/ai";
import Level from "./level";
import { ensure, float2int, rgbToHex } from "./utils";
import vec2 from "./utils/vec2";

export class Color {
  r = 0;
  g = 0;
  b = 0;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }
}

export class Game {
  canvas: Element;
  ctx: CanvasRenderingContext2D;

  width: number;
  height: number;
  lastKey: string;
  fontSize = 12;

  masterSeed = 0;
  depth = 0;
  level?: Level;
  actors: Actor[];
  player?: Actor;

  constructor() {
    this.canvas = ensure(document.querySelector("#screen"));
    this.ctx = ensure((this.canvas as HTMLCanvasElement).getContext("2d"));
    this.ctx.font = `${this.fontSize}px system-ui`;
    this.width = 1024;
    this.height = 512;
    this.lastKey = "";
    this.actors = [];


  }

  clear(color: Color): void {
    //Game
    this.ctx.fillStyle = rgbToHex(color.r, color.g, color.b);
    this.ctx.fillRect(0, 0, this.width, this.height);


  }

  putPixel(x: number, y: number, color: Color): void {
    const id = this.ctx.getImageData(0, 0, this.width, this.height);
    const off = (y * id.width + x) * 4;
    const pixels = id.data;

    pixels[off] = color.r;
    pixels[off + 1] = color.g;
    pixels[off + 2] = color.b;
    pixels[off + 3] = 255;

    this.ctx.putImageData(id, 0, 0);
  }

  drawChar(ch: string, x: number, y: number, color = "#BBB") {
    if (x < 0 || y < 0 || (x + 1) * this.fontSize >= this.width || (y + 1) * this.fontSize >= this.height) {
      return;
    }


    this.ctx.textAlign = "center";
    this.ctx.fillStyle = "#101010";
    this.ctx.fillRect(
      x * this.fontSize - this.fontSize / 2,
      y * this.fontSize,
      this.fontSize,
      this.fontSize,
    );


    this.ctx.fillStyle = color;
    this.ctx.fillText(ch, x * this.fontSize, y * this.fontSize + this.fontSize);
  }

  /*
  drawRectangle(
    x: number,
    y: number,
    color = "#101010",
    opacity: number,
  ) {
    if (x < 0 || y < 0 || x > this.width || y > this.height) {
      return;
    }

    let lvalue = opacity.toString(16);
    if (lvalue.length === 0) lvalue = "00";
    if (lvalue.length < 2) lvalue = "0" + lvalue;
    this.ctx.textAlign = "center";
    this.ctx.fillStyle = color + lvalue;
    this.ctx.fillRect(
      x * this.fontSize - this.fontSize / 2,
      y * this.fontSize,
      this.fontSize,
      this.fontSize,
    );

    this.ctx.fillStyle = "#FFFFFFFF";
  }
  */

  drawText(
    text: string,
    x: number,
    y: number,
    color = "#909090",
    align = "left",
  ) {
    this.ctx.textAlign = align as CanvasTextAlign;
    this.ctx.font = `${this.fontSize}px system-ui`;
    this.ctx.fillStyle = "#101010";
    this.ctx.fillStyle = color;
    this.ctx.fillText(
      text,
      x * this.fontSize,
      y * this.fontSize + this.fontSize,
    );
  }

  waitingKeypress() {
    return new Promise<void>(resolve => {
      const onKeyHandler = async (e: KeyboardEvent) => {

        if (e.key) {
          game.lastKey = e.key;
        }
        document.removeEventListener("keydown", onKeyHandler);
        resolve();
        return;
      };

      document.addEventListener("keydown", onKeyHandler);
    });
  }

  //wait keypress and return key
  async getch() {
    await this.waitingKeypress();
    const tempKey = this.lastKey;
    this.lastKey = "";
    return tempKey;
  }

  render() {
    this.clear(new Color(0, 0, 0));

    this.level?.render();
    for (let i = 0; i < this.actors.length; i++) {
      this.actors[i].Render();
    }

  }

  isWall(p: vec2): boolean {
    return ensure(this.level).isWall(p.x, p.y);
  }

  canWalk(p: vec2): boolean {
    if (this.isWall(p) == true)
      return false;

    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i].blocks && this.actors[i].pos === p)
        return false;
    }

    return true;
  }

  async gameLoop() {
    while (true) {
      this.render();

      //const oldKey = this.lastKey;
      this.lastKey = await this.getch();

      /*
      if (oldKey != this.lastKey)
      {
        
      }
      */

      ensure(this.player).update();

      for (let i = 0; i < this.actors.length; i++) {
        if (this.actors[i] != this.player) {
          this.actors[i].update();
        }
      }
    }
  }

  addUnit(name: string, x: number, y: number, character: string, color: string) {
    const actor = new Actor(name, character, color);
    actor.pos.x = x;
    actor.pos.y = y;
    this.actors.push(actor);
  }

  addAI(name: string, x: number, y: number) {
    let color = "#808080";
    let character = "?";


    if (name === "Hero") {
      color = "#FFF";
      character = "@";
      this.addUnit(name, x, y, character, color);
      this.player = this.actors[this.actors.length - 1];
      ensure(this.player).ai = new PlayerAI();
      return;
    }

    if (name === "Orc") {
      character = 'O';
      color = "#00FF00";
    }

    this.addUnit(name, x, y, character, color);
    this.actors[this.actors.length - 1].ai = new MonsterAi();

  }

  init() {
    this.level = new Level(80, 40);
  }

  newGame() {
    //this.masterSeed = 1337;
    this.masterSeed = float2int(Math.random() * 0x7ffffff);

    if (window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has("seed"))
        this.masterSeed = parseInt(ensure(urlParams.get("seed")));
    }

    history.pushState(
      {},
      "Dungeon of Slan",
      `/?seed=${this.masterSeed}`,
    );

    //this.masterSeed = 0;
    //for (let i = 0; i < 1000; i++) {
    //this.masterSeed = i;
    //console.log(i);

    this.level?.generateMap(this.masterSeed, this.depth);
    //}
    /*
    console.log(`Welcome to ${this.level?.dungeonName}`);
  }
  */

    this.addAI("Hero", 4, 12);
    this.addAI("Orc", 14, 12);


  }

  load() {
    // just placeholder
    this.newGame();
  }

  async run() {
    console.log("Game is running");
    this.init();
    this.load();
    this.gameLoop();
  }
}

export const game = new Game();
game.run();
