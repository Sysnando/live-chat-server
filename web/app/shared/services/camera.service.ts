import {ElementRef, Injectable, ViewChild} from "@angular/core";

@Injectable({ providedIn: 'root'})
export class CameraService {
  private video: any;

  onInitCamera(element: ElementRef, config: MediaStreamConstraints) {

    this.video = element.nativeElement;
    let browser = <any> navigator;

    browser.getUserMedia = (browser.getUserMedia ||
      browser.webkitGetUserMedia ||
      browser.mozGetUserMedia ||
      browser.msGetUserMedia);

    browser.mediaDevices.getUserMedia(config).then((stream: any) => {
      this.video.srcObject = stream;
      this.video.play();
    });
  }

  pause() {
    if (this.video)
      this.video.pause();
  }
}
