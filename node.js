function range(length) {
  return new Array(length).fill(undefined);
}

function random(end) {
  return Math.floor(Math.random() * end);
}

result = range(25).map(() => range(25).map(() => 0));

range(300).forEach(() => result[random(25)][random(25)] = 1);
range(170).forEach(() => result[random(25)][random(25)] = 2);
range(50).forEach(() => result[random(25)][random(25)] = 3);
console.log(result);
