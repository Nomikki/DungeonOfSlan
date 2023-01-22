import "@/index.scss";
import Actor from "./actor";
import { PlayerAI } from "./actor/ai";
import { Attacker } from "./actor/attacker";
import { Container } from "./actor/container";
import { Abilities, PlayerDestructible } from "./actor/destructible";
import { FieldOfView } from "./actor/fov";
import { Healer, LightningBold } from "./actor/pickable";
import Level, { random } from "./level";
import { createMonster } from "./monsterGenerator";
import { abilityBonus, ensure, float2int, rgbToHex, sign } from "./utils";
import { Camera } from "./utils/camera";
import { Log } from "./utils/log";
import vec2 from "./utils/vec2";

export enum GameStatus {
  STARTUP,
  IDLE,
  NEW_TURN,
  VICTORY,
  DEFEAT,
}

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
  log?: Log;
  camera?: Camera;
  gamestatus: number;

  constructor() {
    this.canvas = ensure(document.querySelector("#screen"));
    this.ctx = ensure((this.canvas as HTMLCanvasElement).getContext("2d"));
    this.ctx.font = `${this.fontSize}px system-ui`;
    this.width = 1024;
    this.height = 512;
    this.lastKey = "";
    this.actors = [];
    this.log = new Log(10);
    this.camera = new Camera();
    this.gamestatus = GameStatus.STARTUP;

    const ver = ensure(document.querySelector("#version"));
    const versionText = `Commit ID: ${COMMIT_HASH} | Version: ${VERSION}`;
    ver.innerHTML = versionText;


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
    this.ctx.fillStyle = "#100A14";
    this.ctx.fillRect(
      x * this.fontSize - this.fontSize / 2,
      y * this.fontSize,
      this.fontSize,
      this.fontSize,
    );


    this.ctx.fillStyle = color;
    this.ctx.fillText(ch, x * this.fontSize, y * this.fontSize + this.fontSize);
  }

  drawCircle(centerX: number, centerY: number, radius: number, color: string, segments: number) {

    for (let a = 0; a < 360; a += (360 / segments)) {
      const dx = Math.sin(a / 180.0 * 3.14) * radius;
      const dy = Math.cos(a / 180.0 * 3.14) * radius;

      this.drawChar('O', float2int(centerX + dx), float2int(centerY + dy), color);

    }
  }

  async drawFrames(caption: string, sx: number, sy: number, ex: number, ey: number) {
    for (let y = sy; y < sy + ey; y++) {
      for (let x = sx; x < sx + ex; x++) {
        let ch = ' ';


        if (x === sx || x === sx + ex - 1)
          ch = '|';

        if (y === sy || y === sy + ey - 1)
          ch = '-';

        if (x === sx && y === sy)
          ch = '+';
        if (x === ex + sx - 1 && y === sy)
          ch = '+';

        if (x === sx && y === sy + ey - 1)
          ch = '+';
        if (x === ex + sx - 1 && y === sy + ey - 1)
          ch = '+';



        this.drawChar(ch, x, y, "#FFF");
      }
    }
    this.drawText(caption, float2int(sx + (ex / 2) - (caption.length / 2)), sy, "#FFF");
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
  ) {
    for (let i = 0; i < text.length; i++) {
      this.drawChar(text.charAt(i), x + i, y, color);
    }
    /*
    this.ctx.textAlign = align as CanvasTextAlign;
    this.ctx.font = `${this.fontSize}px system-ui`;
    this.ctx.fillStyle = "#101010";
    this.ctx.fillStyle = color;
    this.ctx.fillText(
      text,
      x * this.fontSize,
      y * this.fontSize + this.fontSize,
    );
    */
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

  renderUI() {

    this.drawText(`Syvyys: ${this.depth}`, float2int(this.width / this.fontSize) - 10, 0, "#FFF");
    this.drawText(`HP: ${this.player?.destructible?.HP} / ${this.player?.destructible?.maxHP}`, 1, 0, "#FFF");
    this.drawText(`AC: ${this.player?.destructible?.defense}`, 1, 1, "#FFF");


    const abis = ensure(this.player?.destructible).abilities;
    const abiModifiers = new Abilities();
    ensure(abiModifiers).con = abilityBonus(ensure(abis).con);
    ensure(abiModifiers).str = abilityBonus(ensure(abis).str);
    ensure(abiModifiers).dex = abilityBonus(ensure(abis).dex);
    ensure(abiModifiers).int = abilityBonus(ensure(abis).int);
    ensure(abiModifiers).wis = abilityBonus(ensure(abis).wis);


    this.drawText(`CON: ${abis?.con}`, 16, 0, "#FFF");
    this.drawText(`STR: ${abis?.str}`, 26, 0, "#FFF");
    this.drawText(`DEX: ${abis?.dex}`, 36, 0, "#FFF");
    this.drawText(`WIS: ${abis?.wis}`, 46, 0, "#FFF");
    this.drawText(`INT: ${abis?.int}`, 56, 0, "#FFF");

    this.drawText(`${sign(abiModifiers.con)}${abiModifiers?.con}`, 16 + 5, 1, "#FFF");
    this.drawText(`${sign(abiModifiers.str)}${abiModifiers?.str}`, 26 + 5, 1, "#FFF");
    this.drawText(`${sign(abiModifiers.dex)}${abiModifiers?.dex}`, 36 + 5, 1, "#FFF");
    this.drawText(`${sign(abiModifiers.wis)}${abiModifiers?.wis}`, 46 + 5, 1, "#FFF");
    this.drawText(`${sign(abiModifiers.int)}${abiModifiers?.int}`, 56 + 5, 1, "#FFF");


  }

  async render() {
    this.clear(new Color(0x3, 0x3, 0x5));

    await this.level?.render();
    for (let i = 0; i < this.actors.length; i++) {
      this.actors[i].Render();
    }

    this.log?.render();

    this.renderUI();
  }

  findNearestDoor(x: number, y: number, isClosed: boolean) {
    const actors = [];

    for (let i = 0; i < this.actors.length; i++) {
      const actor = this.actors[i];
      if ((actor.name === "Door" || actor.name === "Secret Door")) {
        if (actor.pos.x === x - 1 && actor.pos.y === y && actor.blocks === isClosed) {
          actors.push(actor);
        }
        else if (actor.pos.x === x + 1 && actor.pos.y === y && actor.blocks === isClosed) {
          actors.push(actor);
        }
        else if (actor.pos.x === x && actor.pos.y === y - 1 && actor.blocks === isClosed) {
          actors.push(actor);
        }
        else if (actor.pos.x === x && actor.pos.y === y + 1 && actor.blocks === isClosed) {
          actors.push(actor);
        }
      }

    }
    return actors;
  }

  anyDoorsXY(pos: vec2) {
    for (let i = 0; i < this.actors.length; i++) {
      const actor = this.actors[i];
      if (actor.pos.x === pos.x && actor.pos.y === pos.y) {
        if (actor.name === "Door" || actor.name === "Secret Door") {
          return true;
        }
      }
    }
    return false;
  }


  getActorFromXY(pos: vec2) {
    for (let i = 0; i < this.actors.length; i++) {
      const actor = this.actors[i];
      if (actor.pos.x === pos.x && actor.pos.y === pos.y) {
        return actor;
      }
    }
    return undefined;
  }

  getClosestEnemy(pos: vec2, range: number) {
    let closest: Actor | undefined;
    let bestDistance = 10000;

    for (let i = 0; i < this.actors.length; i++) {
      const actor = this.actors[i];
      const distance = actor.getDistance(pos);
      if (distance < bestDistance && (distance <= range || range === 0) && actor !== this.player && actor.ai && actor.destructible && actor.destructible.HP > 0) {
        bestDistance = distance;
        closest = actor;
      }
    }


    return closest;
  }

  removeActor(actorToBeRemoved: Actor) {
    this.actors = this.actors.filter(actor => actor !== actorToBeRemoved);
  }

  sendToBack(actor: Actor) {
    this.removeActor(actor);
    this.actors.unshift(actor);
  }

  isWall(p: vec2): boolean {
    return ensure(this.level).isWall(p.x, p.y);
  }

  canWalk(p: vec2): boolean {
    if (this.isWall(p))
      return false;

    for (let i = 0; i < this.actors.length; i++) {
      if (this.actors[i].blocks && this.actors[i].pos.x === p.x && this.actors[i].pos.y === p.y)
        return false;
    }

    return true;
  }

  async gameLoop() {


    ensure(this.player).computeFov();

    this.camera?.update(ensure(this.player));
    await this.render();

    while (true) {
      //const oldKey = this.lastKey;
      this.lastKey = await this.getch();

      //if (oldKey != this.lastKey)
      {

        if (this.gamestatus !== GameStatus.DEFEAT)
          this.gamestatus = GameStatus.IDLE;


        await ensure(this.player).update();
        this.camera?.update(ensure(this.player));


        if (this.gamestatus === GameStatus.NEW_TURN) {

          for (let i = 0; i < this.actors.length; i++) {
            if (this.actors[i] != this.player) {
              await this.actors[i].update();
            }
          }
          await this.level?.update();
        }

        await this.render();
      }

    }
  }

  addUnit(name: string, x: number, y: number, character: string, color: string) {
    const actor = new Actor(name, character, color);
    actor.pos.x = x;
    actor.pos.y = y;
    this.actors.push(actor);
  }

  addItem(name: string, x: number, y: number) {
    let color = "#808080";
    let character = "?";
    let pickableType = undefined;
    let blockFov = false;
    let blocks = false;

    if (name === "Healing potion") {
      color = "#FF00FF";
      character = '!';
      pickableType = new Healer(10);
    }
    else if (name === "Scroll of lightning bolt") {
      color = "#FFAA00";
      character = '#';
      pickableType = new LightningBold(10, 15);
    } else if (name === "Stairs") {
      color = "#FFFFFF";
      character = '>';
      blockFov = true;
    } else if (name === "Door") {
      color = "#A08000";
      character = 'D';
      blockFov = false;
      blocks = true;
    } else if (name === "Secret Door") {
      color = "#999";
      character = '#';
      blockFov = false;
      blocks = true;
    }

    this.addUnit(name, x, y, character, color);
    const item = this.actors[this.actors.length - 1];
    item.blockFov = blockFov;
    item.blocks = blocks;

    if (pickableType)
      item.pickable = pickableType;
    console.log(`Item ${item.name} added`);
    this.sendToBack(item);
  }

  async pressSpaceToContinue() {
    this.log?.addToLog("Paina SPACE jatkaaksesi.", "#FFF");
    await this.render();
    while (1) {
      const ch = await this.getch();
      if (ch === ' ')
        break;
    }
  }

  addAI(name: string, x: number, y: number) {
    let color = "#808080";
    let character = "?";
    let hp = 10;
    let defense = 2;
    const corpseName = "carcass of " + name;
    let attackPower = "1d4";


    if (name === "Hero") {
      color = "#FFF";
      character = "@";
      hp = 15;
      defense = 10;
      attackPower = "1d4";

      this.addUnit(name, x, y, character, color);
      this.player = this.actors[this.actors.length - 1];
      this.player.destructible = new PlayerDestructible(hp, defense, corpseName);

      this.player.destructible.abilities.con = 10;
      this.player.destructible.abilities.dex = 12;
      this.player.destructible.abilities.str = 18;
      this.player.destructible.abilities.int = 10;
      this.player.destructible.abilities.wis = 10;

      this.player.attacks?.push(new Attacker(attackPower, "str"));
      ensure(this.player).ai = new PlayerAI();
      this.player.container = new Container(26);
      this.player.fov = new FieldOfView(ensure(this.level).width, ensure(this.level).height);

      this.player.pos = ensure(this.level).startPosition;
      return;
    }




    const monster = createMonster(name, x, y);
    if (monster) {
      this.actors.push(monster);
    }
    return;

  }

  async init() {
    this.level = new Level(80, 40);
  }

  async nextLevel() {
    this.log?.addToLog("Menit yhden tason syvemmälle.", "#999");

    this.level = undefined;
    const tempPlayer = this.player as Actor;
    this.actors = [];
    this.level = new Level(80, 40);
    this.depth++;
    await this.level?.generateMap(this.masterSeed, this.depth);
    this.actors.push(tempPlayer);

    ensure(this.player).pos = ensure(this.level).startPosition;
    await this.player?.fov?.clearLos();

    this.addItem("Stairs", ensure(this.level).stairs.x, ensure(this.level).stairs.y);
    this.fillWithNPCs();
    this.fillWithItems();

    await this.player?.computeFov();

  }

  async newGame() {
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
      `${COMMIT_HASH !== "dev" ? "/DungeonOfSlan" : ""}/?seed=${this.masterSeed}`,
    );

    //this.masterSeed = 0;
    //for (let i = 0; i < 100; i++) {
    //this.masterSeed = i;
    //console.log(i);

    await this.level?.generateMap(this.masterSeed, this.depth);
    /*
    console.log(`Welcome to ${this.level?.dungeonName}`);
    }
    */




    this.addAI("Hero", 4, 12);
    this.fillWithNPCs();
    this.fillWithItems();


    this.addItem("Stairs", ensure(this.level).stairs.x, ensure(this.level).stairs.y);

  }

  fillWithItems() {


    for (let i = 0; i < ensure(this.level?.root).rooms.length; i++) {
      const room = ensure(this.level?.root?.rooms[i]);

      if (float2int(room.GetCenterX()) === this.level?.startPosition.x && float2int(room.GetCenterY()) === this.level.startPosition.y) {
        continue;
      }
      const wh = Math.min(5, random.getInt(0, float2int(Math.sqrt(Math.max(0, (room.w - 5) * (room.h - 5))))));

      //console.log(wh);
      for (let a = 0; a < wh; a++) {

        let dx = 0;
        let dy = 0;

        while (1) {
          dx = random.getInt(room?.x + 2, (room.x + room.w - 2));
          dy = random.getInt(room?.y + 2, (room.y + room.h - 3));
          if (this.canWalk(new vec2(dx, dy))) {
            break;
          }

        }
        if (random.getInt(0, 100) > 50) {
          const r = random.getInt(0, 5);
          if (r === 0)
            this.addItem("Healing potion", dx, dy);
          if (r === 1)
            this.addItem("Scroll of lightning bolt", dx, dy);

        }
      }
    }

  }

  fillWithNPCs() {
    let amountOfMonsters = 0;
    let amountOfRooms = 0;
    const monsterArray = ["rat", "kobold"];

    for (let i = 0; i < ensure(this.level?.root).rooms.length; i++) {
      const room = ensure(this.level?.root?.rooms[i]);
      amountOfRooms++;
      if (float2int(room.GetCenterX()) === this.level?.startPosition.x && float2int(room.GetCenterY()) === this.level.startPosition.y) {
        continue;
      }
      const wh = Math.min(5, random.getInt(0, float2int(Math.sqrt(Math.max(0, (room.w - 4) * (room.h - 4))))));

      //console.log(wh);
      for (let a = 0; a < wh; a++) {

        let dx = 0;
        let dy = 0;

        const r = random.getInt(1, 5);
        const monster = monsterArray[random.getInt(0, monsterArray.length)];

        for (let b = 0; b < r; b++) {
          while (1) {
            dx = random.getInt(room?.x + 2, (room.x + room.w - 2));
            dy = random.getInt(room?.y + 2, (room.y + room.h - 3));
            if (this.canWalk(new vec2(dx, dy))) {
              break;
            }
          }

          if (random.getInt(0, 100) > 90) {
            this.addAI(monster, dx, dy);
            amountOfMonsters++;
          }
        }
      }
    }

    const monsterRatio = amountOfMonsters / amountOfRooms;
    if (monsterRatio >= 0.7)
      this.log?.addToLog(`${this.level?.dungeonName} vaikuttaa todella vaaralliselta.`, "#FFFFFF");
    else if (monsterRatio >= 0.5)
      this.log?.addToLog(`${this.level?.dungeonName} vaikuttaa melkoisen pahaenteiseltä.`, "#FFFFFF");
    else if (monsterRatio >= 0.25)
      this.log?.addToLog(`${this.level?.dungeonName} vaikuttaa melkoisen asumattomalta.`, "#FFFFFF");
    else
      this.log?.addToLog(`${this.level?.dungeonName} vaikuttaa hiljaiselta.`, "#FFFFFF");


    console.log(amountOfMonsters / amountOfRooms, amountOfMonsters, amountOfRooms);
  }

  async load() {
    // just placeholder
    await this.newGame();
  }

  async run() {
    await this.init();
    await this.load();
    await this.gameLoop();
  }
}

export const game = new Game();
game.run();
