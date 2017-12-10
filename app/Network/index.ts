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
  RES_JOIN = 'RES_JOIN',
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
  [Incoming.PING, 'pi'],
  [Incoming.MAP, 'ad'],
  [Incoming.PLAYERS, 'p:'],
  [Incoming.BOMBS, 'ad'],
  [Incoming.ACK, 'ad'],
];

const OUTGOING_CODES = {
  [Outgoing.PING]: 0x70,
  [Outgoing.BOMB]: 0x24,
  [Outgoing.MOVE]: 0x18,
};





export class MessageNotifier {
  handlers = {};

  on(event:string, handler: (any) => void) {
    if (this.handlers[event]) {
      this.handlers[event].push(handler);
    } else {
      this.handlers[event] = [handler];
    }
  }

  notify(event, ...args) {
    if (this.handlers[event]) {
      this.handlers[event].forEach(handler => handler(...args));
    }
  }

  pingParser(message: Buffer) {
    const length = message.readUInt8(2);
    const date = parseInt(message.toString('utf-8', 3, length + 3));
    return (new Date).getTime() - date;
  }

  playerParser(message: Buffer) {
    const asd = message.toString('utf-8');
    const dick = asd.split('|')[2].split(',');
    const x = dick[dick.length-2];
    const y = dick[dick.length-1];
    return { x: parseInt(x), y: parseInt(y) };
  }

  bombParser(message: Buffer) {

  }

  mapParser(message: Buffer) {

  }

  process(action: Incoming, message: Buffer) {
    switch(action) {
      case Incoming.PING: {
        return this.notify('ping', this.pingParser(message));
      }
      case Incoming.MAP: {
        return this.notify('map', this.mapParser(message));
      }
      case Incoming.PLAYERS: {
        return this.notify('player', this.playerParser(message));
        // players.forEach((player) => {
        //   this.notify('player', player);
        // });
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
    //console.log(`bm:${Math.floor(position.x)}|${Math.floor(position.y)}`);

    buffer.write('bm', 0);
    buffer.writeInt32LE(Math.floor(position.x), 2);
    buffer.writeInt32LE(Math.floor(position.y), 6);
    buffer.write('Tomke', 10);
    return buffer;
  }

  serializeBomb(playerId: number, position: Position) {
    const buffer = Buffer.alloc(10);
    buffer.write('as', 0);
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
    console.log(`Openning connection to ${address}:${port}`);
    this.port = port;
    this.address = address;
    this.client = dgram.createSocket('udp4');
    this.notifier = new MessageNotifier();
    this.serializer = new MessageSerializer();





    this.client.on('message', (message) => {
      if (!this.connecting && !this.connected) {
        return;
      }
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }
      if (this.connecting) {
        this.connected = true;
        this.connecting = false;
        clearInterval(this.connectingInterval);
        this.notifier.notify('connect');
      }

      const type = message.toString('utf-8', 0, 2);
      const action = INCOMING_CODES.find(([key, code]) => type === code);
      if (!action) return;

      this.notifier.process(action[0], message);
      this.timeout = <NodeJS.Timer>setTimeout(() => {
        this.notifier.notify('disconnect');
      }, 3000);
    });



  }

  connect(connectionMessage) {
    this.connecting = true;

    const connectFn = () => {
      const buffer = Buffer.from('pr5:Tomke', 'utf-8');
      this.send(buffer);
    };

    this.connectingInterval = setInterval(connectFn, 100);

    setInterval(() => {
      this.dispatch(Outgoing.PING, new Date());
    }, 250);
  }
  send(message:Buffer) {
    console.log('Dispatch', message.toString('utf-8'));
    this.client.send(message, this.port, this.address);
  }

  on(event: string, handler: (any) => void) {
    this.notifier.on(event, handler);
  }

  dispatch(action: Outgoing, ...args) {
    this.send(this.serializer.serialize(action, ...args));
  }

}
