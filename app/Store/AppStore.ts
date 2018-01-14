import merge from 'lodash.merge';
import throttle from 'lodash.throttle';

import {
  observable,
  action,
} from 'mobx';
import { Connection } from '../Network';
import { setTimeout } from 'timers';
import { PendingMap } from '../Components/Root';


export interface GamePlayer {
  id: number,
  nick: string,
  connected: boolean,
  lifes: number,
  isAlive: boolean,
  isProtected: boolean,
  resetPosition: boolean,
}
export interface GameStatus {
  players?: GamePlayer[],
  localId?: number,
  started?: boolean,
}

export interface NetworkMeta {
  percentageIncommingDrop: number,
  percentageOutgoingDrop: number,
  sendDelay: number,
  receiveDelay: number,
}

export class AppStore {
  connection: Connection;
  reconnect: string;
  @observable maps: PendingMap[] = [];
  @observable ping: number = -1;
  @observable gameStatus: GameStatus = {
    players: observable([]),
    localId: -1,
    started: false,
  };
  @observable networkMeta: NetworkMeta = {
    percentageIncommingDrop: 0,
    percentageOutgoingDrop: 0,
    sendDelay: 0,
    receiveDelay: 0,
  };

  constructor(connection: Connection) {
    this.connection = connection;
    connection.on('ping', action((ping) => {
      this.ping = <number>ping;
    }));
    connection.on('disconnect', action((ping) => {
      this.ping = -1;
    }));
    connection.on('game_status', action((status: GameStatus) => {
      this.gameStatus.localId = status.localId;
      this.gameStatus.started = status.started;
      status.players.forEach((player, idx) => {
        const exist = this.gameStatus.players[idx];
        if (exist) {
          exist.id = player.id;
          exist.connected = player.connected;
          exist.nick = player.nick;
        } else {
          this.gameStatus.players.push(observable({...player, lifes: 0, isAlive: true }));
        }
      });
    }));
    connection.on('players', throttle(action((players: GamePlayer[]) => {
      this.gameStatus.players.forEach((player, idx) => {
        const incomming = players.find(p => p.id === player.id);
        player.lifes = incomming.lifes;
        player.isAlive = !!incomming.isAlive;
        player.isProtected = !!incomming.isProtected;
        player.resetPosition = !!incomming.resetPosition;
      });
    }), 12));
  }
  @action setPercentageIncommingDrop(percentage: number) {
    this.networkMeta.percentageIncommingDrop = percentage;
  }
  @action setPercentageOutgoingDrop(percentage: number) {
    this.networkMeta.percentageOutgoingDrop = percentage;
  }
  @action setSendDelay(delay: number) {
    this.networkMeta.sendDelay = delay;
  }
  @action setReceiveDelay(delay: number) {
    this.networkMeta.receiveDelay = delay;
  }
  @action replay() {
    const nick = this.gameStatus.players.find(player => player.id === this.gameStatus.localId).nick;
    this.reconnect = nick;
    setTimeout(action(() => {
      this.reconnect = null;
    }), 1);
  }
};
