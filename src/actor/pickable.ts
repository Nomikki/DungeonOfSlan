import Actor from ".";
import { game } from "..";
import { Equips } from "./equipment";

export class Pickable {
  equipslot: Equips = Equips.None;

  pick(owner: Actor, wearer: Actor): boolean {
    if (wearer.container && wearer.container.add(owner)) {
      game.removeActor(owner);
      return true;
    }

    return false;
  }

  use(owner: Actor, wearer: Actor): boolean {
    if (wearer.container) {
      wearer.container.remove(owner);
      return true;
    }
    return false;
  }

  drop(owner: Actor, wearer: Actor): boolean {
    if (wearer.container) {
      wearer.container.remove(owner);
      game.actors.push(owner);
      game.sendToBack(owner);
      owner.pos.x = wearer.pos.x;
      owner.pos.y = wearer.pos.y;
      return true;
    }
    return false;
  }

  setEquipSlot(slot: Equips) {
    this.equipslot = slot;
  }
}

export class Healer extends Pickable {
  amount: number;
  constructor(amount: number) {
    super();
    this.amount = amount;
  }


  use(owner: Actor, wearer: Actor): boolean {
    if (wearer.destructible) {
      const amountHealed = wearer.destructible.Heal(this.amount);
      if (amountHealed > 0) {
        return super.use(owner, wearer);
      }
    }
    return false;
  }
}


export class LightningBold extends Pickable {
  range: number;
  damage: number;

  constructor(range: number, damage: number) {
    super();
    this.range = range;
    this.damage = damage;
  }


  use(owner: Actor, wearer: Actor): boolean {
    const closestEnemy = game.getClosestEnemy(wearer.pos, this.range);
    if (!closestEnemy) {
      game.log?.addToLog(`Ei yhtään vihollista tarpeeksi lähellä.`, "#999");

      return false;
    }

    game.log?.addToLog(`Salama iskee ja ${closestEnemy.name} ottaa ${this.damage} verran vahinkoa`, "#999");
    closestEnemy.destructible?.TakeDamage(closestEnemy, this.damage);

    return super.use(owner, wearer);

    return true;
  }
}

