import { observable } from 'mobx';
import { Element } from './Element';

export class Player extends Element {
  @observable positionX:number = 0;
  @observable positionY:number = 0;
  width = 25;
  height = 10;
  state = {
    animation: 'walk_front',
  };
  character: string = 'orkin';

  getPosition() {
    return {
      positionX: this.positionX,
      positionY: this.positionY,
    };
  }
}
