import { connect } from 'http2';
import { Renderer as CanvasRenderer } from '../CanvasRenderer';
import { CanvasObjectProvider } from '../CanvasRenderer/CanvasObjectProvider';
import { Centerer } from './Centerer';
import {
  Game,
  Player,
  LocallyControlled,
  RemotelyControlled,
  Character,
 } from '../Game';
import { stage0 } from '../stages';
import { Connection } from '../Network';


const config = {
  fieldSize: 80,
};

export class Bomberman {
  local: LocallyControlled;
  renderer: CanvasRenderer;
  game: Game;

  constructor(connection: Connection) {

    const objectProvider = new CanvasObjectProvider();
    const canvas = <HTMLCanvasElement> document.querySelector('#plain');

    const localPlayer = new Player(1, Character.ORKIN);
    const remotePlayer = new Player(2, Character.KNIGHT);
    this.game = new Game(stage0, config.fieldSize);
    this.local = new LocallyControlled(localPlayer, 500, 500, this.game, connection);
    const remote = new RemotelyControlled(remotePlayer, 500, 580, this.game, connection);
    this.game.setPlayers([localPlayer, remotePlayer]);

    this.renderer = new CanvasRenderer(canvas.getContext('2d'), config.fieldSize, objectProvider);
    this.renderer.setPlain(this.game.map.length, this.game.map[0].length);
    this.renderer.setElements([this.game.elements, this.game.bombs, this.game.fires, this.game.debris, this.game.players]);

    const centerer = new Centerer(this.renderer.width, this.renderer.height, this.renderer);
    centerer.setMainPlaya(localPlayer);

    connection.on('player', (message) => {
      console.log('PLAYER', message);
      //this.local.setPosition(message.x, message.y, this.game.map);
    });
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
      const timeDiff = end.getTime() - start.getTime();
      this.game.update(timeDiff);
      this.local.update(timeDiff);
      this.renderer.render(end.getTime(), timeDiff);
      requestAnimationFrame(animationFrame);
      start = end;
    }

  }
}
