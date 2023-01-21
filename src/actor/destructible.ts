import { float2int } from "@/utils";
import Actor from ".";
import { game, GameStatus } from "..";

export class Destructible {
  maxHP: number;
  HP: number;
  defense: number;
  corpseName: string;

  constructor(maxHP: number, defense: number, corpseName: string) {
    this.maxHP = maxHP;
    this.HP = maxHP;
    this.defense = defense;
    this.corpseName = corpseName;
  }

  isDead(): boolean {
    return float2int(this.HP) <= 0;
  }

  TakeDamage(owner: Actor, damage: number): number {
    //damage -= this.defense;
    if (damage > 0) {
      this.HP -= damage;
      if (this.HP <= 0) {
        this.Die(owner);
      }
    } else {
      damage = 0;
    }

    return damage;
  }

  Heal(amount: number): number {
    this.HP += amount;
    if (this.HP >= this.maxHP) {
      amount -= this.HP - this.maxHP;
      this.HP = this.maxHP;
    }
    return amount;
  }

  Die(owner: Actor) {
    owner.ch = '%';
    owner.color = "#800000";

    game.log?.addToLog(`${owner.name} kuoli`, "#FFF");

    owner.name = this.corpseName;
    owner.blocks = false;

    game.sendToBack(owner);
  }
}

export class MonsterDestructible extends Destructible {
  constructor(maxHP: number, defense: number, corpseName: string) {
    super(maxHP, defense, corpseName);
  }

  Die(owner: Actor) {
    game.log?.addToLog(`${owner.name} kuoli`, "#999");
    super.Die(owner);
  }
}

export class PlayerDestructible extends Destructible {
  constructor(maxHP: number, defense: number, corpseName: string) {
    super(maxHP, defense, corpseName);
  }

  Die(owner: Actor) {
    game.log?.addToLog(`Sinä kuolit`, "#900");
    game.gamestatus = GameStatus.DEFEAT;
    super.Die(owner);
  }
}


export class ItemDestructible extends Destructible {
  constructor(maxHP: number, defense: number, corpseName: string) {
    super(maxHP, defense, corpseName);
  }

  Die(owner: Actor) {
    game.log?.addToLog(`${owner.name} räjähti!`, "#999");

    super.Die(owner);
  }
}