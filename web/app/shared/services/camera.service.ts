import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable({ providedIn: 'root'})
export class CameraService {

  private video = new BehaviorSubject<HTMLVideoElement>(undefined);
  private videoStream = new BehaviorSubject<MediaStream>(undefined);

  constructor() {}

  get video$() { return this.video.asObservable() }
  get videoStream$() { return this.videoStream.asObservable() }

  start(config: MediaStreamConstraints, video: HTMLVideoElement): Promise<void> {
    this.video.getValue() && this.stop();
    this.video.next(video);

    return navigator.mediaDevices.getUserMedia(config)
      .then((value: MediaStream) => this.videoStream.next(video.srcObject = value))
      .then(() => video.play());
  }

  stop() {
    this.video.getValue()?.pause();
    this.video.next(undefined);

    this.videoStream.getValue()?.getAudioTracks().forEach(value => value.stop());
    this.videoStream.getValue()?.getVideoTracks().forEach(value => value.stop());
    this.videoStream.next(undefined);
  }

}
