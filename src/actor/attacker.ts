import Actor from ".";
import { game } from "..";

export class Attacker {
  power: number;

  constructor(power: number) {
    this.power = power;
  }

  attack(owner: Actor, target: Actor) {
    if (target.destructible && !target.destructible.isDead()) {
      if (this.power - target.destructible.defense > 0) {
        game.log?.addToLog(`${owner.name} hyökkää. ${target.name} ottaa ${this.power} vahinkoa`, "#999");
      } else {
        game.log?.addToLog(`${owner.name} hyökkää, mutta ${target.name} väistää iskun.`, "#999");
      }
      target.destructible.TakeDamage(target, this.power);
    }
  }
}