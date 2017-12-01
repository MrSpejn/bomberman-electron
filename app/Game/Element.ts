
import { observable } from 'mobx';

import { Cell } from './Cell';

export class Element {
  cell: Cell;
  graphicalRepresentation: any;
  @observable state;

  getCell(): Cell {
    return this.cell;
  }
  setCell(cell:Cell) {
    this.cell = cell;
  }
  setGraphicalRepresentation(graphicalRepresentation) {
    this.graphicalRepresentation = graphicalRepresentation;
  }
  getGraphicalRepresentation() {
    return this.graphicalRepresentation;
  }
  getPosition() {
    return {
      positionX: this.cell.centerX,
      positionY: this.cell.centerY,
    };
  }
}

export class Wall extends Element {

}

export class Crate extends Element {

}

export class Bomb extends Element {

}

export class Fire extends Element {

}

