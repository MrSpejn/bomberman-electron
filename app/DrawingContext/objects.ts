import { autorun } from 'mobx';

import { Animation } from './animation';
import { Element, Player } from '../Game';
import { DrawingContext } from '.';
import { GamePlayer } from '../Store/AppStore';


interface Images {
  grass?: HTMLImageElement;
  crate?: HTMLImageElement;
  destroyed_crate?: HTMLImageElement;
  stone_wall?: HTMLImageElement;
  bomb?: HTMLImageElement;
  professor?: HTMLImageElement;
  orkin?: HTMLImageElement;
  monk?: HTMLImageElement;
  knight?: HTMLImageElement;
  fire?: HTMLImageElement;
}

let images: Images = {};

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

  const fire = new Image(512, 512);
  fire.src = '../images/explosion.png';

  const destroyed_crate = new Image(120, 120);
  destroyed_crate.src = '../images/debris.png';

  images = {
    grass,
    crate,
    stone_wall,
    bomb,
    professor,
    orkin,
    monk,
    knight,
    fire,
    destroyed_crate,
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
    (resolve) => fire.onload = () => resolve(),
  ]);
}

export abstract class CanvasElement {
  image: HTMLImageElement;
  origin: Element;
  offsetX: number;
  offsetY: number;
  size: number;

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
      y: offsetY + this.offsetY - 40,
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

export class DestroyedCrate extends CanvasElement {
  constructor(offsetX:number, offsetY:number) {
    super(offsetX, offsetY);
    this.image = images.destroyed_crate;
  }
  render(context: DrawingContext) {
    const position = this.getPosition();
    context.drawImage(this.image, position.x - 20, position.y - 20, 120, 120);
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


export class Fire extends CanvasElement {
  spriteX: number;
  spriteY: number;
  steps: number[];
  animationCounter: number;
  animationStart: number;
  duration: number;
  size: number;
  state: number;

  constructor(offsetX:number, offsetY:number, animationDuration: number) {
    super(offsetX, offsetY);
    this.image = images.fire;
    this.size = 120;
    this.spriteX = 0;
    this.spriteY = 0;
    this.state = 0;
    const unit = 50;
    this.steps = [
      unit,
      unit,
      unit,
      unit,
      animationDuration - 5*unit,
      unit,
      unit,
      unit,
      unit,
      unit,
      unit,
      unit,
      unit,
      unit,
    ];
    this.duration = animationDuration + 9 * unit;
    this.animationCounter = 0;
  }

  newState() {
    let sum = 0;
    for (let i = 0; i < this.steps.length; i++) {
      sum += this.steps[i];
      if (this.animationCounter < sum) {
        return i;
      }
    }
  }
  nextStep() {
    this.animationCounter = this.animationCounter % this.duration;
    const state = this.newState();
    if (state === this.state) return;
    else {
      this.spriteY = 128 * Math.floor(state / 4);
      this.spriteX = 128 * (state % 4);
    }
  }

  render(context: DrawingContext, state: { timeDiff: number }) {
    const position = this.getPosition();
    this.animationCounter = this.animationCounter + state.timeDiff;
    this.nextStep();
    return context.drawImage(this.image, this.spriteX, this.spriteY, 128, 128, position.x - 20, position.y - 20, this.size, this.size);

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
  overlayCounter: number = 0;
  overlayColor: string = null;
  overlayTiming: number = 1000;

  constructor(offsetX:number, offsetY:number, animationDuration: number) {
    super(offsetX, offsetY - 40);
    this.size = 80;
    this.step = animationDuration / 8;
    this.duration = animationDuration;
    this.animationCounter = 0;
    this.isStatic = true;
  }

  setOriginElement(origin) {
    this.origin = origin;
    autorun(() => {
      this.changeAnimation(origin.state.animation);
    });
    autorun(() => {
      this.changeOvelayEffect(origin.gameState);
    });
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

  changeOvelayEffect(gameState: GamePlayer) {
    if (!gameState.isAlive) {
      this.animationCounter = 0;
      this.spriteY = 256;
      this.isStatic = false;
      return;
    }

    if (gameState.isProtected) {
      this.overlayCounter = 0;
      this.overlayColor = '#ffffff';
      this.overlayTiming = 400;
    } else {
      this.overlayColor = null;
    }
  }

  render(context: DrawingContext, state: { timeDiff: number }) {
    const position = this.getPosition();
    if (this.overlayColor) {
      this.overlayCounter = this.overlayCounter + state.timeDiff;
    }
    if ((<Player>this.origin).gameState.isAlive && this.isStatic) {
      this.draw(context, 0);
      return;
    }
    this.animationCounter = this.animationCounter + state.timeDiff;

    if (!(<Player>this.origin).gameState.isAlive) {
      const stage = Math.ceil(this.animationCounter / 200) > 6 ? 6 : Math.ceil(this.animationCounter / 200);
      this.spriteX = stage * 64;
      context.drawImage(this.image, this.spriteX , this.spriteY, 64, 64, position.x, position.y, this.size, this.size);
      return;
    }

    const stage = Math.ceil((this.animationCounter % this.duration) / this.step);
    this.spriteX = stage * 64;
    this.draw(context, this.spriteX);
  }

  draw(context: DrawingContext, x: number) {
    const position = this.getPosition();
    if (this.overlayColor) {
      const stage = Math.floor((this.overlayCounter % this.overlayTiming) / (this.overlayTiming / 2));

      if (stage !== 0) {
        context.drawImage(this.image, x, this.spriteY, 64, 64, position.x, position.y, this.size, this.size);
      }
    } else {
      context.drawImage(this.image, x, this.spriteY, 64, 64, position.x, position.y, this.size, this.size);
    }


  }
}

export class Professor extends Character {
  constructor(animationDuration: number) {
    super(-10, -10, animationDuration);
    this.size = 100;
    this.image = images.professor;
  }
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
      duration: 3000,
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

  render(context: DrawingContext, state: { currentTime: number }) {
    let offsetX, offsetY;
    const position = this.getPosition();

    if (!this.animation.playing) {
      this.animation.startAnimation(state.currentTime);
      offsetX = position.x;
      offsetY = position.y;
    } else {
      const props = this.animation.animate(state.currentTime, {
        offsetX: position.x,
        offsetY: position.y,
      });
      offsetX = props.offsetX;
      offsetY = props.offsetY;
    }

    context.drawImage(this.image, 0, 0, 80, 80, offsetX, offsetY, 100, 100);
  }
}
