import range from 'lodash.range';
import throttle from 'lodash.throttle';

import { GameStatus } from '../Store/AppStore';
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

function idToCharacter(id) {
  switch (id) {
    case 1: return Character.PROFESSOR;
    case 2: return Character.MONK;
    case 3: return Character.KNIGHT;
    case 4: return Character.ORKIN;
  }
}

function toStage(map: string) {
  const size = Math.floor(Math.sqrt(map.length));
  const stage = range(size).map(row => {
    return map.slice(row * size, (row+1) * size).split('');
  });
  return { map: stage };
}

export class Bomberman {
  local: LocallyControlled;
  renderer: CanvasRenderer;
  game: Game;

  constructor(connection: Connection, status: GameStatus, map: string) {

    const stage = toStage(map);

    const objectProvider = new CanvasObjectProvider();
    const canvas = <HTMLCanvasElement> document.querySelector('#plain');
    this.game = new Game(stage, connection, config.fieldSize);
    const localPlayer = new Player(status.localId, idToCharacter(status.localId));
    this.local = new LocallyControlled(localPlayer, 0, 0, this.game, connection);
    const remotes = status.players.filter(player => player.id !== status.localId).map(player => {
      const remotePlayer = new Player(player.id, idToCharacter(player.id));
      new RemotelyControlled(remotePlayer, 0, 0, this.game, connection);
      return remotePlayer;
    });
    this.game.setPlayers([localPlayer, ...remotes]);
    connection.on('map', throttle(map => {
      this.game.updateStage(toStage(map).map);
    }, 100));
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

  stopLocal() {
    this.local.stop();
  }
}
