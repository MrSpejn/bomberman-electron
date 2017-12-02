import {
  Cell,
  getElementInCell,
} from './Cell';
import {
  Element,
  Bomb,
} from './Element';
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
  players: Player[] = [];
  local: LocallyControlled;

  constructor(stage, cellSize) {
    this.loadMap(stage, cellSize);
    const localPlayer = new Player();
    this.local = new LocallyControlled(localPlayer, 500, 500, this);
    this.players.push(localPlayer);
  }

  getElements():Element[] {
    return this.elements;
  }

  getPlayers():Player[] {
    return this.players;
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

  placeBomb(posX, posY) {
    const size = this.map[0][0].cellSize;
    const crow = Math.floor(posY / size);
    const ccol = Math.floor(posX / size);

    console.log(ccol, crow, posX, posY);
    const bomb = new Bomb();
    console.log(this.map[crow][ccol].getInsertedElement());
    if (this.map[crow][ccol].getInsertedElement()) {
      return;
    }
    bomb.setCell(this.map[crow][ccol]);
    this.elements.push(bomb);
    this.map[crow][ccol].insertElement(bomb);
  }

  getLocalPlayer() {
    return this.local.player;
  }
}
