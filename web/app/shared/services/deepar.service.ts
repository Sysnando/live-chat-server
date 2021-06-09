import {Injectable} from "@angular/core";
declare var DeepAR: any;

@Injectable({ providedIn: 'root'})
export class DeepARService {

  constructor() {}

  private deepAR: any;

  start(video: HTMLVideoElement, canvas: HTMLCanvasElement) {

    this.deepAR = DeepAR({
      licenseKey: '2527787aca0aae55d4a5a07c547bbf4f2c25b92e9ebb8f39587bca34cb2dc6cd6668c93103aeff34',
      canvasWidth: 640,
      canvasHeight: 360,
      canvas: canvas,
      numberOfFaces: 2, // how many faces we want to track min 1, max 4
      onInitialize: function () {
        // start video immediately after the initalization, mirror = true
        //this.startVideo(true);

        //Used to pass the HTMLVideoElement to the DeepAR SDK. The SDK will grab frames
        //from the video element and render the frames with masks/filters to the canvas.
        // This method should be used instead of startVideo when you want to handle getUserMedia
        //outside of the SDK or you need to apply the masks to any video stream.
        this.setVideoElement(video, true)
      }
    });

    // download the face tracking model
    this.deepAR.downloadFaceTrackingModel('/assets/deepar/models/models-68-extreme.bin');

  }

  stop() {
  }

  onSwitchEffect(effectName: string) {
    this.deepAR.switchEffect(0, 'slot', '/assets/deepar/effects/masks/' + effectName, () => {
      // effect loaded
    });
  }

  onCleanEffect() {
    this.deepAR.clearEffect('slot');
  }
}
