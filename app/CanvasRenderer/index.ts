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
import { CanvasObjectProvider } from './CanvasObjectProvider';

export interface Renderable {
  graphicalRepresentation: CanvasElement,
}
type Layer = CanvasElement[];

import * as range from 'lodash.range';



export class Renderer {
  canRender: Promise<any>;
  objectProvider: CanvasObjectProvider;
  context: DrawingContext;
  currentFrame: number = 0;
  layers: Layer[] = [[],[],[],[]];
  fieldSize: number;
  renderables: Renderable[][];
  width: number;
  height: number;
  scrollX: number = 0;
  scrollY: number = 0;

  constructor(context: CanvasRenderingContext2D, fieldSize: number, objectProvider: CanvasObjectProvider) {
    this.canRender = initObjects();
    this.objectProvider = objectProvider;
    this.context = new DrawingContext(context);
    this.fieldSize = fieldSize;
  }

  render(currentTime: number, timeDiff: number) {
    this.context.scrollX = this.scrollX;
    this.context.scrollY = this.scrollY;
    this.context.clear();
    this.layers.forEach(objects => objects && objects.forEach(object => {
      object.render(this.context, { currentTime, timeDiff });
    }));
    this.context.scrollX -= 80;
    this.context.scrollY -= 80;
    this.renderables.forEach((layer, idx) => {

      if (idx == 4) {
        layer.forEach(r => {
          if (!r.graphicalRepresentation) {
            this.objectProvider.getObjectForElement(r);
          }
        });
        layer.sort((a, b) => {
          return a.graphicalRepresentation.getPosition().y - b.graphicalRepresentation.getPosition().y;
        });
        layer.forEach(r => {
          r.graphicalRepresentation.render(this.context, { currentTime, timeDiff });
        });
        return;
      }
      layer.forEach(r => {
        if (!r.graphicalRepresentation) {
          this.objectProvider.getObjectForElement(r);
        }
        r.graphicalRepresentation.render(this.context, { currentTime, timeDiff });
      });
    });
    this.context.scrollX += 80;
    this.context.scrollY += 80;

    this.currentFrame += 1;
  }

  setPlain(width: number, height: number) {
    this.width = (width + 2) * this.fieldSize;
    this.height = (height + 2) * this.fieldSize;
    this.layers[0] = [
      ...range(Math.ceil(height / 2 + 1))
        .reduce((list, row) => list
          .concat(range(Math.ceil(width / 2 + 1))
            .map(col => new Grass(row*160, col*160)),
          ),
        []),
      ...range(width + 2).map(col => new StoneWall(col*this.fieldSize, 0)),
      ...range(height + 2).map(row => new StoneWall(0, row*this.fieldSize)),
      ...range(width + 2).map(col => new StoneWall(col*this.fieldSize, (height+1)*this.fieldSize)),
      ...range(height + 2).map(row => new StoneWall((width+1)*this.fieldSize, row*this.fieldSize)),
    ]
  }

  setElements(renderables: Renderable[][]) {
    this.renderables = renderables;
  }
}


function random(start:number, end:number = 0) {
  return end ?
  Math.floor(Math.random() * (end - start)) + start :
  Math.floor(Math.random() * (start - end)) + end;
}
