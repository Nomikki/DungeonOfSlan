import { ensure } from ".";
import { game } from "..";

export class LogText {
  text: string;
  color: string;
  amount: number;

  constructor(text: string, color: string) {
    this.text = text;
    this.color = color;
    this.amount = 1;
  }
}

export class Log {
  texts: LogText[];
  size: number;
  currentSize: number;
  decayTime: number;
  decayTimeMax: number;

  constructor(size: number) {
    this.size = size;
    this.currentSize = this.size;
    this.texts = [];
    this.decayTimeMax = 10;
    this.decayTime = this.decayTimeMax;
  }

  updateDecay() {
    this.decayTime = this.decayTimeMax;
    this.currentSize++;
    if (this.currentSize >= this.size)
      this.currentSize = this.size;
  }

  addToLog(text: string, color: string) {
    if (this.texts.length > 0 && text === this.texts[this.texts.length - 1].text) {
      this.texts[this.texts.length - 1].amount++;
      this.updateDecay();
      return;
    }
    const log = new LogText(text, color);
    this.texts.push(log);

    this.updateDecay();
  }

  render() {
    let a = 0;
    if (this.decayTime < 0) {
      this.currentSize--;
      if (this.currentSize < 0) this.currentSize = 0;
    }
    for (let i = this.texts.length - this.currentSize; i < this.texts.length; i++) {
      if (i >= 0) {
        const id = this.texts.length - a - 1;
        const finalText = this.texts[id].amount === 1 ? this.texts[id].text : this.texts[id].text + ` (${this.texts[id].amount})`;
        game.drawText(finalText, 1, ensure(game.level).height - a, this.texts[id].color);
        a++;
      }
    }
    this.decayTime--;

  }
}