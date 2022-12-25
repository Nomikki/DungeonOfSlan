import { random } from "@/level";
import Actor from ".";
import { game } from "..";

export class Attacker {
  power: number;
  accuracy: number;

  constructor(power: number, accuracy: number) {
    this.power = power;
    this.accuracy = accuracy;
  }

  async attack(owner: Actor, target: Actor) {
    if (target.destructible && !target.destructible.isDead()) {
      const currentPower = random.getInt(1, this.power);
      const currentAccuracy = random.getInt(1, 20 + this.accuracy);

      game.log?.addToLog(`acc: ${currentAccuracy}`, "#FFF");
      if (currentAccuracy >= target.destructible.defense) {
        game.log?.addToLog(`${owner.name} hyökkää. ${target.name} ottaa ${currentPower} vahinkoa`, "#FFF");
      } else {
        game.log?.addToLog(`${owner.name} hyökkää, mutta ${target.name} väistää iskun.`, "#AAA");
      }
      target.destructible.TakeDamage(target, currentPower);
    }
  }
}