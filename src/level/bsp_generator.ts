import bspNode from "@/level/bsp_node";
import { ensure, float2int } from "@/utils";
import Randomizer from "@/utils/random";
import Rectangle from "@/utils/rectangle";

const random = new Randomizer();

class bspGenerator {
  maxLevel: number;
  rootContainer: Rectangle;
  rows: number;
  cols: number;
  //map: number[];
  //doorPlaces: Rectangle[];
  tempRooms: Rectangle[];
  corridos: Rectangle[];
  rooms: Rectangle[];
  tree: bspNode;

  constructor(x: number, y: number, w: number, h: number, maxLevel = 5) {
    this.maxLevel = maxLevel;

    this.rootContainer = new Rectangle(x+1, y+1, w-2, h-2);

    this.rows = h;
    this.cols = w;

    this.corridos = [];

    //this.map = [];
    //this.doorPlaces = [];
    this.tempRooms = [];
    /*
    for (let h = 0; h < this.rows; h++) {
      for (let w = 0; w < this.cols; w++) {
        const index = this.cols * h + w;
        this.map[index] = 1;
      }
    }
    */

    this.tree = this.Devide(this.rootContainer, 0);
    this.rooms = this.tree.GetLeafs();
    this.CreateRooms();
    this.ConnectRooms(this.tree, this.corridos);
  }

  RandomSplit(container: Rectangle) {
    let r1, r2;

    let splitVertical: boolean = random.getInt(0, 1) ? false : true;

    if (container.w > container.h && container.w / container.h >= 0.05) {
      splitVertical = true;
    } else {
      splitVertical = false;
    }

    if (splitVertical) {
      //Vertical
      const w = random.getInt(container.w * 0.3, container.w * 0.6);
      r1 = new Rectangle(container.x, container.y, w, container.h);
      r2 = new Rectangle(
        container.x + w,
        container.y,
        container.w - w,
        container.h,
      );
    } else {
      //horizontal
      const h = random.getInt(container.h * 0.3, container.h * 0.6);
      r1 = new Rectangle(container.x, container.y, container.w, h);
      r2 = new Rectangle(
        container.x,
        container.y + h,
        container.w,
        container.h - h,
      );
    }
    return [r1, r2];
  }

  Devide(container: Rectangle, level: number): bspNode {
    const root = new bspNode(container);

    if (level < this.maxLevel && container.w >= 10 && container.h >= 10) {
      const sr = this.RandomSplit(container);
      root.A = this.Devide(sr[0], level + 1);
      root.B = this.Devide(sr[1], level + 1);
    }
    return root;
  }

  CreateRooms() {
    //for (let i = 0; i < this.rooms.length; i++) {
    for (const room of this.rooms) {
      const w = random.getInt(room.w * 0.8, room.w * 0.9);
      const h = random.getInt(room.h * 0.8, room.h * 0.9);
      const x = random.getInt(room.x, room.x + room.w - w);
      const y = random.getInt(room.y, room.y + room.h - h);

      const rect = new Rectangle(x, y, w, h);
      this.tempRooms.push(rect);
    }
  }

  IsThereRoom(x: number, y: number): boolean {
    for (const room of this.tempRooms) {
      if (x >= room.x && y >= room.y && x <= room.w && y <= room.h) {
        return true;
      }
    }
    return false;
  }

  ConnectRooms(node: bspNode, corridos: Rectangle[]): boolean | void {
    if (!node.A || !node.B) {
      return false;
    }

    const x1 = float2int(node.A.leaf.GetCenterX());
    const y1 = float2int(node.A.leaf.GetCenterY());
    const x2 = float2int(node.B.leaf.GetCenterX());
    const y2 = float2int(node.B.leaf.GetCenterY());

    //console.log(x1, y1, x2, y2);
    corridos.push(new Rectangle(x1-1, y1-1, x2-1, y2-1));

    //game.level.halls.push()

    this.ConnectRooms(ensure(node.A), corridos);
    this.ConnectRooms(ensure(node.B), corridos);
  }
}

export default bspGenerator;
