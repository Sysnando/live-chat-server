import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
declare var DeepAR: any;

//XTODO 1. (Nao funciona)tentar arrancar o sdk de acordo com o device para melhorar a experiencia e evitar o zoom
//TODO 1. ver como remover aquele zoom no tlm
//TODO 2. o counter não esta correto, pois o streamming esta 10 seg e a gravação esta 20
//TODO 3. injectar o metada para ter a URL para o call to action
//TODO 4. botão do call to action no evento
//TODO 5. lentidão para apresentar o streamming
//TODO 6. licença deepar(preciso do cartao)

@Injectable({ providedIn: 'root'})
export class DeepARService {

  constructor() {}

  private canvasStream = new BehaviorSubject<MediaStream>(undefined);
  private deepAR: any;

  get canvasStream$() { return this.canvasStream.asObservable() }
  get masksPath() { return '/assets/deepar/effects/' }

  start(video: HTMLVideoElement, canvas: CanvasElement, effect?: string) {

    let path = this.masksPath;

    let deepAR = DeepAR({
      licenseKey: '2527787aca0aae55d4a5a07c547bbf4f2c25b92e9ebb8f39587bca34cb2dc6cd6668c93103aeff34',
      canvasWidth: 640,
      canvasHeight: 360,
      canvas: canvas,
      numberOfFaces: 2, // how many faces we want to track min 1, max 4
      onInitialize: function () {
        //Used to pass the HTMLVideoElement to the DeepAR SDK. The SDK will grab frames
        //from the video element and render the frames with masks/filters to the canvas.
        // This method should be used instead of startVideo when you want to handle getUserMedia
        //outside of the SDK or you need to apply the masks to any video stream.

        deepAR.startVideo(true);

        if(effect)
          this.switchEffect(0, 'slot', path + '/masks/'+ effect, () => {
            // effect loaded
          })
      }
    });

    this.deepAR = deepAR;

    // download the face tracking model
    this.deepAR.downloadFaceTrackingModel('/assets/deepar/models/models-68-extreme.bin');

    this.canvasStream.next(canvas.captureStream(30));

  }

  onSwitchEffect(effectName: string) {
    return this.deepAR.switchEffect(0, 'slot', this.masksPath + effectName, () => {});
  }

  onCleanEffect() {
    return this.deepAR.clearEffect('slot');
  }
}

interface CanvasElement extends HTMLCanvasElement {
  captureStream(frameRate: number): MediaStream;
}
