export const ensure = <T>(
  argument: T | undefined | null,
  message = "This value was promised to be there.",
): T => {
  if (argument === undefined || argument === null) {
    throw new TypeError(message);
  }

  return argument;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

export const float2int = (value: number): number => {
  return value >> 0;
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const abilityBonus = (ability: number): number => {
  return Math.floor((ability - 10) / 2);
};