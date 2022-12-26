//import vec2 from "@/utils/vec2";
import { ensure, float2int } from "@/utils";
import vec2 from "@/utils/vec2";
import Actor from ".";
import { Color, game, GameStatus } from "..";

export default class Ai {

  async update(owner: Actor) {
    console.log("raw ai.", owner);
  }

}

export class PlayerAI extends Ai {

  async update(owner: Actor) {
    //if owner destructible and not dead...
    if (owner.destructible && owner.destructible.isDead())
      return;

    let dx = 0;
    let dy = 0;

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

    await this.handleActionKey(owner, game.lastKey);

    if (dx != 0 || dy != 0) {
      game.gamestatus = GameStatus.NEW_TURN;
      if (await this.moveOrAttack(owner, new vec2(owner.pos.x + dx, owner.pos.y + dy))) {
        if (owner.fov) {
          await owner.computeFov();
        }

      }
    }

  }

  async chooseFromInventory(owner: Actor) {
    //let key = 0;
    game.clear(new Color(0, 0, 0));
    let shortcut = 'a';

    for (let i = 0; i < ensure(owner.container)?.inventory.length; i++) {
      const actor = owner.container?.inventory[i];
      console.log(actor?.name);
      game.drawText(`${shortcut}) ${actor?.name}`, 2, 2 + i, "#FFFFFF");

      shortcut = String.fromCharCode(shortcut.charCodeAt(0) + 1);
    }

    const ch = await game.getch();
    const actorIndex = ch.charCodeAt(0) - 97; // 97 = a
    if (actorIndex >= 0 && actorIndex < ensure(owner.container).inventory.length) {
      return ensure(owner.container).inventory[actorIndex];
    }
    return undefined;
  }

  async handleActionKey(owner: Actor, key: string) {

    const useItem = async () => {
      const actor = await this.chooseFromInventory(owner);
      if (actor) {
        game.log?.addToLog(`Käytit esineen ${actor.name}`, "#999");
        ensure(actor.pickable).use(actor, owner);
      }
      game.gamestatus = GameStatus.NEW_TURN;
    };

    const pickupItem = async () => {
      let found = false;
      for (let i = 0; i < game.actors.length; i++) {
        const actor = game.actors[i];

        if (actor.pickable && actor.pos.x === owner.pos.x && actor.pos.y === owner.pos.y) {
          if (actor.pickable.pick(actor, owner)) {
            game.log?.addToLog(`Nostit esineen ${actor.name}`, "#999");
            found = true;
            break;
          } else if (!found) {
            game.log?.addToLog(`Sinun laukkusi on täynnä.`, "#999");
          }
        }
      }
      if (!found) {
        game.log?.addToLog(`Tässä ei ole mitään poimittavaa.`, "#999");
      }
      game.gamestatus = GameStatus.NEW_TURN;
    };

    const handleNextLevel = async () => {
      if (game.level?.stairs.x === owner.pos.x && game.level?.stairs.y === owner.pos.y) {
        await game.nextLevel();
      } else {
        game.log?.addToLog(`Tässä ei ole portaita.`, "#999");
      }
      game.gamestatus = GameStatus.NEW_TURN;
    };

    if (key === "g") {
      await pickupItem();
    }
    else if (key === "i") {
      await useItem();
    } else if (key === ">") {
      await handleNextLevel();
    }
    /*
    else if (key === "R") {
      await owner.fov?.revealAll();
    }
    */
  }


  async moveOrAttack(owner: Actor, target: vec2) {
    const p = target;
    if (game.isWall(p))
      return false;

    for (let i = 0; i < game.actors.length; i++) {
      const actor = game.actors[i];
      if (actor.attacker && actor.destructible && !actor.destructible.isDead() && actor.pos.x === target.x && actor.pos.y === target.y) {
        await ensure(owner.attacker).attack(owner, actor);
        return false;
      }
    }

    // look for corpses
    for (let i = 0; i < game.actors.length; i++) {
      const actor = game.actors[i];
      const corpseOrItem = (actor.destructible && actor.destructible.isDead()) || actor.pickable;
      if (corpseOrItem) {
        if (actor.pos.x === target.x && actor.pos.y === target.y) {
          game.log?.addToLog(`Tässä on ${actor.name}.`, "#999");
        }
      }
    }

    owner.pos = target;

    return true;
  }

}


export class MonsterAi extends Ai {
  async update(owner: Actor) {
    //if destructible and alive
    if (owner.destructible && owner.destructible.isDead())
      return;

    await this.moveOrAttack(owner, ensure(game.player).pos);
  }

  async moveOrAttack(owner: Actor, target: vec2) {
    let dx = target.x - owner.pos.x;
    let dy = target.y - owner.pos.y;
    const stepdx = (dx > 0 ? 1 : -1);
    const stepdy = (dy > 0 ? 1 : -1);

    const distance = float2int(Math.sqrt(dx * dx + dy * dy));
    if (distance >= 2) {
      dx = float2int(Math.round(dx / distance));
      dy = float2int(Math.round(dy / distance));

      const p = new vec2(owner.pos.x + dx, owner.pos.y + dy);
      const p2 = new vec2(owner.pos.x + stepdx, owner.pos.y);
      const p3 = new vec2(owner.pos.x, owner.pos.y + stepdy);

      if (game.canWalk(p)) {
        owner.pos.x += dx;
        owner.pos.y += dy;
      } else if (game.canWalk(p2)) {
        owner.pos.x += stepdx;
      } else if (game.canWalk(p3)) {
        owner.pos.y += stepdy;
      }
    } else {
      await owner.attacker?.attack(owner, ensure(game.player));
    }

  }
}
