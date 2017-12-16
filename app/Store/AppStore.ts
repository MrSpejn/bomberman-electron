import { connect } from 'net';
import {
  observable,
  action,
} from 'mobx';
import { Connection } from '../Network';


export interface GamePlayer {
  id: number,
  nick: string,
  connected: boolean,
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
  @observable ping: number = -1;
  @observable gameStatus: GameStatus = {
    players: [],
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
      this.gameStatus = status;
    }));
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
};
