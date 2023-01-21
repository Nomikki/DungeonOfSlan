export default [
  {
    name: "kobold",
    size: "small",
    type: "humanoid",
    movingSpeed: 1,

    ch: "k",
    color: "#C07000",
    hp: 5,
    ac: 12,
    xp: 25,

    abilities: {
      str: 7,
      dex: 15,
      con: 9,
      int: 8,
      wis: 7,
    },

    attacks: [
      {
        name: "dagger",
        damage: "1d4",
        damageType: "piercing",
        abilityBonus: "dex",
      }
    ]
  },
  {
    name: "rat",
    size: "tiny",
    type: "beast",
    movingSpeed: 1.5,

    ch: "r",
    color: "#808080",
    hp: 6,
    ac: 10,
    xp: 5,

    abilities: {
      str: 2,
      dex: 11,
      con: 9,
      int: 2,
      wis: 10,
    },

    attacks: [
      {
        name: "bite",
        damage: "1d1",
        damageType: "piercing",
        abilityBonus: "dex",
      }
    ]
  }

]