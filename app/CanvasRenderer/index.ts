import {
  initObjects,
  Grass,
  StoneWall,
  Crate,
  Bomb,
  Professor,
  Orkin,
  Monk,
  Knight,
} from '../DrawingContext/objects';
import { DrawingContext } from '../DrawingContext';
import { CanvasElement } from '../DrawingContext/objects';

interface Renderable {
  graphicalRepresentation: CanvasElement,
}
type Layer = CanvasElement[];

import * as range from 'lodash.range';

const keyPressed = {
  ArrowDown: false,
  ArrowUp: false,
  ArrowLeft: false,
  ArrowRight: false,
};

export class Renderer {
  canRender: Promise<any>;
  context: DrawingContext;
  currentFrame: number = 0;
  layers: Layer[] = [[],[],[],[]];
  fieldSize: number;
  renderables: Renderable[];
  width: number;
  height: number;

  constructor(context: CanvasRenderingContext2D, fieldSize: number) {
    this.canRender = initObjects();
    console.log(context);
    this.context = new DrawingContext(context);
    this.fieldSize = fieldSize;
  }

  start() {
    let start = null;
    this.canRender.then(() => {
      start = new Date();
      let i = 0;
      window.requestAnimationFrame(animationFrame);
    });

    document.addEventListener('keydown', (event) => {
      keyPressed[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
      keyPressed[event.key] = false;
    });

    const animationFrame = () => {
      const end = new Date();
      start = end;
      this.render();
      this.currentFrame += 1;
      requestAnimationFrame(animationFrame);
    }
  }
  render() {
    const speed = 10;
    if (keyPressed.ArrowUp && !keyPressed.ArrowDown) {
      if (this.context.scrollY - speed < 0) this.context.scrollY = 0;
      else this.context.scrollY -= speed;
    }
    else if (keyPressed.ArrowDown && !keyPressed.ArrowUp) {
      if (this.context.scrollY + speed > this.height - window.innerHeight) this.context.scrollY = this.height - window.innerHeight;
      else this.context.scrollY += speed;
    }
    if (keyPressed.ArrowLeft && !keyPressed.ArrowRight) {
      if (this.context.scrollX - speed < 0) this.context.scrollX = 0;
      else this.context.scrollX -= speed;
    }
    else if (keyPressed.ArrowRight && !keyPressed.ArrowLeft) {
      if (this.context.scrollX + speed > this.width - window.innerWidth) this.context.scrollX = this.width - window.innerWidth;
      else this.context.scrollX += speed;
    }
    this.context.clear();
    this.layers.forEach(objects => objects && objects.forEach(object => {
      object.render(this.context, { currentFrame: this.currentFrame });
    }));
    this.context.scrollX -= 80;
    this.context.scrollY -= 80;
    this.renderables.forEach(r => {
      r.graphicalRepresentation.render(this.context, { currentFrame: this.currentFrame });
    });
    this.context.scrollX += 80;
    this.context.scrollY += 80;

  }
  setPlain(width: number, height: number) {
    this.width = (width + 3) * this.fieldSize;
    this.height = (height + 3) * this.fieldSize;
    this.layers[0] = [
      ...range(Math.ceil(height / 2 + 1))
        .reduce((list, row) => list
          .concat(range(Math.ceil(width / 2 + 1))
            .map(col => new Grass(row*160, col*160)),
          ),
        []),
      ...range(width + 3).map(col => new StoneWall(col*this.fieldSize, 0)),
      ...range(height + 3).map(row => new StoneWall(0, row*this.fieldSize)),
      ...range(width + 3).map(col => new StoneWall(col*this.fieldSize, (height+2)*this.fieldSize)),
      ...range(height + 3).map(row => new StoneWall((width+2)*this.fieldSize, row*this.fieldSize)),
    ]
  }
  setElements(renderables: Renderable[]) {
    console.log(renderables);
    this.renderables = renderables;
  }
}


function random(start:number, end:number = 0) {
  return end ?
  Math.floor(Math.random() * (end - start)) + start :
  Math.floor(Math.random() * (start - end)) + end;
}
