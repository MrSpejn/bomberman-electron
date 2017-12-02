import * as path from 'path';
import * as electron from 'electron';
import * as range from 'lodash.range';

import './style.scss';
import { Connection } from './Network';
import { Bomberman } from './Bomberman';

const conection = new Connection('localhost', 7777);
conection.on('ping', (ping) => {
  console.log('PING', ping);
});
const bomberman = new Bomberman();

bomberman.start();
