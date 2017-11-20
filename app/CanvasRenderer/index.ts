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

import * as range from 'lodash.range';

export class Renderer {
  canRender: Promise<any>;
  constructor() {
    this.canRender = initObjects();
  }
  start() {
    const canvas = <HTMLCanvasElement> document.querySelector('#plain');
    const ctx = canvas.getContext('2d');
    const drawingContext = new DrawingContext(ctx);


    const backgroundLayer = [
      ...range(13)
        .reduce((list, row) => list
          .concat(range(13)
            .map(col => new Grass(row*160, col*160)),
          ),
        []),
      ...range(25).map(col => new StoneWall(col*80, 0)),
      ...range(25).map(row => new StoneWall(0, row*80)),
      ...range(25).map(col => new StoneWall(col*80, 24*80)),
      ...range(25).map(row => new StoneWall(24*80, row*80)),
    ];



    let start;
    const env = [
      ...range(50).map(() => new StoneWall(random(1, 13)*80, random(1, 13)*80)),
      ...range(50).map(() => new Crate(random(1, 13)*80, random(1, 13)*80)),
    ];

    const chars = [
      ...range(5).map(() => new Professor(random(1, 12)*80, random(1, 12)*80, 45)),
      ...range(5).map(() => new Orkin(random(1, 12)*80, random(1, 12)*80, 45)),
      ...range(5).map(() => new Monk(random(1, 12)*80, random(1, 12)*80, 45)),
      ...range(5).map(() => new Knight(random(1, 12)*80, random(1, 12)*80, 45)),
    ];

    this.canRender.then(() => {
      start = new Date();
      drawingContext.layers = [backgroundLayer, env, [], chars];
      let i = 0;
      const t = range(40).map(() => new Bomb(random(1, 13)*80, random(1, 13)*80));
      const w = setInterval(() => {
        drawingContext.layers[2].push(t[i]);
        i++;
        if (i == 40) {
          clearInterval(w);
        }
      }, 50);

      window.requestAnimationFrame(animationFrame)
    });

    function animationFrame() {
      const end = new Date();
      start = end;
      drawingContext.render();
      requestAnimationFrame(animationFrame);
    }



  }
}


function random(start:number, end:number = 0) {
  return end ?
  Math.floor(Math.random() * (end - start)) + start :
  Math.floor(Math.random() * (start - end)) + end;
}
