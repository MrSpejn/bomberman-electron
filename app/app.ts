import { clearTimeout } from 'timers';
import * as path from 'path';
import * as electron from 'electron';
import * as range from 'lodash.range';

import './style.scss';
import { Connection} from './Network';
import { Bomberman } from './Bomberman';

const connection = new Connection('localhost', 1234);
const bomberman = new Bomberman(connection);
const pingEl = <HTMLElement> document.querySelector('.ping-box');
const dialogEl = <HTMLElement> document.querySelector('.dialog');
const formEl = <HTMLFormElement> document.querySelector('#start');
const canvasEl = <HTMLCanvasElement> document.querySelector('#plain');

formEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = <HTMLFormElement> event.target;
  if (!form.nick.value) return;

  const nick = form.nick.value;
  dialogEl.style.display = 'none';
  canvasEl.style.zIndex = '1';
  connection.connect(`pr${nick.length}:${nick}`);
});

connection.on('ping', setPing.bind(null, pingEl));
connection.on('disconnect', renderPing.bind(null, pingEl, 'Disconnected', ''));
connection.on('connect', () => {
  bomberman.start();
});

const nick = 0;
//




function setPing(element:Element, ping:number) {
  renderPing(element, ping, getValueSufix(ping));
}

function renderPing(element, ping, className) {
  element.innerText = ping;
  element.className = `ping-box ${className ? `ping-box--${className}` :''}`;
}

function getValueSufix(ping: number):string {
  if (ping < 40) return 'good';
  if (ping < 100) return 'nice';
  if (ping < 150) return 'medium';
  if (ping < 200) return 'bad';
  return 'critical';
}
