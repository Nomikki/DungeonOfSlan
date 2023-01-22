import { abilityBonus, ensure } from "@/utils";
import Actor from ".";

export enum Equips {
  None,
  Hand1,
  Hand2,
  TwoHand,
  Neck,
  Helmet,
  Body,
  Legs,
  Foots,
  Hands,
  EquipLen,
}


export class Equipment {
  equipments: Actor[] | undefined[];

  constructor() {
    this.equipments = new Array(Equips.EquipLen);
  }

  equip(owner: Actor, actor: Actor, equipSlot: Equips): boolean {
    if (this.equipments[equipSlot] !== undefined) {
      /*
      const tempActor = this.takeOff(owner, actor);
      if (tempActor !== undefined) {
        owner.container?.add(tempActor);
      }
      */
      return false;
    }
    this.equipments[equipSlot] = actor;
    owner.container?.remove(actor);

    return true;
  }

  takeOff(owner: Actor, actor: Actor): Actor | undefined {

    if (ensure(owner.container)?.inventory.length <= ensure(owner.container)?.size) {
      for (let i = 0; i < this.equipments.length; i++) {
        if (this.equipments[i] === actor) {
          const tempActor = this.equipments[i];
          this.equipments[i] = undefined;
          return tempActor;
        }
      }
    }
    return undefined;
  }

  calculateAC(owner: Actor): number {
    let amount = 0;
    for (let i = 0; i < this.equipments.length; i++) {
      if (this.equipments[i]) {

        let abiBonus = 0;

        if (ensure(this.equipments[i]).ac_bonus === "dex") abiBonus = ensure(owner.destructible)?.abilities.dex;
        abiBonus = abilityBonus(abiBonus);

        amount += ensure(this.equipments[i])?.ac + abiBonus;
      }
    }
    if (amount === 0) amount = 10;

    return amount;
  }

}