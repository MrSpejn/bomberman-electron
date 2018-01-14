import * as process from 'process';
import * as dgram from 'dgram';
import throttle from 'lodash.throttle';
import ShortUniqueId from 'short-unique-id';

import {
  GameStatus,
  NetworkMeta,
} from '../Store/AppStore';
import {
  setTimeout,
  clearTimeout,
  clearInterval,
  setInterval,
} from 'timers';
;
import { Buffer } from 'buffer';
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
  PENDING_MAPS = 'PENDING_MAPS',
  ACK_BOMB = 'ACK_BOMB',
  ACK_JOIN_GAME = 'ACK_JOIN_GAME',
  ACK_CREATE_GAME = 'ACK_CREATE_GAME',
};

export enum Outgoing {
  PING = 'PING',
  MOVE = 'MOVE',
  BOMB = 'BOMB',
  CREATE_GAME = 'CREATE_GAME',
  JOIN_GAME = 'JOIN_GAME',
  ACK  = 'ACK',
  MAPS = 'MAPS',
};


const INCOMING_CODES: Array<[Incoming, String]> = [
  [Incoming.JOIN_RES, 'pl'],
  [Incoming.PING, 'pi'],
  [Incoming.MAP, 'o:'],
  [Incoming.PLAYERS, 'p:'],
  [Incoming.BOMBS, 'b:'],
  [Incoming.ACK, 'ac'],
  [Incoming.PENDING_MAPS, 'pm'],
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
        isProtected: parseInt(params[4]),
        resetPosition: parseInt(params[5]),
        y: parseInt(params[7]),
        x: parseInt(params[6]),
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
    const asText = message.toString('utf-8').split('|')[1];
    return asText;
  }

  pendingMapsParser(message: Buffer) {
    const asText = message.toString('utf-8');
    const mapsData = asText.split('|').slice(1, -1);
    const maps = mapsData.map(mapString => {
      const params = mapString.split(',');
      return {
        id: parseInt(params[0]),
        name: params[1],
        currentPlayers: parseInt(params[2]),
        maxPlayers: parseInt(params[3]),
      };
    });
    return maps;
  }

  acknowledgeParser(message: Buffer) {
    return message.toString('utf-8').slice(2);

  }

  gameStatusParser(message: Buffer) {
    const asText = message.toString('utf-8');
    const gameStatus: GameStatus = {};
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
        lifes: 0,
        isAlive: true,
        isProtected: false,
        resetPosition: false,
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
      case Incoming.ACK: {
        return this.notify('acknowledge', this.acknowledgeParser(message));
      }
      case Incoming.PENDING_MAPS: {
        return this.notify('maps', this.pendingMapsParser(message));
      }
      case Incoming.BOMBS: {
        this.notify('bombs', this.bombParser(message));
        return;
      }
    }
  }
}

export class MessageSerializer {
  serialize(action: Outgoing, reconnect: boolean, unique: string, ...args) {
    switch(action) {
      case Outgoing.PING:
        return this.serializePing(<Date> args[0]);
      case Outgoing.BOMB:
        return this.serializeBomb(reconnect, unique, <Position> args[0]);
      case Outgoing.MOVE:
        return this.serializeMove(<string> args[0]);
      case Outgoing.CREATE_GAME:
        return this.serializeCreateGame(reconnect, unique, <string> args[0]);
      case Outgoing.JOIN_GAME:
        return this.serializeJoinGame(reconnect, unique, <string> args[0], <number> args[1]);
      case Outgoing.MAPS:
        return this.serializePendingMaps();
    }
  }

  serializeMove(direction: string) {
    const buffer = Buffer.alloc(25);
    buffer.write(`mv${direction}`, 0);
    return buffer;
  }

  serializeBomb(reconnect: boolean, unique: string, position: Position) {
    const buffer = Buffer.alloc(32);
    buffer.write(reconnect ? 'rtbm' : 'bm', 0);
    buffer.writeUInt32LE(position.x, reconnect ? 4 : 2);
    buffer.writeUInt32LE(position.y, reconnect ? 8 : 6);
    buffer.write(unique, reconnect ? 12 : 10);
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

  serializePendingMaps() {
    const buffer = Buffer.from('pm', 'utf-8');
    return buffer;
  }

  serializeCreateGame(reconnect: boolean, unique: string, name: string) {
    const start = `${reconnect ? 'rt' : ''}pr${name.length}:${name}`;
    const buffer = Buffer.alloc(start.length + 24, 0);
    buffer.write(start, 0);
    buffer.writeInt32LE(-1, start.length);
    buffer.write(unique, start.length + 4);
    return buffer;
  }

  serializeJoinGame(reconnect: boolean, unique: string, name: string, id: number) {
    const start = `${reconnect ? 'rt' : ''}pr${name.length}:${name}`;
    const buffer = Buffer.alloc(start.length + 24, 0);
    buffer.write(start, 0);
    buffer.writeInt32LE(id, start.length);
    buffer.write(unique, start.length + 4);
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
  pingInterval: NodeJS.Timer = null;
  connected: boolean = false;
  connecting: boolean = false;
  timeout: NodeJS.Timer = null;
  networkMeta: NetworkMeta = null;
  connectingInterval: NodeJS.Timer = null;
  uid: ShortUniqueId = null;

  constructor(address: string, port: number) {
    this.port = port;
    this.address = address;
    this.client = dgram.createSocket('udp4');
    this.notifier = new MessageNotifier();
    this.serializer = new MessageSerializer();
    this.uid = new ShortUniqueId();

    this.notifier.on('connect', () => {
      console.log('Connected');
      this.connected = true;
      this.connecting = false;
      clearInterval(this.connectingInterval);
      this.pingInterval = setInterval(() => {
        this.dispatch(Outgoing.PING, new Date());
      }, 250);
    });



    this.client.on('message', (message) => {
      const chance = Math.floor(Math.random() * 100);
      if (chance < this.networkMeta.percentageIncommingDrop) return;

      if (this.networkMeta.receiveDelay > 0) {
        setTimeout(() => {
          this.onMessage(message);
        }, this.networkMeta.receiveDelay);
      } else {
        this.onMessage(message);
      }
    });
  }

  onMessage(message) {
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
      this.connected = false;
      clearInterval(this.pingInterval);
      console.log('Disconnected');
    }, 3000);
  }

  setNetworkMeta(networkMeta: NetworkMeta) {
    this.networkMeta = networkMeta;
  }

  connect() {
    console.log(`Openning connection to ${this.address}:${this.port}`);
    this.connecting = true;
    this.connected = false;

    const unique = this.uid.randomUUID(20);

    const connectFn = () => {
      const buffer = Buffer.from(`rtcn${unique}`, 'utf-8');
      this.send(buffer);
    };
    const onMessage = (uniqueSequence) => {
      if (unique === uniqueSequence) {
        this.off(`acknowledge`, onMessage);
        clearInterval(interval);
        this.connecting = false;
        this.connected = true;
        this.notifier.notify('connect');
      }
    };

    this.on(`acknowledge`, onMessage);

    this.send(Buffer.from(`cn${unique}`, 'utf-8'));
    const interval = setInterval(connectFn, 100);

    this.timeout = setTimeout(() => {
      this.notifier.notify('disconnect');
      this.connected = false;
      clearInterval(this.pingInterval);
      console.log('Disconnected');
    }, 3000);
  }

  send(message:Buffer) {
    if (!this.connected && !this.connecting) return;
    const chance = Math.floor(Math.random() * 100);
    if (chance < this.networkMeta.percentageOutgoingDrop) return;

    if (this.networkMeta.sendDelay > 0) {
      setTimeout(() => {
        this.client.send(message, this.port, this.address);
      }, this.networkMeta.sendDelay);
    } else {
      this.client.send(message, this.port, this.address);
    }
  }

  on(event: string, handler: (...any) => void) {
    this.notifier.on(event, handler);
  }

  off(event: string, handler: (...any) => void) {
    this.notifier.off(event, handler);
  }

  dispatch(action: Outgoing, ...args) {
    this.send(this.serializer.serialize(action, false, null, ...args));
  }

  dispatchUntilAcknowledge(action: Outgoing, ...args) {
    const unique = this.uid.randomUUID(20);
    this.send(this.serializer.serialize(action, false, unique, ...args));

    const onMessage = (uniqueSequence) => {
      if (unique === uniqueSequence) {
        clearInterval(interval);
        this.off(`acknowledge`, onMessage);
      }
    };

    this.on(`acknowledge`, onMessage);

    const interval = setInterval(() => {
      this.send(this.serializer.serialize(action, true, unique, ...args));
    }, 100);
  }
}
