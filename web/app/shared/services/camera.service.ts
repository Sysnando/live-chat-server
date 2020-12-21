import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";

@Injectable({ providedIn: 'root'})
export class CameraService {

  private video = new BehaviorSubject<HTMLVideoElement>(undefined);
  private videoStream = new BehaviorSubject<MediaStream>(undefined);

  constructor() {}

  get video$() { return this.video.asObservable() }
  get videoStream$() { return this.videoStream.asObservable() }

  start(video: HTMLVideoElement): Promise<void> {
    this.video.getValue() && this.stop();
    this.video.next(video);

    return navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: 640, height: 360 } })
      .then((value: MediaStream) => this.videoStream.next(video.srcObject = value))
  }

  stop() {
    this.video.getValue()?.pause();
    this.video.next(undefined);

    this.videoStream.getValue()?.getAudioTracks().forEach(value => value.stop());
    this.videoStream.getValue()?.getVideoTracks().forEach(value => value.stop());
    this.videoStream.next(undefined);
  }

}
