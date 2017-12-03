import { setInterval } from 'timers';
import { Position } from 'webpack-sources/node_modules/source-map';
import * as process from 'process';
import * as dgram from 'dgram';

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


const INCOMING_CODES: Array<[Incoming, number]> = [
  [Incoming.PING, 0x76],
  [Incoming.MAP, 0x12],
  [Incoming.PLAYERS, 0x40],
  [Incoming.BOMBS, 0x84],
  [Incoming.ACK, 0x31],
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
    const length = message.readUInt8(1);
    const date = parseInt(message.toString('utf-8', 2, length + 2));
    return (new Date).getTime() - date;
  }

  playerParser(message: Buffer) {
    return [];
  }

  bombParser(message: Buffer) {

  }

  mapParser(message: Buffer) {

  }

  process(action: Incoming, message: Buffer) {
    switch(action) {
      case Incoming.PING: {
        this.notify('ping', this.pingParser(message));
      }
      case Incoming.MAP: {
        this.notify('map', this.mapParser(message));
      }
      case Incoming.PLAYERS: {
        const players = this.playerParser(message);
        players.forEach((player) => {
          this.notify('player', player);
        });
      }
      case Incoming.BOMBS: {
        this.notify('bombs', this.bombParser(message));
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
    const buffer = Buffer.alloc(9);
    buffer.writeUInt8(OUTGOING_CODES[Outgoing.MOVE], 0);
    buffer.writeUInt32LE(position.x, 1);
    buffer.writeUInt32LE(position.y, 5);
    return buffer;
  }

  serializeBomb(playerId: number, position: Position) {
    const buffer = Buffer.alloc(9);
    buffer.writeUInt8(OUTGOING_CODES[Outgoing.BOMB], 0);
    buffer.writeUInt32LE(position.x, 1);
    buffer.writeUInt32LE(position.y, 5);
    return buffer;
  }

  serializePing(date: Date) {
    const buffer = Buffer.alloc(20);
    buffer.writeUInt8(OUTGOING_CODES[Outgoing.PING], 0);
    const timestamp = date.getTime().toString();
    buffer.writeUInt8(timestamp.length, 1);
    buffer.write(timestamp, 2);
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

  constructor(address: string, port: number) {
    console.log(`Openning connection to ${address}:${port}`);
    this.port = port;
    this.address = address;
    this.client = dgram.createSocket('udp4');
    this.notifier = new MessageNotifier();
    this.serializer = new MessageSerializer();

    this.client.on('message', (message) => {
      const type = message.readUInt8(0);
      const action = INCOMING_CODES.find(([key, code]) => type === code);
      if (!action) return;

      this.notifier.process(action[0], message)
    });

    setInterval(() => {
      this.dispatch(Outgoing.PING, new Date());
    }, 100);

  }
  send(message) {
    this.client.send(message, this.port, this.address);
  }

  on(event: string, handler: (any) => void) {
    this.notifier.on(event, handler);
  }

  dispatch(action: Outgoing, ...args) {
    this.send(this.serializer.serialize(action, ...args));
  }

  dispatchAcknowledge(action: Outgoing, messageId: number, ...args) {
    const message = this.serializer.serialize(action, messageId, ...args);
    this.acknowledgeQueue = [{
      id: messageId,
      interval: setInterval(() => {
        this.send(this.serializer.serialize),
      }, 100),
    }]
  }
}
