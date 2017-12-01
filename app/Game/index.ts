import {
  Cell,
  getElementInCell,
} from './Cell';
import { Element } from './Element';
import { Player } from './Player';
import { LocallyControlled } from './LocallyControlled';


export { Cell } from './Cell';
export {
  Element,
  Wall,
  Crate,
  Bomb,
  Fire,
} from './Element';
export { Player } from './Player';

export class Game {
  map: Cell[][];
  elements: Element[] = [];
  local: LocallyControlled;

  constructor(stage, cellSize) {
    this.loadMap(stage, cellSize);
    const localPlayer = new Player();
    this.local = new LocallyControlled(localPlayer, 500, 500);
    this.elements.push(localPlayer);
  }

  getElements():Element[] {
    return this.elements;
  }

  loadMap(stage, cellSize) {
    this.map = stage.map
    .map((row, rowNumber) =>
      row.map((cell, colNumber) => {
        const cellObj = new Cell(rowNumber, colNumber, cellSize);
        const el = getElementInCell(cell);
        if (el) {
          el.setCell(cellObj);
          this.elements.push(el);
        }
        cellObj.insertElement(el);
        return cellObj;
    }));
  }

  update(timeDiff: number) {
    this.local.update(timeDiff, this);
  }

  getLocalPlayer() {
    return this.local.player;
  }
}
