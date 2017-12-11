import { observable } from 'mobx';
import { Element } from './Element';

export enum Character {
  ORKIN = 'orkin',
  PROFESSOR = 'professor',
  KNIGHT = 'knight',
  MONK = 'monk',
}

export class Player extends Element {
  id: number;
  @observable positionX:number = 0;
  @observable positionY:number = 0;
  width = 25;
  height = 10;
  state = {
    animation: 'stay_front',
  };
  character: Character;

  constructor(id: number, character: Character) {
    super();
    this.character = character;
    this.id = id;
  }

  getPosition() {
    return {
      positionX: this.positionX,
      positionY: this.positionY,
    };
  }
}
