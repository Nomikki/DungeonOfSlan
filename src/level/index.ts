import { capitalize, ensure, float2int } from "@/utils";
import Randomizer from "@/utils/random";
import Rectangle from "@/utils/rectangle";
import vec2 from "@/utils/vec2";
//import Rectangle from "@/utils/rectangle";
//import Rectangle from "@/utils/rectangle";
import { game } from "..";
import bspGenerator from "./bsp_generator";
//import bspGenerator from "./bsp_generator";

enum TileTypes {
  unused = 0,
  floor = 1,
  wall = 2,
}

class PathNode {
  x: number;
  y: number;
  distance: number
  last: boolean;
  constructor() {
    this.x = 0;
    this.y = 0;
    this.distance = 0;
    this.last = false;
  }
}

class Tile {
  type: TileTypes = TileTypes.unused;
  collide = false;
  color = "#000000";
  character = "?";
}

export const random = new Randomizer();

export default class Level {
  readonly ROOM_MIN_SIZE: number = 4;

  width: number;
  height: number;
  depth = 0;
  levelSeed = 0;

  tiles: Tile[];
  noisemap: number[];
  pathMap: number[];
  nodeTemp: PathNode[];
  nodes: PathNode[];

  startPosition: vec2;
  stairs: vec2;

  dungeonName: string;

  constructor(width: number, height: number) {

    this.width = width;
    this.height = height;
    this.dungeonName = "Unknow dungeon";

    this.tiles = new Array(this.width * this.height).fill(false);
    this.noisemap = new Array(this.width * this.height).fill(0);
    this.pathMap = new Array(this.width * this.height);
    this.nodeTemp = [];
    this.nodes = [];

    this.startPosition = new vec2(1, 1);
    this.stairs = new vec2(1, 1);

  }

  isWall(x: number, y: number): boolean {
    if (x >= 0 && x <= this.width && y >= 0 && y <= this.height) {
      const index = x + y * this.width;

      return this.tiles[index].collide;
    }

    return false;
  }

  setWall(x: number, y: number) {
    x = float2int(x);
    y = float2int(y);

    this.tiles[x + y * this.width].collide = true;
    this.tiles[x + y * this.width].type = TileTypes.wall;
  }

  setFloor(x: number, y: number) {
    x = float2int(x);
    y = float2int(y);

    this.tiles[x + y * this.width].collide = false;
    this.tiles[x + y * this.width].type = TileTypes.floor;
  }

  dig(x1: number, y1: number, x2: number, y2: number) {
    for (let y = y1; y < y1 + y2; y++) {
      for (let x = x1; x < x1 + x2; x++) {
        this.setFloor(x, y);
      }
    }
  }

  makeWalls(x1: number, y1: number, x2: number, y2: number) {
    const y = y2 - y1;
    const x = x2 - x1;

    this.dig(x1, y1, x, y);


    for (let i = 0; i <= y; i++) {
      this.setWall(x1, y1 + i);
      this.setWall(x2, y1 + i);
    }


    for (let i = 0; i <= x; i++) {
      this.setWall(x1 + i, y1);
      this.setWall(x1 + i, y2);
    }


  }

  fillUnusedTiles() {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const id = x + y * this.width;
        if (this.tiles[id].type === TileTypes.unused)
          this.setWall(x, y);
      }
    }
  }


  makeDoorHole(x: number, y: number, w: number, h: number, wall: number) {
    if (wall == 0) {
      this.setFloor(x - 1, y + (h / 2));
      this.setFloor(x, y + (h / 2));
      this.setFloor(x + 1, y + (h / 2));
    }
    if (wall == 1) {
      this.setFloor(x + w - 1, y + (h / 2));
      this.setFloor(x + w, y + (h / 2));
      this.setFloor(x + w + 1, y + (h / 2));
    }
    if (wall == 2) {
      this.setFloor(x + (w / 2), y - 1);
      this.setFloor(x + (w / 2), y);
      this.setFloor(x + (w / 2), y + 1);
    }
    if (wall == 3) {
      this.setFloor(x + (w / 2), y + h - 1);
      this.setFloor(x + (w / 2), y + h);
      this.setFloor(x + (w / 2), y + h + 1);
    }
  }



  createNaivePath(sx: number, sy: number, ex: number, ey: number) {
    let x = sx;
    let y = sy;

    while (1) {
      if (x < ex)
        x++;
      else if (x > ex)
        x--;
      else if (y < ey)
        y++;
      else if (y > ey)
        y--;

      if (x == ex && y == ey)
        break;

      this.setFloor(x, y);
    }
  }


  async setPathStart(x: number, y: number) {
    const id = this.convertXYtoID(x, y);

    if (id >= 0 && id < (this.width * this.height)) {
      this.pathMap[id] = 1;
    }
  }

  convertXYtoID(x: number, y: number): number {
    return x + y * this.width;
  }

  createPath(sx: number, sy: number, ex: number, ey: number, maxLen: number): number {
    //this.nodes.splice(0, this.nodes.length);
    this.nodes = [];

    for (let i = 0; i < this.width * this.height; i++) {
      this.pathMap[i] = this.tiles[i].collide ? -1 : 0;
    }

    this.setPathStart(sx, sy);

    let found = false;

    let matka = 0; // pitää kirjaa matkasta joka on jo kuljettu
    for (let i = 0; i < maxLen; i++) { // montako 'askelta'
      for (let x = sx - (i + 1); x < sx + i + 1; x++) { // joka stepillä kasvatetaan haravointialuetta yhdellä (itseasiassa kahdella)
        for (let y = sy - (i + 1); y < sy + i + 1; y++) {
          if (x < 0 || y < 0 || x >= this.width - 1 || y >= this.height - 1)
            continue; // rajojen ulkopuolella
          if (this.pathMap[this.convertXYtoID(x, y)] === i) { // dismapista löytyi arvo jota haetaan, laitetaan sen ympärille vapaisiin kohtiin sueraavat arvot
            if (this.pathMap[this.convertXYtoID(x - 1, y)] === 0)
              this.pathMap[this.convertXYtoID(x - 1, y)] = i + 1;
            if (this.pathMap[this.convertXYtoID(x + 1, y)] === 0)
              this.pathMap[this.convertXYtoID(x + 1, y)] = i + 1;
            if (this.pathMap[this.convertXYtoID(x, y - 1)] === 0)
              this.pathMap[this.convertXYtoID(x, y - 1)] = i + 1;
            if (this.pathMap[this.convertXYtoID(x, y + 1)] === 0)
              this.pathMap[this.convertXYtoID(x, y + 1)] = i + 1;
            if (x === ex && y === ey)
              found = true; // löydettiin loppu
            matka++;
          }
        }
      }
    }
    // lopetusta ei löydetty
    if (found == false) {

      return 1;
    }

    let x = ex;
    let y = ey;

    for (let i = 0; i < matka; i++) {


      const id = this.convertXYtoID(x, y);

      const oldX = x;
      const oldY = y;

      if (this.pathMap[this.convertXYtoID(x - 1, y)] === this.pathMap[id] - 1)
        x--;

      if (this.pathMap[this.convertXYtoID(x + 1, y)] === this.pathMap[id] - 1)
        x++;

      if (this.pathMap[this.convertXYtoID(x, y - 1)] === this.pathMap[id] - 1)
        y--;

      if (this.pathMap[this.convertXYtoID(x, y + 1)] === this.pathMap[id] - 1)
        y++;


      if (oldX !== x || oldY !== y) {
        const nd = new PathNode();
        nd.x = x;
        nd.y = y;
        nd.distance = this.pathMap[id];
        this.nodes.push(nd);
      }
    }
    return 0;
  }


  async generateMap(seed: number, lvl: number) {
    this.depth = lvl;
    this.levelSeed = seed;
    this.nodeTemp = [];
    random.setSeed(this.levelSeed + lvl * 25);

    this.generateName();
    this.tiles = new Array(this.width * this.height).fill(false);
    for (let i = 0; i < this.width * this.height; i++)
      this.tiles[i] = new Tile();
    const splitAmount = random.getInt(3, 8);
    console.log("splitted to " + splitAmount);
    const root = new bspGenerator(3, 3, this.width - 4, this.height - 4, splitAmount);


    for (let i = 0; i < root.rooms.length; i++) {
      const tempRoom = root.tempRooms[i];

      const room = new Rectangle(tempRoom.x, tempRoom.y, tempRoom.w, tempRoom.h);

      this.makeWalls(room.x, room.y, room.x + room.w, room.y + room.h); 0
      this.makeDoorHole(room.x, room.y, room.w, room.h, random.getInt(0, 4));
    }

    const failedCorridos: Rectangle[] = [];
    for (let i = 0; i < root.corridos.length; i++) {
      const corridor = root.corridos[i]
      this.nodes = [];
      this.createPath(corridor.x, corridor.y, corridor.w, corridor.h, 128);

      if (this.nodes.length == 0) {
        //console.log("fail");
        failedCorridos.push(corridor);
      }

      for (let j = 0; j < this.nodes.length; j++) {
        this.nodeTemp.push(this.nodes[j]);
      }
    }



    for (let i = 0; i < this.nodeTemp.length; i++) {
      const node = this.nodeTemp[i];
      this.setFloor(node.x, node.y);
    }

    for (let i = 0; i < failedCorridos.length; i++) {
      const corridor = failedCorridos[i];
      this.createNaivePath(corridor.x, corridor.y, corridor.w, corridor.h);
    }

    this.fillUnusedTiles();
    /*
    {
      this.smoothMap();

      for (let i = 0; i < this.nodeTemp.length; i++) {
        const node = this.nodeTemp[i];
        this.setFloor(node.x, node.y);
      }

      for (let i = 0; i < failedCorridos.length; i++) {
        const corridor = failedCorridos[i];
        this.createNaivePath(corridor.x, corridor.y, corridor.w, corridor.h);
      }
    }
    */

    //set start and end
    const startRoom = random.getInt(0, root.rooms.length);

    const room = root.rooms[startRoom];
    this.startPosition.x = float2int(room.GetCenterX());
    this.startPosition.y = float2int(room.GetCenterY());

    while (1) {
      const endRoom = random.getInt(0, root.rooms.length);
      if (endRoom != startRoom) {
        const stairsRoom = root.rooms[endRoom];
        this.stairs.x = float2int(stairsRoom.GetCenterX());
        this.stairs.y = float2int(stairsRoom.GetCenterY());

        break;
      }
    }


  }


  howManyWalls2(x: number, y: number): number {
    if (x > 0 && y > 0 && x < this.width - 1 && y < this.height - 1) {
      let count = 0;
      for (let lx = x - 1; lx <= x + 1; lx++)
        for (let ly = y - 1; ly <= y + 1; ly++)
          if (this.noisemap[lx + ly * this.width] === 1) count++;

      return count;
    }

    return 0;
  }

  placeWallLogic(x: number, y: number): number {
    const numWalls = this.howManyWalls2(x, y);
    if (this.isWall(x, y)) {
      if (numWalls >= 4) return 1;
      if (numWalls < 2) return 0;
    } else {
      if (numWalls >= 5) return 1;
    }
    return 0;
  }

  async smoothMap() {
    const itermap = new Array(this.width * this.height).fill(0);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.noisemap[x + y * this.width] = this.isWall(x, y) ? 0 : 1;
      }
    }


    const iterAmount = 3; //random.getInt(1, 6);
    console.log("cavern iters: ", iterAmount);
    for (let l = 0; l < iterAmount; l++) {
      for (let y = 1; y < this.height - 1; y++) {
        for (let x = 1; x < this.width - 1; x++) {
          itermap[x + y * this.width] = this.placeWallLogic(x, y);
        }
      }
      for (let i = 0; i < this.width * this.height; i++) {
        this.noisemap[i] = itermap[i];
      }
    }

    //add to map
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        //if (this.isWall(x, y) )
        {
          const index = x + y * this.width;
          if (this.noisemap[index] !== 0) {
            this.setFloor(x, y);
          } else {
            this.setWall(x, y);
          }
        }
      }
    }

  }


  generateName() {
    const listOfAdjectives = ["Suuren", "Mahtavan", "Tukahduttavan", "Kuristavan", "Muinaisen", "Ikuisen", "Loputtoman", "Armottoman"];
    const listOfFirstParts = ["Pelon", "Kuolon", "Varjojen", "Pimeyden", "Kurjuuden", "Tuskan", "Vihan", "Hulluuden", "Painajaisten", "Epätoivon"];
    const listOfSecondParts: string[] = ["luola", "pesä", "maa", "kehto", "kirkko", "temppeli", "lähde", "koti", "linna", "linnoitus"];

    this.dungeonName = "";
    if (random.getInt(0, 10) >= 8) {
      this.dungeonName = listOfAdjectives[random.getInt(0, listOfAdjectives.length)] + " ";
    }
    this.dungeonName += listOfFirstParts[random.getInt(0, listOfFirstParts.length)] + " " + listOfSecondParts[random.getInt(0, listOfFirstParts.length)];
    this.dungeonName = capitalize(this.dungeonName.toLowerCase());
    
  }

  render() {
    const camera = ensure(game.camera);

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const px = x - camera.x;
        const py = y - camera.y;

        const fov = game.player?.fov?.isInFov(new vec2(x, y));
        if (fov === 2) {


          if (this.tiles[x + y * this.width].collide == true)
            game.drawChar("#", px, py, '#999');
          else {
            game.drawChar('.', px, py, '#999');
          }
        } else if (fov === 1) {
          if (this.tiles[x + y * this.width].collide == true)
            game.drawChar("*", px, py, '#999');
          else {
            game.drawChar(' ', px, py, '#999');
          }
        }
      }
    }
  }

}

