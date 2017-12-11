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
import { stage1 } from '../stages';
import { Connection } from '../Network';


const config = {
  fieldSize: 80,
};

export interface GameStatus {
  players: {
    id: number,
    nick: string,
  }[],
  localId: number,
}

function idToCharacter(id) {
  switch (id) {
    case 1: return Character.PROFESSOR;
    case 2: return Character.MONK;
    case 3: return Character.KNIGHT;
    case 4: return Character.ORKIN;
  }
}
export class Bomberman {
  local: LocallyControlled;
  renderer: CanvasRenderer;
  game: Game;

  constructor(connection: Connection, status: GameStatus) {

    const objectProvider = new CanvasObjectProvider();
    const canvas = <HTMLCanvasElement> document.querySelector('#plain');

    this.game = new Game(stage1, connection, config.fieldSize);
    const localPlayer = new Player(status.localId, idToCharacter(status.localId));
    this.local = new LocallyControlled(localPlayer, 0, 0, this.game, connection);
    const remotes = status.players.filter(player => player.id !== status.localId).map(player => {
      const remotePlayer = new Player(player.id, idToCharacter(player.id));
      new RemotelyControlled(remotePlayer, 0, 0, this.game, connection);
      return remotePlayer;
    });
    this.game.setPlayers([localPlayer, ...remotes]);

    this.renderer = new CanvasRenderer(canvas.getContext('2d'), config.fieldSize, objectProvider);

    this.renderer.setPlain(this.game.map.length, this.game.map[0].length);
    this.renderer.setElements([this.game.elements, this.game.bombs, this.game.fires, this.game.debris, this.game.players]);

    const centerer = new Centerer(this.renderer.width, this.renderer.height, this.renderer);
    centerer.setMainPlaya(localPlayer);
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
