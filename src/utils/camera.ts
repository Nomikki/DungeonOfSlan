import Actor from "@/actor";
import { float2int } from ".";
import { game } from "..";

export class Camera {
  x: number;
  y: number;

  constructor() {
    this.x = 0;
    this.y = 0;
  }

  update(following: Actor) {
    this.x = following.pos.x - float2int((game.width / game.fontSize / 2));
    this.y = following.pos.y - float2int((game.height / game.fontSize / 2));
  }
}