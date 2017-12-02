import { Player } from '../Game';
import { autorun } from 'mobx';

import * as GraphicsObjects from '../DrawingContext/objects';
import { Renderer as CanvasRenderer } from '../CanvasRenderer';
import * as Game from '../Game';
import { stage0 } from '../stages';


const config = {
  fieldSize: 80,
};

export class CanvasObjectProvider {
  getObjectForElement(element: Game.Element) {
    let representation = null;
    if (element instanceof Game.Wall) representation = new GraphicsObjects.StoneWall(0, 0);
    else if (element instanceof Game.Bomb) representation = new GraphicsObjects.Bomb();
    else if (element instanceof Game.Player) {
      switch (element.character) {
        case 'orkin': representation = new GraphicsObjects.Orkin(45); break;
        case 'knight': representation = new GraphicsObjects.Knight(45); break;
        case 'monk': representation = new GraphicsObjects.Monk(45); break;
        case 'professor': representation = new GraphicsObjects.Professor(45); break;
      }
    }
    else if (element instanceof Game.Crate) representation = new GraphicsObjects.Crate(0, 0);
    else if (element instanceof Game.Fire) representation = null;
    else {
      throw 'Unknown game element';
    }
    representation.setOriginElement(element);
    element.setGraphicalRepresentation(representation);
  }
}

class Centerer {
  width: number;
  height: number;
  renderer: CanvasRenderer;
  playa: Player;

  constructor(width, height, renderer) {
    this.width = width;
    this.height = height;
    this.renderer = renderer;
  }

  centerOnPlayer() {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    let x;
    let y;

    const posX = this.playa.positionX + 80;
    const posY = this.playa.positionY + 80;

    if (posX < screenHeight / 2) {
      x = 0;
    } else if (posX > (this.height - screenHeight / 2)) {
      x = this.height - screenHeight;
    } else {
      x = posX - screenHeight / 2;
    }

    if (posY < screenWidth / 2) {
      y = 0;
    } else if (posY > (this.width - screenWidth / 2)) {
      y = this.width - screenWidth;
    } else {
      y = posY - screenWidth / 2;
    }

    this.renderer.scrollX = x;
    this.renderer.scrollY = y;
  }

  setMainPlaya(playa: Player) {
    this.playa = playa;
    autorun(() => {
      this.centerOnPlayer();
    });
  }
}
export class Bomberman {
  renderer: CanvasRenderer;
  game: Game.Game;

  constructor() {
    const objectProvider = new CanvasObjectProvider();
    const canvas = <HTMLCanvasElement> document.querySelector('#plain');
    this.game = new Game.Game(stage0, config.fieldSize);


    this.renderer = new CanvasRenderer(canvas.getContext('2d'), config.fieldSize, objectProvider);
    this.renderer.setPlain(this.game.map.length, this.game.map[0].length);
    this.renderer.setElements([this.game.elements, this.game.players]);

    const centerer = new Centerer(this.renderer.width, this.renderer.height, this.renderer);
    centerer.setMainPlaya(this.game.getLocalPlayer());
  }

  start() {
    let start = null;
    this.renderer.canRender.then(() => {
      start = new Date();
      let i = 0;
      window.requestAnimationFrame(animationFrame);
    });


    const animationFrame = () => {
      const end = new Date();
      this.game.update(end.getTime() - start.getTime());
      this.renderer.render();
      requestAnimationFrame(animationFrame);
      start = end;
    }

  }
}
