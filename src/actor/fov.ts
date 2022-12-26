import { float2int } from "@/utils";
import vec2 from "@/utils/vec2";
import Actor from ".";
import { game } from "..";
//import { game } from "..";

export class FieldOfView {
  tiles: number[];
  width: number;
  height: number;

  constructor(width: number, height: number) {

    this.width = width;
    this.height = height;

    this.tiles = new Array(this.width * this.height).fill(0);

  }


  setInFov(point: vec2, set: number) {
    if (point.x >= 0 && point.y >= 0 && point.x < this.width && point.y < this.height) {
      this.tiles[point.x + point.y * this.width] = set;
    }
  }


  isInFov(point: vec2) {
    if (point.x >= 0 || point.y >= 0 || point.x < this.width || point.y < this.height) {
      return this.tiles[point.x + point.y * this.width];
    }
    return 0;
  }

  async clearLos() {
    for (let i = 0; i < this.width * this.height; i++) {
      this.tiles[i] = 0;
    }
  }

  async revealAll() {
    for (let i = 0; i < this.width * this.height; i++) {
      if (this.tiles[i] == 0)
        this.tiles[i] = 1;
    }
  }


  async calculate(owner: Actor, radius: number) {

    //this.revealAll();

    for (let i = 0; i < this.width * this.height; i++) {
      if (this.tiles[i] == 2)
        this.tiles[i] = 1;
    }


    for (let a = 0; a < 360; a++) {
      let px = owner.pos.x + 0.5;
      let py = owner.pos.y + 0.5;

      this.setInFov(new vec2(float2int(px), float2int(py)), 2);

      const dx = Math.sin(a / 180.0 * 3.1416);
      const dy = Math.cos(a / 180.0 * 3.1416);

      for (let rayLen = 0; rayLen < radius; rayLen++) {
        px += dx;
        py += dy;
        const p = new vec2(float2int(px), float2int(py));

        this.setInFov(new vec2(float2int(px), float2int(py)), 2);


        if (game.isWall(p)) {
          break;
        }

      }
    }
  }
}