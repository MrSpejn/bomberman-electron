import { observable } from 'mobx';
import { Element } from './Element';
import { GamePlayer } from '../Store/AppStore';
import { autorun } from 'mobx';

export enum Character {
  ORKIN = 'orkin',
  PROFESSOR = 'professor',
  KNIGHT = 'knight',
  MONK = 'monk',
}



export class Player extends Element {
  id: number;
  positionX: number = 0;
  positionY: number = 0;
  @observable gameState:GamePlayer;
  width = 25;
  height = 10;
  state = {
    animation: 'stay_front',
  };
  character: Character;

  constructor(id: number, gameState: GamePlayer, character: Character) {
    super();
    this.character = character;
    this.gameState = gameState;
    this.id = id;
  }

  getPosition() {
    return {
      positionX: this.positionX,
      positionY: this.positionY,
    };
  }
}
