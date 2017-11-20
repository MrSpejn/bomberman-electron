
type PropTypes = {
  offsetX?: number,
  offsetY?: number,
};
type KeyFrame = {
  breakpoint: number,
  properties: PropTypes,
};

type AnimationDescriptor = {
  duration: number,
  frames: KeyFrame[],
};

export class Animation {
  duration: number;
  frames: KeyFrame[];
  startFrame: number;
  playing: boolean;

  constructor(animation: AnimationDescriptor) {
    this.duration = animation.duration;
    this.frames = animation.frames;
  }

  startAnimation(startFrame: number) {
    this.startFrame = startFrame;
    this.playing = true;
  }

  animate(currentFrame: number, properties: PropTypes): PropTypes {
    const timePassed = currentFrame - this.startFrame;
    const animationPercentage = (timePassed % this.duration) / this.duration * 100;
    const result = {};
    const diffs = getProperties(this.frames, animationPercentage);
    for (let key in properties) {
      if (properties.hasOwnProperty(key)) {
        result[key] = properties[key] + diffs[key];
      }
    }
    return result;
  }
}

function getProperties(frames: KeyFrame[], animationPercentage: number):PropTypes {
  const keyframes = findFrames(animationPercentage, frames);
  if (keyframes.length === 1) {
    return keyframes[0].properties;
  }
  const percentage = (animationPercentage - keyframes[0].breakpoint) / (keyframes[1].breakpoint - keyframes[0].breakpoint)

  return interpolate(keyframes, percentage);
}

function findFrames(percentage: number, frames: KeyFrame[]):KeyFrame[] {
  for (let i = 0; i < frames.length; i++) {
    if (frames[i].breakpoint === percentage) {
      return [frames[i]];
    }
    if (frames[i].breakpoint > percentage) {
      return [ frames[i-1], frames[i]];
    }
  }
}

function interpolate([from, to]: KeyFrame[], percentage: number):PropTypes {
  return Object.entries(from.properties).reduce((props, [key, value]) => {
    if (to.properties[key] !== undefined) {
      props[key] = to.properties[key] * percentage + from.properties[key] * (1 - percentage);
    } else {
      props[key] = from.properties[key];
    }
    return props;
  }, {});
}
