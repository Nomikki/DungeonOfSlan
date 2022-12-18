//import vec2 from "@/utils/vec2";
import { ensure, float2int } from "@/utils";
import vec2 from "@/utils/vec2";
import Actor from ".";
import { game } from "..";

export default class Ai {

  update(owner: Actor) {
    console.log("raw ai.", owner);
  }

}

export class PlayerAI extends Ai {

  update(owner: Actor) {
    //if owner destructible and not dead...
    if (owner.destructible && owner.destructible.isDead())
      return;

    let dx = 0;
    let dy = 0;
    //console.log(game.lastKey);

    if (game.lastKey === "ArrowLeft") {
      dx = -1;
    }
    else if (game.lastKey === "ArrowRight") {
      dx = 1;
    }
    else if (game.lastKey === "ArrowUp") {
      dy = -1;
    }
    else if (game.lastKey === "ArrowDown") {
      dy = 1;
    }

    //this.handleActionKey(owner, game.lastKey);

    if (dx != 0 || dy != 0) {
      if (this.moveOrAttack(owner, new vec2(owner.pos.x + dx, owner.pos.y + dy))) {
        console.log("compute fov");
      }
    }

  }
  /*
  handleActionKey(owner: Actor, key: string)
  {
    owner.pos.x += 0;
    //console.log(key);
  }
  */

  moveOrAttack(owner: Actor, target: vec2): boolean {
    const p = target;
    if (game.isWall(p))
      return false;

    for (let i = 0; i < game.actors.length; i++) {
      const actor = game.actors[i];
      if (actor.attacker && actor.destructible && !actor.destructible.isDead() && actor.pos.x === target.x && actor.pos.y === target.y) {
        ensure(owner.attacker).attack(owner, actor);
        return false;
      }
    }

    // look for corpses
    for (let i = 0; i < game.actors.length; i++) {
      const actor = game.actors[i];
      const corpseOrItem = (actor.destructible && actor.destructible.isDead()) /*|| actor.pickable*/;
      if (corpseOrItem) {
        if (actor.pos.x === target.x && actor.pos.y === target.y) {
          console.log(`There's a ${actor.name} here`);
        }
      }
    }

    owner.pos = target;

    return true;
  }

}


export class MonsterAi extends Ai {
  update(owner: Actor) {
    //if destructible and alive
    if (owner.destructible && owner.destructible.isDead())
      return;

    this.moveOrAttack(owner, ensure(game.player).pos);
  }

  moveOrAttack(owner: Actor, target: vec2) {
    let dx = target.x - owner.pos.x;
    let dy = target.y - owner.pos.y;
    const stepdx = (dx > 0 ? 1 : -1);
    const stepdy = (dy > 0 ? 1 : -1);

    const distance = float2int(Math.sqrt(dx * dx + dy * dy));
    if (distance >= 2) {
      console.log(distance);
      dx = float2int(dx / distance);
      dy = float2int(dy / distance);

      const p = new vec2(owner.pos.x + dx, owner.pos.y + dy);
      const p2 = new vec2(owner.pos.x + stepdx, owner.pos.y);
      const p3 = new vec2(owner.pos.x, owner.pos.y + stepdx);

      if (game.canWalk(p)) {
        owner.pos.x += dx;
        owner.pos.y += dy;
        console.log(owner.pos);
      } else if (game.canWalk(p2)) {
        owner.pos.x += stepdx;
      } else if (game.canWalk(p3)) {
        owner.pos.y += stepdy;
      }
    }

  }
}
