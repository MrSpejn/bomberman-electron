import { CanvasElement } from './objects';

type Layer = CanvasElement[]

export class DrawingContext {
  context: CanvasRenderingContext2D;
  scrollX: number = 0;
  scrollY: number = 0;

  constructor(context:CanvasRenderingContext2D) {
    this.context = context;
  }
  clear() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
  }

  isVisible(offsetX: number, offsetY: number, width: number, height: number) {
    const cWidth = this.context.canvas.width;
    const cHeight = this.context.canvas.height;

    return offsetX < cWidth + this.scrollX &&
      offsetX + width > this.scrollX &&
      offsetY > cHeight + this.scrollY && offsetY + height > this.scrollY;
  }

  drawImage(image: HTMLImageElement, sourceX: number, sourceY: number, sourceWidth: number, sourceHeight: number, offesetX?: number, offesetY?: number, destWidth?: number, destHeight?: number) {
    if (offesetX !== undefined) {
      this.context.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, offesetX - this.scrollX, offesetY - this.scrollY, destWidth, destHeight);
    }
    else {
      this.context.drawImage(image, sourceX - this.scrollX, sourceY - this.scrollY, sourceWidth, sourceHeight);
    }
  }

  save() {
    this.context.save();
  }

  drawRect(x, y, width, height, { color }) {
    const prev = this.context.fillStyle;
    this.context.fillStyle = color;
    this.context.fillRect(x - this.scrollX, y - this.scrollY, width, height);
    this.context.fillStyle = prev;
  }

  configure(config) {
    Object.keys(config).forEach((key) => {
      this.context[key] = config[key];
    });
  }
  restore() {
    this.context.restore();
  }
}
