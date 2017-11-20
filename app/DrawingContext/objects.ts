import { Animation } from './animation';
import { Element } from '../Game';
import { DrawingContext } from '.';

let images = {

};

export function initObjects():Promise<any> {
  const bomb = new Image(240, 320);
  bomb.src = '../images/bomb.png';

  const grass = new Image(160, 160);
  grass.src = '../images/grass.jpg';

  const stone_wall = new Image(80, 80);
  stone_wall.src = '../images/stone.png';

  const crate = new Image(80, 80);
  crate.src = '../images/crate.png';

  const professor = new Image(576, 256);
  professor.src = '../images/professor.png';

  const orkin = new Image(576, 256);
  orkin.src = '../images/orkin.png';

  const monk = new Image(576, 256);
  monk.src = '../images/monk.png';

  const knight = new Image(576, 256);
  knight.src = '../images/knight.png';

  images = {
    grass,
    crate,
    stone_wall,
    bomb,
    professor,
    orkin,
    monk,
    knight,
  }

  return Promise.all([
    (resolve) => grass.onload = () => resolve(),
    (resolve) => crate.onload = () => resolve(),
    (resolve) => stone_wall.onload = () => resolve(),
    (resolve) => bomb.onload = () => resolve(),
    (resolve) => professor.onload = () => resolve(),
    (resolve) => orkin.onload = () => resolve(),
    (resolve) => monk.onload = () => resolve(),
    (resolve) => knight.onload = () => resolve(),
  ]);
}

export abstract class CanvasElement {
  image: HTMLImageElement;
  origin: Element;
  offsetX: number;
  offsetY: number;

  constructor(offsetX: number = 0, offsetY: number = 0) {
    this.offsetX = offsetX;
    this.offsetY = offsetY;
  }

  setOriginElement(origin) {
    this.origin = origin;
  }

  getPosition() {
    if (!this.origin) {
      return {
        x: this.offsetX,
        y: this.offsetY,
      };
    }

    const {
      positionX: offsetX,
      positionY: offsetY,
    } = this.origin.getPosition();
    return {
      x: offsetX + this.offsetX - 40,
      y: offsetY + this.offsetX - 40,
    };
  }
  abstract render(context: DrawingContext, state?: Object): void
}


export class Grass extends CanvasElement {
  constructor(offsetX:number, offsetY:number) {
    super(offsetX, offsetY);
    this.image = images.grass;
  }
  render(context: DrawingContext) {
    const position = this.getPosition();
    context.drawImage(this.image, position.x, position.y, 160, 160);
  }
}

export class StoneWall extends CanvasElement {
  constructor(offsetX:number, offsetY:number) {
    super(offsetX, offsetY);
    this.image = images.stone_wall;
  }
  render(context: DrawingContext) {
    const position = this.getPosition();
    context.drawImage(this.image, position.x, position.y, 80, 80);
  }
}

export class Crate extends CanvasElement {
  constructor(offsetX:number, offsetY:number) {
    super(offsetX, offsetY);
    this.image = images.crate;
  }
  render(context: DrawingContext) {
    const position = this.getPosition();
    context.drawImage(this.image, position.x, position.y, 80, 80);
  }
}

class Character extends CanvasElement {
  spriteX: number;
  spriteY: number;
  step: number;
  animationCounter: number;
  animationStart: number;
  duration: number;
  isStatic: boolean;
  size: number;

  constructor(offsetX:number, offsetY:number, animationDuration: number) {
    super(offsetX, offsetY-40);
    this.size = 80;
    this.spriteX = 64;
    this.spriteY = 0;
    this.step = animationDuration / 8;
    this.duration = animationDuration;
    this.animationCounter = 0;
    this.isStatic = true;

    const random = Math.floor(Math.random() * 4) + 4;
    switch(random) {
      case 0: this.changeAnimation('stay_back'); break;
      case 1: this.changeAnimation('stay_left'); break;
      case 2: this.changeAnimation('stay_front'); break;
      case 3: this.changeAnimation('stay_right'); break;
      case 4: this.changeAnimation('walk_back'); break;
      case 5: this.changeAnimation('walk_left'); break;
      case 6: this.changeAnimation('walk_front'); break;
      default: this.changeAnimation('walk_right');
    }
  }

  changeAnimation(animation:string) {
    const [activity, direction] = animation.split('_');
    switch(direction) {
      case 'left': this.spriteY = 64; break;
      case 'right': this.spriteY = 192; break;
      case 'front': this.spriteY = 128; break;
      case 'back': this.spriteY = 0; break;
      default: this.spriteY = 0;
    }

    this.isStatic = activity == 'stay';
    this.animationCounter = 0;


  }

  render(context: DrawingContext, state: { currentFrame: number }) {
    const position = this.getPosition();
    if (this.isStatic) {
      return context.drawImage(this.image, 0, this.spriteY, 64, 64, position.x, position.y, this.size, this.size);
    }
    this.animationCounter = this.animationCounter + 1;
    const stage = Math.ceil((this.animationCounter % this.duration) / this.step);
    this.spriteX = stage * 64;
    context.drawImage(this.image, this.spriteX, this.spriteY, 64, 64, position.x, position.y, this.size, this.size);
  }
}

export class Professor extends Character {
  constructor(animationDuration: number) {
    super(-10, -10, animationDuration);
    this.size = 100;
    this.image = images.professor;
  }
  setGra
}

export class Orkin extends Character {
  constructor(animationDuration: number) {
    super(-20, -20, animationDuration);
    this.image = images.orkin;
    this.size = 120;
  }
}

export class Monk extends Character {
  constructor(animationDuration: number) {
    super(-10, -10, animationDuration);
    this.size = 100;
    this.image = images.monk;
  }
}

export class Knight extends Character {
  constructor(animationDuration: number) {
    super(-10, -10, animationDuration);
    this.size = 100;
    this.image = images.knight;
  }
}




export class Bomb extends CanvasElement {
  spriteX: number;
  spriteY: number;
  animation: Animation;
  constructor() {
    super(-10, -10);
    this.image = images.bomb;
    this.spriteX = Math.floor(Math.random() * 3) * 80;
    this.animation = new Animation({
      duration: 3000 / 60,
      frames: [
        {
          breakpoint: 0,
          properties: {
            offsetX: 0,
            offsetY: 0,
          },
        },
        {
          breakpoint: 33,
          properties: {
            offsetX: 2,
            offsetY: 0,
          },
        },
        {
          breakpoint: 66,
          properties: {
            offsetX: 0,
            offsetY: 2,
          },
        },
        {
          breakpoint: 100,
          properties: {
            offsetX: 0,
            offsetY: 0,
          },
        },
      ],
    });
  }

  render(context: DrawingContext, state: { currentFrame: number }) {
    let offsetX, offsetY;
    const position = this.getPosition();

    if (!this.animation.playing) {
      this.animation.startAnimation(state.currentFrame);
      offsetX = position.x;
      offsetY = position.y;
    } else {
      const props = this.animation.animate(state.currentFrame, {
        offsetX: position.x,
        offsetY: position.y,
      });
      offsetX = props.offsetX;
      offsetY = props.offsetY;
    }

    context.drawImage(this.image, 0, 0, 80, 80, offsetX, offsetY, 100, 100);
  }
}

class Player extends CanvasElement {
  render(context: DrawingContext, state: Object) {

  }
}
