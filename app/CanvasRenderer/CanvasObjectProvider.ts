import * as GraphicsObjects from '../DrawingContext/objects';
import * as Game from '../Game';

export class CanvasObjectProvider {
  getObjectForElement(element: Game.Element) {
    let representation = null;
    if (element instanceof Game.Wall) representation = new GraphicsObjects.StoneWall(0, 0);
    else if (element instanceof Game.Bomb) representation = new GraphicsObjects.Bomb();
    else if (element instanceof Game.Player) {
      switch (element.character) {
        case 'orkin': representation = new GraphicsObjects.Orkin(750); break;
        case 'knight': representation = new GraphicsObjects.Knight(750); break;
        case 'monk': representation = new GraphicsObjects.Monk(750); break;
        case 'professor': representation = new GraphicsObjects.Professor(750); break;
      }
    }
    else if (element instanceof Game.Crate) representation = new GraphicsObjects.Crate(0, 0);
    else if (element instanceof Game.Debris) representation = new GraphicsObjects.DestroyedCrate(0, 0);

    else if (element instanceof Game.Fire) representation = new GraphicsObjects.Fire(0, 0, (<Game.Fire>element).activeTime);
    else {
      throw 'Unknown game element';
    }
    representation.setOriginElement(element);
    element.setGraphicalRepresentation(representation);
  }
}
