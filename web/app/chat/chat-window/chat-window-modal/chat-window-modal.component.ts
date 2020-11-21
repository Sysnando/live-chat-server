import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {CameraService} from "../../../shared/services/camera.service";
import {faTimes} from "@fortawesome/free-solid-svg-icons";
import {Subscription, timer} from "rxjs";
import {switchMap, take} from "rxjs/operators";
import {IOService} from "../../../shared/services/io.service";
import {RTCService} from "../../../shared/services/rtc.service";

@Component({
  selector: 'app-chat-window-modal',
  templateUrl: './chat-window-modal.component.html',
  styleUrls: ['./chat-window-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowModalComponent implements AfterViewInit, OnChanges, OnDestroy {

  readonly faTimes = faTimes;

  readonly ChatWindowModalPage = ChatWindowModalPage;

  @ViewChild('cameraPreview')   cameraPreview: ElementRef;
  @ViewChild('cameraPreview2')  cameraPreview2: ElementRef;

                                countdown: number;
                                countdownStart: number;

                                initialized: boolean;

  @Output()                     modalClose = new EventEmitter<boolean>();
  @Input()                      modalPage: ChatWindowModalPage;

  private                       subscriptionCoutdown: Subscription;

  constructor(
    private camera: CameraService,
    private changeDetector: ChangeDetectorRef,
    private io: IOService,
    private rtc: RTCService,
  ) {
    this.rtc.reset();
  }

  ngAfterViewInit() {
    this.initialized = true;
    this.onClickPage(this.modalPage);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.modalPage)
        this.onClickPage(this.modalPage);
  }

  ngOnDestroy(): void {
    this.camera.stop();
    this.rtc.stop();

    this.subscriptionCoutdown?.unsubscribe();
  }

  onClickClose() {
    if (this.modalPage == ChatWindowModalPage.SETUP_READY) {
        this.modalClose.next(true);
        this.io.queueEnter();
    } else {
        this.modalClose.next(false);
        this.io.fanLeave();
    }
  }

  onClickPage(page: ChatWindowModalPage) {
    if (this.initialized != true) return;

    // Clear everything before initializing the new page
    this.ngOnDestroy();

    switch (this.modalPage = page) {
      case ChatWindowModalPage.SETUP_CAMERA:
        this.camera.start({ video: { facingMode: "user" } }, this.cameraPreview.nativeElement).then(() => this.changeDetector.markForCheck());
        break;
      case ChatWindowModalPage.STREAM_START:
        this.camera.start({ video: { facingMode: "user" } }, this.cameraPreview2.nativeElement).then(() => this.changeDetector.markForCheck());

        this.subscriptionCoutdown = this.io.fanCountdown$
          .pipe(take(1), switchMap(value => timer(0, 1000)
            .pipe(take(this.countdownStart = value)))).subscribe(value => this.onCountdown(value));

        break;
    }
  }

  onCountdown(value: number) {
    this.countdown = this.countdownStart - value - 1;
    this.changeDetector.markForCheck();
  }

}

export enum ChatWindowModalPage {
  SETUP_ACCEPT,
  SETUP_CAMERA,
  SETUP_READY,
  STREAM_START,
  STREAM_STOP,
  STREAM_STOP_BANNED,
  STREAM_STOP_KICKED,
}
