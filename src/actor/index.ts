import vec2 from "@/utils/vec2";
import { game } from "..";
import Ai, { MonsterAi, PlayerAI } from "./ai";

export default class Actor {
  name: string;
  ch: string;
  color: string;
  pos: vec2;
  blocks: boolean;
  fovOnly: boolean;
  blockFov: boolean;

  ai?: Ai | PlayerAI | MonsterAi;

  constructor(name: string, ch: string, color: string) {
    this.name = name;
    this.ch = ch;
    this.color = color;
    this.pos = new vec2(1, 1);

    this.blocks = true;
    this.fovOnly = true;
    this.blockFov = false;
  }

  update() {
    if (this.ai) {
      this.ai.update(this);
    }
  }


  getDistance(pos: vec2): number {
    const dx = this.pos.x - pos.x;
    const dy = this.pos.y - pos.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  Render() {
    game.drawChar(this.ch, this.pos.x, this.pos.y, this.color);
  }
}