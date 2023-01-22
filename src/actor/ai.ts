//import vec2 from "@/utils/vec2";
import { random } from "@/level";
import { ensure, float2int } from "@/utils";
import vec2 from "@/utils/vec2";
import Actor from ".";
import { Color, game, GameStatus } from "..";
import { Equips } from "./equipment";

export default class Ai {
  latestInterestingPoint = new vec2(0, 0);

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
      await ensure(game.level).setScentValue(owner.pos.x, owner.pos.y, 255);
    }

  }

  async chooseFromInventory(owner: Actor, hint: string) {
    //let key = 0;
    game.clear(new Color(0, 0, 0));
    const widthOfInventory = 40;
    const amountOfitemsInInventory = ensure(owner.container)?.inventory.length;
    ensure(game.camera).x += (widthOfInventory / 2);
    await game.render();
    ensure(game.camera).x -= (widthOfInventory / 2);
    let shortcut = 'a';

    const leftBorder = (game.width / game.fontSize) - widthOfInventory - 1;

    await game.drawFrames(" = INVENTORY = ", leftBorder, 3, widthOfInventory, amountOfitemsInInventory + 4);
    game.drawText(hint, leftBorder, amountOfitemsInInventory + 7, "#FFF");

    for (let i = 0; i < amountOfitemsInInventory; i++) {
      const actor = owner.container?.inventory[i];
      console.log(actor?.name);
      game.drawText(`${shortcut}) ${actor?.name}`, leftBorder + 2, 5 + i, "#FFFFFF");

      shortcut = String.fromCharCode(shortcut.charCodeAt(0) + 1);
    }

    const ch = await game.getch();
    const actorIndex = ch.charCodeAt(0) - 97; // 97 = a
    if (actorIndex >= 0 && actorIndex < ensure(owner.container).inventory.length) {
      return ensure(owner.container).inventory[actorIndex];
    }
    return undefined;
  }

  async chooseFromEquipments(owner: Actor, hint: string) {
    //let key = 0;
    game.clear(new Color(0, 0, 0));
    const widthOfEquipments = 40;
    const amountOfitemsEquipments = ensure(owner.equipments)?.equipments.length;
    ensure(game.camera).x += (widthOfEquipments / 2);
    await game.render();
    ensure(game.camera).x -= (widthOfEquipments / 2);
    let shortcut = 'a';

    const leftBorder = (game.width / game.fontSize) - widthOfEquipments - 1;

    await game.drawFrames(" = EQUIPMENTS = ", leftBorder, 3, widthOfEquipments, amountOfitemsEquipments + 3);
    game.drawText(hint, leftBorder, amountOfitemsEquipments + 6, "#FFF");

    for (let i = 1; i < amountOfitemsEquipments; i++) {
      const actor = owner.equipments?.equipments[i];
      //console.log(actor?.name);

      if (i === Equips.None) game.drawText("unknow", leftBorder + 2, 4 + i, "#FFFFFF");
      if (i === Equips.Body) game.drawText("body", leftBorder + 2, 4 + i, "#FFFFFF");
      if (i === Equips.Foots) game.drawText("foots", leftBorder + 2, 4 + i, "#FFFFFF");
      if (i === Equips.Hand1) game.drawText("hand 1", leftBorder + 2, 4 + i, "#FFFFFF");
      if (i === Equips.Hand2) game.drawText("hand 2", leftBorder + 2, 4 + i, "#FFFFFF");
      if (i === Equips.Hands) game.drawText("hands", leftBorder + 2, 4 + i, "#FFFFFF");
      if (i === Equips.Helmet) game.drawText("helmet", leftBorder + 2, 4 + i, "#FFFFFF");
      if (i === Equips.Legs) game.drawText("legs", leftBorder + 2, 4 + i, "#FFFFFF");
      if (i === Equips.Neck) game.drawText("neck", leftBorder + 2, 4 + i, "#FFFFFF");
      if (i === Equips.TwoHand) game.drawText("two hands", leftBorder + 2, 4 + i, "#FFFFFF");

      game.drawText(`${shortcut}) ${actor ? actor?.name : "..."}`, leftBorder + 2 + 10, 4 + i, "#FFFFFF");

      shortcut = String.fromCharCode(shortcut.charCodeAt(0) + 1);
    }

    const ch = await game.getch();
    const actorIndex = ch.charCodeAt(0) - 97; // 97 = a
    if (actorIndex >= 0 && actorIndex < ensure(owner.equipments).equipments.length) {
      return ensure(owner.equipments).equipments[actorIndex+1];
    }
    return undefined;
  }

  async handleActionKey(owner: Actor, key: string) {



    const wearItem = async () => {
      const actor = await this.chooseFromInventory(owner, "wear");
      if (actor && actor.pickable?.equipslot !== Equips.None) {
        if (owner.equipments?.equip(owner, actor, ensure(actor.pickable)?.equipslot)) {
          game.log?.addToLog(`Puet esineen ${actor.name}`, "#999");
        } else {
          game.log?.addToLog(`Esineen ${actor.name} pukeminen epäonnistui. Riisu ensin vanha varuste pois.`, "#F55");
        }
      } else {
        game.log?.addToLog(`Esineen pukeminen epäonnistui. Tätä ei voi pukea.`, "#F55");
      }
      
      owner.ac = ensure(owner.equipments)?.calculateAC(owner);
      game.gamestatus = GameStatus.NEW_TURN;
    };

    const unwearItem = async () => {
      const actor = await this.chooseFromEquipments(owner, "take off");
      if (actor) {
        game.log?.addToLog(`Riisut esineen ${actor.name}`, "#999");
        if (owner.equipments?.takeOff(owner, actor) !== undefined) {
          owner.container?.add(actor);
        }
      }

      owner.ac = ensure(owner.equipments)?.calculateAC(owner);
      game.gamestatus = GameStatus.NEW_TURN;
    };

    const useItem = async () => {
      const actor = await this.chooseFromInventory(owner, "use");
      if (actor) {
        
        if (ensure(actor.pickable).use(actor, owner)) {
          game.log?.addToLog(`Käytit esineen ${actor.name}`, "#999");
        } else {
          game.log?.addToLog(`Esineen käyttö epäonnistui.`, "#F55");
        }
      }
      game.gamestatus = GameStatus.NEW_TURN;
    };

    const dropItem = async () => {
      const actor = await this.chooseFromInventory(owner, "drop");
      if (actor) {
        game.log?.addToLog(`Tiputit esineen ${actor.name}`, "#999");
        ensure(actor.pickable).drop(actor, owner);
      }
      game.gamestatus = GameStatus.NEW_TURN;
    };

    const handleRest = async () => {
      game.log?.addToLog("Lepäät hetken", "#CCC");
      if (random.dice(1, 100) === 100) {
        game.player?.destructible?.Heal(1);
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

    const handleOpenDoor = async () => {
      const actors = game.findNearestDoor(owner.pos.x, owner.pos.y, true);
      let howManyDoorsOpened = 0;
      for (let i = 0; i < actors.length; i++) {
        const actor = actors[i];
        let openTheDoor = false;
        if (actor.name === "Door") {
          openTheDoor = true;
        } else {
          if (random.getInt(0, 10) > 7) {
            openTheDoor = true;
            game.log?.addToLog(`Löysit salaoven!`, "#FFF");
            actor.name = "Door";
            await game.pressSpaceToContinue();
          }
        }

        if (openTheDoor) {
          actor.blocks = false;
          actor.ch = '/';
          howManyDoorsOpened++;
        }

      }

      await owner.computeFov();

      if (howManyDoorsOpened === 1) {
        game.log?.addToLog(`Avasit oven.`, "#999");
      } else if (howManyDoorsOpened > 1) {
        game.log?.addToLog(`Avasit ovia.`, "#999");
      } else {
        game.log?.addToLog(`Tässä ei ole ovea vieressä.`, "#999");
      }


      game.gamestatus = GameStatus.NEW_TURN;
    };

    const handleCloseDoor = async () => {
      const actors = game.findNearestDoor(owner.pos.x, owner.pos.y, false);
      for (let i = 0; i < actors.length; i++) {
        const actor = actors[i];

        actor.blocks = true;
        actor.ch = 'D';
      }

      await owner.computeFov();

      if (actors.length === 1) {
        game.log?.addToLog(`Suljit oven.`, "#999");
      } else if (actors.length > 1) {
        game.log?.addToLog(`Suljit ovia.`, "#999");
      } else {
        game.log?.addToLog(`Tässä ei ole auki olevia ovea vieressä.`, "#999");
      }


      game.gamestatus = GameStatus.NEW_TURN;
    };

    if (key === "g") {
      await pickupItem();
    } else if (key === "i") {
      await useItem();
    } else if (key === "d") {
      await dropItem();
    } else if (key === "w") {
      await wearItem();
    } else if (key === "u") {
      await unwearItem();
    } else if (key === ">") {
      await handleNextLevel();
    } else if (key === "o") {
      await handleOpenDoor();
    } else if (key === "c") {
      await handleCloseDoor();
    } else if (key === ".") {
      await handleRest();
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



      if (actor.attacks && actor.destructible && !actor.destructible.isDead() && actor.pos.x === target.x && actor.pos.y === target.y) {
        await ensure(owner.attacks)[owner.selectedAttack].attack(owner, actor);
        return false;
      }

      //doors and other obstacles
      if (actor.blocks && actor.pos.x === target.x && actor.pos.y === target.y)
        return false;
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

  async canSee(owner: Actor, p: vec2) {
    const d = float2int(owner.getDistance(p));
    const dx = (owner.pos.x - p.x) / d;
    const dy = (owner.pos.y - p.y) / d;
    let x = p.x;
    let y = p.y;

    for (let i = 0; i < d; i++) {
      x += dx;
      y += dy;
      if (game.isWall(new vec2(float2int(x), float2int(y))))
        return false;
    }
    return true;
  }


  async update(owner: Actor) {
    let justMove = false;
    //if destructible and alive
    if (owner.destructible && owner.destructible.isDead())
      return;

    let targetFound = false;
    // enemy can see, hear and/or smell player
    if (await this.canSee(owner, ensure(game.player).pos)) {
      this.latestInterestingPoint = ensure(game.player).pos;
      targetFound = true;
    }

    if (targetFound === false) {
      if (ensure(game.level)?.getScentValue(owner.pos.x, owner.pos.y) > 0) {
        //find biggest value
        let p = new vec2(owner.pos.x, owner.pos.y);
        let biggestScentValue = 0;
        for (let y = owner.pos.y - 1; y <= owner.pos.y + 1; y++) {
          for (let x = owner.pos.x - 1; x <= owner.pos.x + 1; x++) {
            const v = ensure(game.level).getScentValue(x, y);
            if (v > biggestScentValue && !(x === owner.pos.x && y === owner.pos.y)) {
              biggestScentValue = v;
              p = new vec2(x, y);
            }
            targetFound = true;
            this.latestInterestingPoint = p;

          }
        }
      }
      if (targetFound) {
        justMove = true;
        console.log(`${owner.name} haistoi jotain`);
      }
    }

    //nothing found
    if (targetFound === false) {
      return;
    }

    await this.moveOrAttack(owner, this.latestInterestingPoint, justMove);
  }

  async moveOrAttack(owner: Actor, target: vec2, justMove: boolean) {
    let dx = target.x - owner.pos.x;
    let dy = target.y - owner.pos.y;
    const stepdx = (dx > 0 ? 1 : -1);
    const stepdy = (dy > 0 ? 1 : -1);

    const distance = float2int(Math.sqrt(dx * dx + dy * dy));
    if (distance >= 2 || justMove) {

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
      //melee attack

      const targetActor = game.getActorFromXY(target);
      if (targetActor && targetActor != owner) {
        await ensure(owner.attacks)[owner.selectedAttack].attack(owner, ensure(targetActor));
      }
    }

  }
}
