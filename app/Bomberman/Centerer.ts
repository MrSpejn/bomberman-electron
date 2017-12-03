import { Player } from '../Game';
import { autorun } from 'mobx';
import { Renderer as CanvasRenderer } from '../CanvasRenderer';

export class Centerer {
  width: number;
  height: number;
  renderer: CanvasRenderer;
  playa: Player;

  constructor(width, height, renderer) {
    this.width = width;
    this.height = height;
    this.renderer = renderer;
  }

  centerOnPlayer() {
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;

    let x;
    let y;

    const posX = this.playa.positionX + 80;
    const posY = this.playa.positionY + 80;

    if (posX < screenHeight / 2) {
      x = 0;
    } else if (posX > (this.height - screenHeight / 2)) {
      x = this.height - screenHeight;
    } else {
      x = posX - screenHeight / 2;
    }

    if (posY < screenWidth / 2) {
      y = 0;
    } else if (posY > (this.width - screenWidth / 2)) {
      y = this.width - screenWidth;
    } else {
      y = posY - screenWidth / 2;
    }

    this.renderer.scrollX = x;
    this.renderer.scrollY = y;
  }

  setMainPlaya(playa: Player) {
    this.playa = playa;
    autorun(() => {
      this.centerOnPlayer();
    });
  }
}
