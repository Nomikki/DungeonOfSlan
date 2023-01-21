import monsterJson from "@/data/monsters";
import Actor from "./actor";
import { MonsterAi } from "./actor/ai";
import { Attacker } from "./actor/attacker";
import { Destructible } from "./actor/destructible";
import { ensure } from "./utils";

interface AbilitiesInterface {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
}

interface AttacksInterface {
  name: string;
  damage: string;
  damageType: string;
  abilityBonus: string,
}

interface MonsterInterface {
  name: string;
  size: string;
  type: string;
  movingSpeed: number;
  ch: string;
  color: string;
  hp: number;
  ac: number;
  xp: number;

  abilities: AbilitiesInterface;
  attacks: AttacksInterface[];
}

export const monsters: MonsterInterface[] = monsterJson;

const getMonsterUsingFind = (name: string): MonsterInterface | undefined => {
  return monsters.find(item => item.name === name);
};

export const createMonster = (name: string, x: number, y: number): Actor | undefined => {
  const isMonster = (name: string): boolean => {
    for (const n of monsters) if (n.name === name) return true;
    return false;
  }

  if (isMonster(name)) {
    const monsterTemplate = ensure(getMonsterUsingFind(name));
    const monster = new Actor(monsterTemplate.name, monsterTemplate.ch, monsterTemplate.color);
    monster.pos.x = x;
    monster.pos.y = y;

    monster.ai = new MonsterAi();
    monster.attacks.push(new Attacker(monsterTemplate.attacks[0].damage, 5));
    monster.destructible = new Destructible(monsterTemplate.hp, monsterTemplate.ac, "carcass of " + name);
    return monster;
  }

  return undefined;
};