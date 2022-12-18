import Actor from ".";
import { game } from "..";

export class Pickable {
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
    //console.log(`${owner.name} used by ${wearer.name}`)
    const closestEnemy = game.getClosestEnemy(wearer.pos, this.range);
    if (!closestEnemy) {
      console.log("No enemy is close enought to strike");
      return false;
    }

    console.log(`A lightning bolt strikes ${closestEnemy.name}`);
    console.log(`The damage is ${this.damage} points.`);
    closestEnemy.destructible?.TakeDamage(closestEnemy, this.damage);

    return super.use(owner, wearer);

    return true;
  }
}

