import { CanvasElement } from './objects';

type Layer = CanvasElement[]

export class DrawingContext {
  context: CanvasRenderingContext2D;
  currentFrame: number = 0;
  layers: Layer[] = [];

  constructor (context: CanvasRenderingContext2D) {
    this.context = context;
  }

  render() {
    this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
    this.layers.forEach(objects => objects && objects.forEach(object => {
      object.render(this.context, { currentFrame: this.currentFrame });
    }));
    this.currentFrame += 1;
  }

}
