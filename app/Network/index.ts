import {
  setTimeout,
  clearTimeout,
  clearInterval,
  setInterval,
} from 'timers';

import * as process from 'process';
import * as dgram from 'dgram';
import throttle from 'lodash.throttle';
interface Types {
  PING: string,
  MAP: string,
  PLAYERS: string,
  BOMBS: string,
};

interface Position {
  x: number,
  y: number,
};

enum Incoming {
  PING = 'PING',
  MAP = 'MAP',
  PLAYERS = 'PLAYERS',
  BOMBS = 'BOMBS',
  ACK = 'ACK',
  JOIN_RES = 'JOIN_RES',
  PENDING_GAME_STATE = 'PENDING_GAME_STATE',
  GAME_START = 'GAME_START',
};

export enum Outgoing {
  PING = 'PING',
  MOVE = 'MOVE',
  BOMB = 'BOMB',
  REQ_JOIN = 'REQ_JOIN',
  ACK  = 'ACK',
};


const INCOMING_CODES: Array<[Incoming, String]> = [
  [Incoming.JOIN_RES, 'pl'],
  [Incoming.PING, 'pi'],
  [Incoming.MAP, 'ad'],
  [Incoming.PLAYERS, 'p:'],
  [Incoming.BOMBS, 'b:'],
  [Incoming.ACK, 'ad'],
];

const OUTGOING_CODES = {
  [Outgoing.PING]: 0x70,
  [Outgoing.BOMB]: 0x24,
  [Outgoing.MOVE]: 0x18,
};





export class MessageNotifier {
  handlers = {};
  counters = {};

  on(event:string, handler: (...any) => void) {
    if (this.handlers[event]) {
      this.handlers[event].push(handler);
    } else {
      this.handlers[event] = [handler];
    }
  }
  off(event: string, handler: (...any) => void) {
    if (this.handlers[event]) {
      this.handlers[event] = this.handlers[event].filter(fn => fn !== handler);
    }
  }
  notify(event, ...args) {
    this.counters[event] = this.counters[event] ? this.counters[event] + 1 : 1;

    if (this.handlers[event]) {
      this.handlers[event].forEach(handler => handler(...args, this.counters[event]));
    }
  }

  pingParser(message: Buffer) {
    const length = message.readUInt8(2);
    const date = parseInt(message.toString('utf-8', 3, length + 3));
    return (new Date).getTime() - date;
  }

  playerParser(message: Buffer) {
    const asd = message.toString('utf-8');
    const players = asd.split('|').slice(1);
    return players.map(player => {
      const params = player.split(',');
      return {
        id: parseInt(params[0]),
        lifes: parseInt(params[1]),
        isAlive: parseInt(params[2]),
        availableBombs: parseInt(params[3]),
        y: parseInt(params[5]),
        x: parseInt(params[4]),
      };
    });
  }

  bombParser(message: Buffer) {
    const asText = message.toString('utf-8');
    const bombsData = asText.split('|').slice(1, -1);
    const bombs = bombsData.map(bombString => {
      const params = bombString.split(',');
      return {
        position: parseInt(params[0]),
        ownerId: parseInt(params[1]),
        power: parseInt(params[2]),
        duration: parseInt(params[3]),
        timestamp: parseInt(params[4]),
      };
    });
    return bombs;
  }

  mapParser(message: Buffer) {

  }

  gameStatusParser(message: Buffer) {
    const asText = message.toString('utf-8');
    const gameStatus = {};
    const [status, ...players] = asText.split('|');
    const [allReady, localId] = status.split(',');
    gameStatus.started = parseInt(allReady.split(':')[1]) == 0;
    gameStatus.localId = parseInt(localId);
    gameStatus.players = players.map(player => {
      const [id, nick] = player.split(',');
      return {
        id: parseInt(id),
        nick,
        connected: nick.length > 0,
      };
    });
    return gameStatus;
  }

  process(action: Incoming, message: Buffer) {
    switch(action) {
      case Incoming.JOIN_RES: {
        if (!this.counters['connect']) this.notify('connect');
        return this.notify('game_status', this.gameStatusParser(message));
      }
      case Incoming.PING: {
        return this.notify('ping', this.pingParser(message));
      }
      case Incoming.MAP: {
        return this.notify('map', this.mapParser(message));
      }
      case Incoming.PLAYERS: {
        return this.notify('players', this.playerParser(message));
      }
      case Incoming.BOMBS: {
        this.notify('bombs', this.bombParser(message));
        return;
      }
    }
  }
}

export class MessageSerializer {
  serialize(action: Outgoing, ...args) {
    switch(action) {
      case Outgoing.PING:
        return this.serializePing(<Date> args[0]);
      case Outgoing.BOMB:
        return this.serializeBomb(<number> args[0], <Position> args[1]);
      case Outgoing.MOVE:
        return this.serializeMove(<number> args[0], <Position> args[1]);
    }
  }

  serializeMove(playerId: number, position: Position) {
    const buffer = Buffer.alloc(25);

    buffer.write('mv', 0);
    buffer.writeInt32LE(Math.floor(position.x), 2);
    buffer.writeInt32LE(Math.floor(position.y), 6);

    return buffer;
  }

  serializeBomb(playerId: number, position: Position) {
    const buffer = Buffer.alloc(10);
    buffer.write('bm', 0);
    buffer.writeUInt32LE(position.x, 2);
    buffer.writeUInt32LE(position.y, 6);
    return buffer;
  }

  serializePing(date: Date) {
    const buffer = Buffer.alloc(20);
    buffer.write('pi', 0);
    const timestamp = date.getTime().toString();
    buffer.writeUInt8(timestamp.length, 2);
    buffer.write(timestamp, 3);
    return buffer;
  }
}

export class Connection {
  client: dgram.Socket;
  notifier: MessageNotifier;
  serializer: MessageSerializer;
  address: string;
  port: number;
  ping: number = 0;
  connected: boolean = false;
  connecting: boolean = false;
  timeout: NodeJS.Timer = null;
  connectingInterval: NodeJS.Timer = null;

  constructor(address: string, port: number) {
    this.port = port;
    this.address = address;
    this.client = dgram.createSocket('udp4');
    this.notifier = new MessageNotifier();
    this.serializer = new MessageSerializer();

    this.notifier.on('connect', () => {
      this.connected = true;
      this.connecting = false;
      clearInterval(this.connectingInterval);
      setInterval(() => {
        this.dispatch(Outgoing.PING, new Date());
      }, 250);
    });



    this.client.on('message', (message) => {
      if (!this.connecting && !this.connected) {
        return;
      }
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }

      const type = message.toString('utf-8', 0, 2);

      const action = INCOMING_CODES.find(([key, code]) => type === code);
      if (!action) return;

      this.notifier.process(action[0], message);
      this.timeout = setTimeout(() => {
        this.notifier.notify('disconnect');
      }, 3000);
    });



  }

  connect(connectionMessage) {
    console.log(`Openning connection to ${this.address}:${this.port}`);
    this.connecting = true;

    const connectFn = () => {
      const buffer = Buffer.from(connectionMessage, 'utf-8');
      this.send(buffer);
    };
    connectFn();
    this.connectingInterval = setInterval(connectFn, 100);

    this.timeout = setTimeout(() => {
      this.notifier.notify('disconnect');
    }, 3000);
  }

  send(message:Buffer) {
    this.client.send(message, this.port, this.address);
  }

  on(event: string, handler: (...any) => void) {
    this.notifier.on(event, handler);
  }

  off(event: string, handler: (...any) => void) {
    this.notifier.off(event, handler);
  }

  dispatch(action: Outgoing, ...args) {
    this.send(this.serializer.serialize(action, ...args));
  }

}
