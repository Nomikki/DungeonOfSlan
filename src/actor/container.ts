import Actor from ".";

export class Container {
  size: number;
  inventory: Actor[];

  constructor(size: number) {
    this.size = size;
    this.inventory = [];
  }

  add(actor: Actor): boolean {
    if (this.inventory.length >= this.size)
      return false;

    this.inventory.push(actor);

    return true;
  }

  remove(actor: Actor): boolean {
    for (let i = 0; i < this.inventory.length; i++) {
      if (this.inventory[i] === actor) {
        this.inventory.splice(i, 1);
        return true;
      }
    }
    return false;
  }
}