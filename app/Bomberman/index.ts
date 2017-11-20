import * as GraphicsObjects from '../DrawingContext/objects';
import { Renderer as CanvasRenderer } from '../CanvasRenderer';
import * as Game from '../Game';
import { stage0 } from '../stages';


const config = {
  fieldSize: 80,
};


class CanvasObjectProvider {
  getObjectForElement(element: Game.Element) {
    let representation = null;
    if (element instanceof Game.Wall) representation = new GraphicsObjects.StoneWall(0, 0);
    else if (element instanceof Game.Bomb) representation = new GraphicsObjects.Bomb();
    else if (element instanceof Game.Player) representation = new GraphicsObjects.Professor(45);
    else if (element instanceof Game.Crate) representation = new GraphicsObjects.Crate(0, 0);
    else if (element instanceof Game.Fire) representation = null;
    else {
      throw 'Unknown game element';
    }
    representation.setOriginElement(element);
    element.setGraphicalRepresentation(representation);
  }
}

export class Bomberman {
  renderer: CanvasRenderer;
  game: Game.Game;

  constructor() {
    const objectProvider = new CanvasObjectProvider();
    const canvas = <HTMLCanvasElement> document.querySelector('#plain');
    this.game = new Game.Game(stage0, config.fieldSize);
    this.renderer = new CanvasRenderer(canvas.getContext('2d'), config.fieldSize);
    this.renderer.setPlain(this.game.map.length, this.game.map[0].length);
    this.game.elements.forEach(e => objectProvider.getObjectForElement(e));
    this.renderer.setElements(this.game.elements);


  }

  start() {
    this.game.start();
    this.renderer.start();
  }
}
