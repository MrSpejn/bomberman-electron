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
    const canvas = this.renderer.context.context.canvas;
    const screenHeight = canvas.height;
    const screenWidth = canvas.width;

    let x;
    let y;

    const posX = this.playa.positionX + 80;
    const posY = this.playa.positionY + 80;

    if (posY < screenHeight / 2) {
      y = 0;
    } else if (posY > (this.height - screenHeight / 2)) {
      y = this.height - screenHeight;
    } else {
      y = posY - screenHeight / 2;
    }

    if (posX < screenWidth / 2) {
      x = 0;
    } else if (posX > (this.width - screenWidth / 2)) {
      x = this.width - screenWidth;
    } else {
      x = posX - screenWidth / 2;
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
