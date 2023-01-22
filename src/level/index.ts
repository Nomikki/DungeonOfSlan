import { capitalize, ensure, float2int, rgbToHex } from "@/utils";
import Randomizer from "@/utils/random";
import Rectangle from "@/utils/rectangle";
import vec2 from "@/utils/vec2";
//import Rectangle from "@/utils/rectangle";
//import Rectangle from "@/utils/rectangle";
import { game } from "..";
import bspGenerator from "./bsp_generator";
//import bspGenerator from "./bsp_generator";

enum TileTypes {
  unused,
  roomFloor,
  corridorFloor,
  roomWall,
  corridorWall,
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
  scentTemp = 0;
  scent = 0;
}

export const random = new Randomizer();

export default class Level {
  readonly ROOM_MIN_SIZE: number = 4;

  width: number;
  height: number;
  depth = 0;
  levelSeed = 0;

  root: bspGenerator | undefined;
  tiles: Tile[];
  noisemap: number[];
  pathMap: number[];
  nodeTemp: PathNode[];
  nodes: PathNode[];

  startPosition: vec2;
  stairs: vec2;

  dungeonName: string;
  failedCorridos: Rectangle[] = [];


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
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      const index = x + y * this.width;

      return this.tiles[index].collide;
    }

    return false;
  }

  isRoomWall(x: number, y: number): boolean {
    if (x >= 0 && x <= this.width && y >= 0 && y <= this.height) {
      const index = x + y * this.width;
      if (this.tiles[index].type === TileTypes.roomWall)
        return this.tiles[index].collide;

      return false;
    }

    return false;
  }

  setWall(x: number, y: number, tileType: number) {
    x = float2int(x);
    y = float2int(y);

    this.tiles[x + y * this.width].collide = true;
    this.tiles[x + y * this.width].type = tileType;
  }

  setFloor(x: number, y: number, tileType: number) {
    x = float2int(x);
    y = float2int(y);

    this.tiles[x + y * this.width].collide = false;
    this.tiles[x + y * this.width].type = tileType;
  }

  dig(x1: number, y1: number, x2: number, y2: number, tileType: number) {
    for (let y = y1; y < y1 + y2; y++) {
      for (let x = x1; x < x1 + x2; x++) {
        this.setFloor(x, y, tileType);
      }
    }
  }

  async makeFloors(x1: number, y1: number, x2: number, y2: number, tileType: number) {
    const y = y2 - y1;
    const x = x2 - x1;

    this.dig(x1, y1, x, y, tileType);
  }


  async makeWalls(x1: number, y1: number, x2: number, y2: number) {
    const y = y2 - y1;
    const x = x2 - x1;


    for (let i = 0; i <= y; i++) {
      this.setWall(x1, y1 + i, TileTypes.roomWall);
      this.setWall(x2, y1 + i, TileTypes.roomWall);
    }

    for (let i = 0; i <= x; i++) {
      this.setWall(x1 + i, y1, TileTypes.roomWall);
      this.setWall(x1 + i, y2, TileTypes.roomWall);
    }
  }

  fillUnusedTiles() {
    this.tiles.map(tile => {
      if (tile.type === TileTypes.unused) {
        tile.collide = true;
        tile.type = TileTypes.corridorWall;
        tile.scent = 0;
        tile.scentTemp = 0;
      }
    });
  }


  makeDoorHole(x: number, y: number, w: number, h: number, wall: number) {
    if (wall == 0) {
      this.setFloor(x - 1, y + (h / 2), TileTypes.roomFloor);
      this.setFloor(x, y + (h / 2), TileTypes.corridorFloor);
      //this.setFloor(x + 1, y + (h / 2), TileTypes.corridorFloor);
    }
    else if (wall == 1) {
      this.setFloor(x + w - 1, y + (h / 2), TileTypes.roomFloor);
      this.setFloor(x + w, y + (h / 2), TileTypes.corridorFloor);
      //this.setFloor(x + w + 1, y + (h / 2), TileTypes.corridorFloor);
    }
    else if (wall == 2) {
      this.setFloor(x + (w / 2), y - 1, TileTypes.roomFloor);
      this.setFloor(x + (w / 2), y, TileTypes.corridorFloor);
      //this.setFloor(x + (w / 2), y + 1, TileTypes.corridorFloor);
    }
    else if (wall == 3) {
      this.setFloor(x + (w / 2), y + h - 1, TileTypes.roomFloor);
      this.setFloor(x + (w / 2), y + h, TileTypes.corridorFloor);
      //this.setFloor(x + (w / 2), y + h + 1, TileTypes.corridorFloor);
    }
    //console.log(x, y, w, h, wall);
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

      const id = this.convertXYtoID(x, y);
      if (this.tiles[id].type !== TileTypes.roomFloor)
        this.setFloor(x, y, TileTypes.corridorFloor);
    }
  }


  async setupPathStart(x: number, y: number) {
    this.nodes = [];

    for (let i = 0; i < this.width * this.height; i++) {
      this.pathMap[i] = this.tiles[i].collide ? -1 : 0;
    }

    const id = this.convertXYtoID(x, y);

    if (id >= 0 && id < this.width * this.height) {
      this.pathMap[id] = 1;
    }
  }

  convertXYtoID(x: number, y: number): number {
    return x + y * this.width;
  }

  getPathmapId(x: number, y: number) {
    return this.pathMap[this.convertXYtoID(x, y)];
  }



  harvestMap(sx: number, sy: number, ex: number, ey: number, maxLen: number) {

    const setPathmapId = (x: number, y: number, id: number) => {
      this.pathMap[this.convertXYtoID(x, y)] = id;
    };

    const trySetPathMap = (x: number, y: number, id: number) => {
      if (this.getPathmapId(x, y) === 0)
        setPathmapId(x, y, id);
    };

    let distance = 0; // counting travelling distance
    for (let i = 0; i < maxLen; i++) {
      for (let x = sx - (i + 1); x < sx + i + 1; x++) { // in every step, increase harvesting area by 2
        for (let y = sy - (i + 1); y < sy + i + 1; y++) {
          if (x < 0 || y < 0 || x >= this.width - 1 || y >= this.height - 1)
            continue; // rajojen ulkopuolella
          if (this.getPathmapId(x, y) === i) { // dismapista löytyi arvo jota haetaan, laitetaan sen ympärille vapaisiin kohtiin sueraavat arvot
            trySetPathMap(x - 1, y, i + 1);
            trySetPathMap(x + 1, y, i + 1);
            trySetPathMap(x, y - 1, i + 1);
            trySetPathMap(x, y + 1, i + 1);

            if (x === ex && y === ey) {
              return distance;
            }
            distance++;
          }
        }
      }
    }

    return 0;
  }

  finalizePath(ex: number, ey: number, distance: number) {


    let x = ex;
    let y = ey;

    for (let i = distance; i >= 0; i--) {
      const pathmapValue = i; //this.pathMap[this.convertXYtoID(x, y)] - 1;

      const nd = new PathNode();
      nd.x = x;
      nd.y = y;
      nd.distance = pathmapValue;
      this.nodes.push(nd);

      if (this.getPathmapId(x - 1, y) === pathmapValue)
        x--;
      else if (this.getPathmapId(x + 1, y) === pathmapValue)
        x++;
      else if (this.getPathmapId(x, y - 1) === pathmapValue)
        y--;
      else if (this.getPathmapId(x, y + 1) === pathmapValue)
        y++;




    }
  }

  async createPath(sx: number, sy: number, ex: number, ey: number, maxLen: number) {
    this.setupPathStart(sx, sy);

    const distance = this.harvestMap(sx, sy, ex, ey, maxLen);
    //console.log(distance);
    if (distance === 0)
      return;

    this.finalizePath(ex, ey, distance);
  }

  async setupMap(seed: number, lvl: number) {
    this.depth = lvl;
    this.levelSeed = seed;
    this.nodeTemp = [];
    random.setSeed(this.levelSeed + lvl * 25);
    this.generateName();

    this.tiles = new Array(this.width * this.height).fill(false);
    for (let i = 0; i < this.width * this.height; i++)
      this.tiles[i] = new Tile();

    const splitAmount = random.getInt(3, 8);
    this.root = new bspGenerator(3, 3, this.width - 4, this.height - 4, splitAmount);
  }

  async makeRooms() {
    for (let i = 0; i < ensure(this.root).rooms.length; i++) {
      const tempRoom = ensure(this.root).tempRooms[i];

      const room = new Rectangle(tempRoom.x, tempRoom.y, tempRoom.w, tempRoom.h);
      await this.makeFloors(room.x, room.y, room.x + room.w, room.y + room.h, TileTypes.roomFloor);
      await this.makeWalls(room.x, room.y, room.x + room.w, room.y + room.h);
      this.makeDoorHole(room.x, room.y, room.w, room.h, random.getInt(0, 4));
    }
  }

  async preparingCorridors() {
    this.failedCorridos = [];
    for (let i = 1; i < ensure(this.root).rooms.length; i++) {
      const startPosition = ensure(this.root).rooms[i - 1].GetCenter();
      const endPosition = ensure(this.root).rooms[i].GetCenter();

      this.nodes = [];
      await this.createPath(startPosition?.x, startPosition?.y, endPosition?.x, endPosition?.y, 128);

      if (this.nodes.length === 0) {
        const corridor = new Rectangle(startPosition.x, startPosition.y, endPosition.x, endPosition.y);
        this.failedCorridos.push(corridor);
      }

      for (let j = 0; j < this.nodes.length; j++) {
        this.nodeTemp.push(this.nodes[j]);
      }

    }

    //console.log("failed: " + this.failedCorridos.length);
  }

  async makeCorridors() {
    for (let i = 0; i < this.nodeTemp.length; i++) {
      const node = this.nodeTemp[i];
      const id = this.convertXYtoID(node.x, node.y);
      if (this.tiles[id].type !== TileTypes.roomFloor)
        this.setFloor(node.x, node.y, TileTypes.corridorFloor);
    }


    for (let i = 0; i < this.failedCorridos.length; i++) {
      const corridor = this.failedCorridos[i];
      this.createNaivePath(corridor.x, corridor.y, corridor.w, corridor.h);
    }
  }

  findFreeRoom(ignoreRoom: number) {
    while (1) {
      const currentRoom = random.getInt(0, ensure(this.root).rooms.length);
      if (currentRoom != ignoreRoom) {
        return currentRoom;
      }
    }
    return 0;
  }

  checkCornerWalls(x: number, y: number) {
    if (this.isWall(x - 1, y - 1) === false && this.isWall(x + 1, y - 1) === true &&
      this.isWall(x - 1, y + 1) === true && this.isWall(x + 1, y + 1) === true)
      return true;

    if (this.isWall(x - 1, y - 1) === true && this.isWall(x + 1, y - 1) === false &&
      this.isWall(x - 1, y + 1) === true && this.isWall(x + 1, y + 1) === true)
      return true;

    if (this.isWall(x - 1, y - 1) === true && this.isWall(x + 1, y - 1) === true &&
      this.isWall(x - 1, y + 1) === false && this.isWall(x + 1, y + 1) === true)
      return true;

    if (this.isWall(x - 1, y - 1) === true && this.isWall(x + 1, y - 1) === true &&
      this.isWall(x - 1, y + 1) === true && this.isWall(x + 1, y + 1) === false)
      return true;

    return false;
  }

  

  setupDoors() {

    //console.log("nodes: " + this.nodeTemp.length);
    let currentTileType = 0;
    for (let i = 1; i < this.nodeTemp.length; i++) {
      const oldTileType = currentTileType;
      const node = this.nodeTemp[i];
      currentTileType = this.tiles[this.convertXYtoID(node.x, node.y)].type;

      if (oldTileType !== currentTileType && currentTileType === TileTypes.corridorFloor) {
        if ((this.isRoomWall(node.x - 1, node.y) === true && this.isRoomWall(node.x + 1, node.y) === true) ||
          (this.isRoomWall(node.x, node.y - 1) === true && this.isRoomWall(node.x, node.y + 1) === true)) {
          if (this.checkCornerWalls(node.x, node.y) === false && !game.anyDoorsXY(new vec2(this.nodeTemp[i].x, this.nodeTemp[i].y))) {
            if (random.getInt(0, 100) > 20) {
              game.addItem("Door", this.nodeTemp[i].x, this.nodeTemp[i].y);
            } else {
              game.addItem("Secret Door", this.nodeTemp[i].x, this.nodeTemp[i].y);
            }
          }
        }
      }
    }
  }

  setupStarsAndStairs() {
    const startRoom = this.findFreeRoom(-1);
    const room = ensure(this.root).rooms[startRoom];
    this.startPosition = room.GetCenter();

    const endRoom = this.findFreeRoom(startRoom);
    const stairsRoom = ensure(this.root).rooms[endRoom];
    this.stairs = stairsRoom.GetCenter();
  }

  async generateMap(seed: number, lvl: number) {
    await this.setupMap(seed, lvl);
    await this.makeRooms();
    await this.preparingCorridors();
    await this.makeCorridors();

    this.fillUnusedTiles();

    if (random.getInt(0, 100) > 80) {
      this.smoothMap();
      this.makeCorridors();
    }

    this.setupDoors();

    //set start and end
    this.setupStarsAndStairs();
  }


  howManyWalls(x: number, y: number): number {
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
    const numWalls = this.howManyWalls(x, y);
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
    //console.log("cavern iters: ", iterAmount);
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
            this.setFloor(x, y, TileTypes.roomFloor);
          } else {
            this.setWall(x, y, TileTypes.roomWall);
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

  async update() {
    this.calculateScents();
  }

  getScentValue(x: number, y: number) {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) {

      return this.tiles[x + y * this.width].scent;
    }

    return 0;
  }

  setScentValue(x: number, y: number, value: number) {
    if (x >= 0 && y >= 0 && x < this.width && y < this.height) {
      this.tiles[x + y * this.width].scent = value;
    }
  }

  calculateScents() {
    const amountOfTiles = this.width * this.height;

    //clear temp data

    for (let i = 0; i < amountOfTiles; i++) {
      this.tiles[i].scentTemp = 0;
      if (this.tiles[i].scent > 0) {
        this.tiles[i].scent -= 0.8;
      }
    }


    //calculate average
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        let avg = 0;
        const s = 2;
        let amount = 0;
        for (let yy = y - s; yy <= y + s; yy++) {
          for (let xx = x - s; xx <= x + s; xx++) {
            if (this.isWall(xx, yy) === false) {

              amount++;
              const v = this.getScentValue(xx, yy);
              avg += v;
            }
          }
        }

        avg /= amount;


        if (avg > 255)
          avg = 255;
        if (avg < 0)
          avg = 0;


        this.tiles[x + y * this.width].scentTemp = avg;

      }
    }

    //update scent map

    for (let i = 0; i < amountOfTiles; i++) {
      this.tiles[i].scent = 0;
      if (!this.tiles[i].collide) {
        this.tiles[i].scent = this.tiles[i].scentTemp;
      }
    }

  }

  async renderScent() {
    const camera = ensure(game.camera);


    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const px = x - camera.x;
        const py = y - camera.y;

        const scentValueRaw = float2int(this.getScentValue(x, y) * 10);
        let scentValue = scentValueRaw;
        if (scentValue < 0) scentValue = 0;
        if (scentValue > 255) scentValue = 255;


        game.drawChar("s", px, py, rgbToHex(scentValue > 0 ? 255 : 0, scentValue, 0));

      }
    }
  }

  async render() {
    const camera = ensure(game.camera);


    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const px = x - camera.x;
        const py = y - camera.y;

        const fov = game.player?.fov?.isInFov(new vec2(x, y));
        if (fov === 2) {
          let ch = ' ';
          const tile = this.tiles[x + y * this.width];
          if (tile.type === TileTypes.corridorFloor)
            ch = '`';
          else if (tile.type === TileTypes.corridorWall)
            ch = '#';
          else if (tile.type === TileTypes.roomFloor)
            ch = '.';
          else if (tile.type === TileTypes.roomWall)
            ch = '#';


          game.drawChar(ch, px, py, '#999');

        } else if (fov === 1) {
          if (this.tiles[x + y * this.width].collide == true)
            game.drawChar("*", px, py, '#999');
          else {
            game.drawChar(' ', px, py, '#999');
          }
        }
      }
    }

    /*
    for (let i = 0; i < this.nodeTemp.length; i++) {
      const x = this.nodeTemp[i].x - camera.x;
      const y = this.nodeTemp[i].y - camera.y;
      game.drawChar('?', x, y, "#FFF");
    }
    */

    //await this.renderScent();




  }



}

