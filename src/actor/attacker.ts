import Actor from ".";

export class Attacker {
  power: number;

  constructor(power: number) {
    this.power = power;
  }

  attack(owner: Actor, target: Actor) {
    if (target.destructible && !target.destructible.isDead()) {
      if (this.power - target.destructible.defense > 0) {
        console.log(`${owner.name} attacks ${target.name} for ${this.power} points.`);
      } else {
        console.log(`${owner.name} attacks ${target.name} but it has no effect.`);
      }
      target.destructible.TakeDamage(target, this.power);
    }
  }
}