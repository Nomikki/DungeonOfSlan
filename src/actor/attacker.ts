import { random } from "@/level";
import { abilityBonus } from "@/utils";
import Actor from ".";
import { game } from "..";

export class Attacker {
  power: string;
  accuracy: number;


  constructor(power: string, accuracy: number) {
    this.power = power;
    this.accuracy = accuracy;
  }

  async attack(owner: Actor, target: Actor) {
    if (target.destructible && !target.destructible.isDead()) {
      const [dices, eyes] = random.parseDice(this.power);
      const accuracyDice = random.dice(1, 20);
      const accBonus = abilityBonus(this.accuracy);
      const currentAccuracy = accuracyDice + accBonus;
      const critical = accuracyDice === 20 ? true : false;

      const currentPower = !critical ? random.dice(dices, eyes) : (eyes * dices);
      let logText = "";
      let battleLog = "";

      const sign = (s: number) => {
        return s >= 0 ? '+' : '';
      };

      if (critical) {
        game.log?.addToLog(`CRITICAL!`, "#00FF40");
      }
      //

      const ishitting = (currentAccuracy >= target.destructible.defense || critical) ? true : false;

      if (ishitting) {
        logText = `${owner.name} hyökkää. ${target.name} ottaa ${currentPower} vahinkoa`;
        if (critical) {
          battleLog = `CRITICAL: (${this.power}: ${currentPower})`;
        } else {
          battleLog = `(1d20${sign(accBonus)}${accBonus}: ${currentAccuracy} vs ${target.destructible.defense}) (${this.power}: ${currentPower})`;
        }
      } else {
        logText = `${owner.name} hyökkää, mutta ${target.name} väistää iskun.`
        battleLog = `(1d20${sign(accBonus)}: ${currentAccuracy} vs ${target.destructible.defense})`;
      }

      game.log?.addToLog(logText, "#FFF");
      game.log?.addToLog(battleLog, "#AAA");
      target.destructible.TakeDamage(target, ishitting ? currentPower : 0);
    }
  }
}