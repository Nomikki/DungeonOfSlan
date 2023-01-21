import { ensure } from "@/utils";
import vec2 from "@/utils/vec2";
import { game } from "..";
import Ai, { MonsterAi, PlayerAI } from "./ai";
import { Attacker } from "./attacker";
import { Container } from "./container";
import { ItemDestructible, MonsterDestructible, PlayerDestructible } from "./destructible";
import { FieldOfView } from "./fov";
import { Pickable } from "./pickable";

export default class Actor {
  name: string;
  ch: string;
  color: string;
  pos: vec2;
  blocks: boolean;
  fovOnly: boolean;
  blockFov: boolean;

  ai?: Ai | PlayerAI | MonsterAi;
  destructible?: PlayerDestructible | MonsterDestructible | ItemDestructible;
  attacks: Attacker[];
  container?: Container;
  pickable?: Pickable;
  fov?: FieldOfView;

  selectedAttack = 0;


  constructor(name: string, ch: string, color: string) {
    this.name = name;
    this.ch = ch;
    this.color = color;
    this.pos = new vec2(1, 1);

    this.blocks = true;
    this.fovOnly = true;
    this.blockFov = false;
    this.attacks = [];
  }

  async update() {
    if (this.ai) {
      await this.ai.update(this);
    }
  }

  async computeFov() {
    if (this.fov)
    {
      this.fov.calculate(this, 10);
    }
  }


  getDistance(pos: vec2): number {
    const dx = this.pos.x - pos.x;
    const dy = this.pos.y - pos.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  Render() {
    const fov = game.player?.fov && game.player.fov.isInFov(this.pos);
    if (fov === 2 || (fov != 0 && this.blockFov == true))
    {
      const px = this.pos.x - ensure(game.camera).x;
      const py = this.pos.y - ensure(game.camera).y;
      game.drawChar(this.ch, px, py, this.color);
    }
  }
}