const DISTANCE = 60;
const TOTAL = 37;

const effects = [];

for (let i = 0; i < TOTAL; ++i) {
  const effect = {};
  effect.start = i * DISTANCE;
  effect.fade = true;
  effect.effect = [];
  for (let j = 0; j < TOTAL; ++j) {
    const light = {};
    light.colorCode = "#ffff00";
    light.alpha = 0;
    effect.effect.push(light);
  }
  for (let j = 0; j <= i; ++j) {
    effect.effect[j].alpha = 10;
  }
  effects.push(effect);
}

for (let i = 0; i < TOTAL; ++i) {
  const effect = {};
  effect.start = i * DISTANCE + TOTAL * DISTANCE;
  effect.fade = true;
  effect.effect = [];
  for (let j = 0; j < TOTAL; ++j) {
    const light = {};
    light.colorCode = "#ffffff";
    light.alpha = 10;
    effect.effect.push(light);
  }
  for (let j = 0; j <= i; ++j) {
    effect.effect[TOTAL - j - 1].alpha = 0;
  }
  effects.push(effect);
}

console.log(JSON.stringify(effects));
