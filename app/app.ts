import * as path from 'path';
import * as electron from 'electron';
import * as range from 'lodash.range';

import * as network from './network';

import './style.scss';
import { Renderer } from './CanvasRenderer';

const renderer = new Renderer();

renderer.start();
