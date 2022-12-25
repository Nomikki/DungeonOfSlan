import { float2int } from ".";
import vec2 from "./vec2";

class Rectangle {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  GetHalfDimensionX(): number {
    return this.w / 2;
  }

  GetHalfDimensionY(): number {
    return this.h / 2;
  }

  GetCenterX(): number {
    return this.x + this.GetHalfDimensionX();
  }

  GetCenterY(): number {
    return this.y + this.GetHalfDimensionY();
  }

  GetCenter(): vec2 {
    return {x: float2int(this.GetCenterX()), y: float2int(this.GetCenterY())};
    
  }

}

export default Rectangle;
