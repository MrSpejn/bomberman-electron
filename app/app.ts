import * as path from 'path';
import * as electron from 'electron';
import * as range from 'lodash.range';

import './style.scss';
import { Bomberman } from './Bomberman';

const bomberman = new Bomberman();

bomberman.start();
