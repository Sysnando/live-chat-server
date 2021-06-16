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
import {faTimes, faMask} from "@fortawesome/free-solid-svg-icons";
import {Subscription, timer} from "rxjs";
import {switchMap, take} from "rxjs/operators";
import {IOService} from "../../../shared/services/io.service";
import {RTCService} from "../../../shared/services/rtc.service";
import {DeepARService} from "../../../shared/services/deepar.service";
import {CarrouselCards} from "../chat-window-filter/chat-window-filter.component";

@Component({
  selector: 'app-chat-window-modal',
  templateUrl: './chat-window-modal.component.html',
  styleUrls: ['./chat-window-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowModalComponent implements AfterViewInit, OnChanges, OnDestroy {

  readonly faTimes = faTimes;
  readonly faMask = faMask;

  readonly ChatWindowModalPage = ChatWindowModalPage;

  @ViewChild('canvasPreview')   canvasPreview: ElementRef;
  @ViewChild('canvasPreview2')  canvasPreview2: ElementRef;
  @ViewChild('cameraPreview')   cameraPreview: ElementRef;
  @ViewChild('cameraPreview2')  cameraPreview2: ElementRef;

                                countdown: number;
                                countdownStart: number;

                                initialized: boolean;

  @Output()                     modalClose = new EventEmitter<boolean>();
  @Input()                      modalPage: ChatWindowModalPage;

  @Input()                      effect: string;
  @Output()                     effectChanged = new EventEmitter<string>();

  private                       subscriptionCoutdown: Subscription;

  constructor(
    private camera: CameraService,
    private changeDetector: ChangeDetectorRef,
    private deepAR: DeepARService,
    private io: IOService,
    private rtc: RTCService,
  ) {
    this.rtc.reset();
  }

  get carrouselProperties() { return new CarrouselProperties(); }

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
        this.camera.start(this.cameraPreview.nativeElement).then(() => this.changeDetector.markForCheck());
        this.deepAR.start(this.cameraPreview.nativeElement, this.canvasPreview.nativeElement);
        break;
      case ChatWindowModalPage.STREAM_START:
        this.camera.start(this.cameraPreview2.nativeElement).then(() => this.changeDetector.markForCheck());
        this.deepAR.start(this.cameraPreview2.nativeElement, this.canvasPreview2.nativeElement, this.effect)

        this.subscriptionCoutdown = this.io.fanCountdown$
          .pipe(take(1), switchMap(value => timer(0, 1000)
            .pipe(take(this.countdownStart = value)))).subscribe(value => this.onCountdown(value));

        break;
    }
  }

  onCountdown(value: number) {
    console.log(value, this.countdownStart)
    this.countdown = this.countdownStart - value - 1;
    console.log(this.countdown)
    this.changeDetector.markForCheck();
  }

  defaultFilters: CarrouselCards[] =
    [
      {
        click: () => {
          this.effectChanged.emit(undefined);
          return this.deepAR.onCleanEffect();
        },
        name: 'X',
        thumbPath: this.deepAR.masksPath + 'clean'
      },
      {
        click: () => {
          this.effectChanged.emit('aviators');
          return this.deepAR.onSwitchEffect('aviators')
        },
        name: 'aviators',
        thumbPath: this.deepAR.masksPath + 'aviators'
      },
      {
        click: () => {
          this.effectChanged.emit('beard');
          return this.deepAR.onSwitchEffect('beard')
        },
        name: 'beard',
        thumbPath: this.deepAR.masksPath + 'beard'
      },
      {
        click: () => {
          this.effectChanged.emit('dalmatian');
          return this.deepAR.onSwitchEffect('dalmatian')
        },
        name: 'dalmatian',
        thumbPath: this.deepAR.masksPath + 'dalmatian'
      },
      {
        click: () => {
          this.effectChanged.emit('flowers');
          return this.deepAR.onSwitchEffect('flowers')
        },
        name: 'flowers',
        thumbPath: this.deepAR.masksPath + 'flowers'
      },
      {
        click: () => {
          this.effectChanged.emit('koala');
          return this.deepAR.onSwitchEffect('koala')
        },
        name: 'koala',
        thumbPath: this.deepAR.masksPath + 'koala'
      },
      {
        click: () => {
          this.effectChanged.emit('lion');
          return this.deepAR.onSwitchEffect('lion')
        },
        name: 'lion',
        thumbPath: this.deepAR.masksPath + 'lion'
      },
      {
        click: () => {
          this.effectChanged.emit('teddycigar');
          return this.deepAR.onSwitchEffect('teddycigar')
        },
        name: 'teddycigar',
        thumbPath: this.deepAR.masksPath + 'teddycigar'
      },
    ]

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


class CarrouselProperties implements CarrouselProperties {
  height: 60;
  width: 50;
  borderRadius: 7;
  arrows: false;
}
