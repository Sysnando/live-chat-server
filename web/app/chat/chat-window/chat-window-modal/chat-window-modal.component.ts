import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
  OnDestroy,
  EventEmitter, Output
} from '@angular/core';
import {CameraService} from "../../../shared/services/camera.service";
import {faTimes} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-chat-window-modal',
  templateUrl: './chat-window-modal.component.html',
  styleUrls: ['./chat-window-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowModalComponent implements OnDestroy{

  readonly faTimes = faTimes;

  @ViewChild('cameraPreview')   cameraPreview: ElementRef;

  @Output()                     modalClose = new EventEmitter<boolean>();
                                modalPage = 0;

  constructor(private camera: CameraService) {}

  onClickClose() {
    this.modalClose.next(this.modalPage == 2);
  }

  onClickPage(page: number) {
    this.modalPage = page;
    this.modalPage == 1
      ? this.camera.start(this.cameraPreview.nativeElement, { video: { facingMode: "user" } })
      : this.camera.stop();
  }

  ngOnDestroy(): void {
    this.camera.stop();
  }

}
