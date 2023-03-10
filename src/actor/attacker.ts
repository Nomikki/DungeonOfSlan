import { random } from "@/level";
import { abilityBonus, ensure, float2int, rgbToHex, sign, sleep } from "@/utils";
import Actor from ".";
import { game } from "..";

export class Attacker {
  power: string;
  abilityType: string;


  constructor(power: string, abilityType: string) {
    this.power = power;
    this.abilityType = abilityType;
  }

  async getAbilityValueFrom(owner: Actor, abilityType: string): Promise<number> {
    //console.log("ability type: " + abilityType);
    if (abilityType === "dex") return ensure(owner.destructible).abilities.dex;
    if (abilityType === "con") return ensure(owner.destructible).abilities.con;
    if (abilityType === "str") return ensure(owner.destructible).abilities.str;
    if (abilityType === "int") return ensure(owner.destructible).abilities.int;
    if (abilityType === "wis") return ensure(owner.destructible).abilities.wis;
    return 0;
  }

  async attack(owner: Actor, target: Actor) {
    if (target.destructible && !target.destructible.isDead()) {
      const [dices, eyes] = random.parseDice(this.power);
      const accuracyDice = random.dice(1, 20);

      const accBonus = abilityBonus(await this.getAbilityValueFrom(owner, this.abilityType));
      //console.log(accBonus);

      const currentAccuracy = accuracyDice + accBonus;
      const critical = accuracyDice === 20 ? true : false;

      const currentPower = !critical ? (random.dice(dices, eyes) + accBonus) : (eyes * dices) + accBonus;
      let logText = "";
      let battleLog = "";

      if (critical) {
        game.log?.addToLog(`CRITICAL!`, "#00FF40");
      }
      //

      const ishitting = (currentAccuracy >= target.ac || critical) ? true : false;

      if (ishitting) {
        logText = `${owner.name} hyökkää. ${target.name} ottaa ${currentPower} vahinkoa`;
        if (critical) {
          battleLog = `CRITICAL: (${this.power}${sign(accBonus)}${accBonus}: ${currentPower})`;
        } else {
          battleLog = `(1d20${sign(accBonus)}${accBonus}: ${currentAccuracy} vs ${target.ac}) (${this.power}${sign(accBonus)}${accBonus}: ${currentPower})`;
        }
      } else {
        logText = `${owner.name} hyökkää, mutta ${target.name} väistää iskun.`
        battleLog = `(1d20${sign(accBonus)}${accBonus}: ${currentAccuracy} vs ${target.ac})`;
      }

      game.log?.addToLog(logText, "#FFF");
      game.log?.addToLog(battleLog, "#AAA");
      target.destructible.TakeDamage(target, ishitting ? currentPower : 0);

      //not the prettiest critical particle nönnönnöö system
      if (critical) {
        const sizeOfEffect = 25;
        for (let i = 0; i < sizeOfEffect; i++) {
          const step = float2int(255 / sizeOfEffect);
          game.render();
          game.drawCircle(target.pos.x - ensure(game.camera).x, target.pos.y - ensure(game.camera).y, 1 + i, rgbToHex(0, 255 - i * step, 255 - i * step), 8);
          await sleep(16);
        }
      }

    }
  }
}