import Actor from "@/actor";
import { Equips } from "@/actor/equipment";
import { Pickable } from "@/actor/pickable";
import itemJson from "@/data/items";
import { ensure } from "@/utils";

interface ItemInterface {
  name: string,
  ch: string,
  color: string,
  effect: string,
  type: string,
  weight: number,
  properties: string,
}

export const items: ItemInterface[] = itemJson;

const getItemUsingFind = (name: string): ItemInterface | undefined => {
  return items.find(item => item.name === name);
};

export const createItem = (name: string, x: number, y: number): Actor | undefined => {
  const isItem = (name: string): boolean => {
    for (const n of items) if (n.name === name) return true;
    return false;
  }

  if (isItem(name)) {
    const itemTemplate = ensure(getItemUsingFind(name));
    const item = new Actor(itemTemplate.name, itemTemplate.ch, itemTemplate.color);

    item.weight = itemTemplate.weight;
    item.pos.x = x;
    item.pos.y = y;

    const itemType = itemTemplate.type.split(';');
    //console.log("type: ", itemType);

    for (let i = 0; i < itemType.length; i++) {
      if (itemType[i] === "armor:dex") {
        item.pickable = new Pickable();
        item.ac = parseInt(itemTemplate.effect);
        item.pickable.setEquipSlot(Equips.Body);
        item.pickable.canUse = false;
        item.ac_bonus = "dex";
      }
    }


    return item;
  }

  return undefined;
};