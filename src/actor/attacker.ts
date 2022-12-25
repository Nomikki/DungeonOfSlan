import { random } from "@/level";
import Actor from ".";
import { game } from "..";

export class Attacker {
  power: number;

  constructor(power: number) {
    this.power = power;
  }

  async attack(owner: Actor, target: Actor) {
    if (target.destructible && !target.destructible.isDead()) {
      const currentPower = random.getInt(0, this.power);

      if (currentPower - target.destructible.defense > 0) {
        game.log?.addToLog(`${owner.name} hyökkää. ${target.name} ottaa ${currentPower} vahinkoa`, "#FFF");
      } else {
        game.log?.addToLog(`${owner.name} hyökkää, mutta ${target.name} väistää iskun.`, "#AAA");
      }
      target.destructible.TakeDamage(target, currentPower);
    }
  }
}