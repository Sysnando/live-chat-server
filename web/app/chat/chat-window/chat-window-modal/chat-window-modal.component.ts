import {Component, OnInit, ChangeDetectionStrategy, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import {CameraService} from "../../../shared/services/camera.service";

@Component({
  selector: 'app-chat-window-modal',
  templateUrl: './chat-window-modal.component.html',
  styleUrls: ['./chat-window-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowModalComponent implements OnDestroy{
  @ViewChild('topFanvideoElement') topFanvideoElement: ElementRef;

  page: number = 0;

  constructor(private cameraService: CameraService) {
    this.onConductCodeModal(this.page)
  }

  onConductCodeModal(page: number) {
    this.page = page;

    if(page === 1) {
      this.cameraService.onInitCamera(this.topFanvideoElement, { video: { facingMode: "user" } })
    }
  }

  ngOnDestroy(): void {
    this.cameraService.pause();
  }
}
