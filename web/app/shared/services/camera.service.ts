import {Injectable} from "@angular/core";

@Injectable({ providedIn: 'root'})
export class CameraService {

  private element: HTMLVideoElement;

  start(element: HTMLVideoElement, config: MediaStreamConstraints) {
    this.element && this.stop();
    this.element = element;

    navigator.mediaDevices
      .getUserMedia(config)
      .then((stream: any) => {
        this.element.srcObject = stream;
        this.element.play();
      });
  }

  stop() {
    this.element?.pause();
    this.element = undefined;
  }
}
