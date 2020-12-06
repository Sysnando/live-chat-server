import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
  ElementRef, AfterViewInit, OnDestroy, ChangeDetectorRef
} from '@angular/core';
import {RTCService} from "../../shared/services/rtc.service";
import {Subscription} from "rxjs";
import {faBan, faTimes} from "@fortawesome/free-solid-svg-icons";
import {IOService} from "../../shared/services/io.service";

@Component({
  selector: 'app-fans-video',
  templateUrl: './fans-video.component.html',
  styleUrls: ['./fans-video.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FansVideoComponent implements AfterViewInit, OnChanges, OnDestroy {

  readonly faBan = faBan;
  readonly faTimes = faTimes;

                                busy: boolean;

  @Input()                      card: boolean = true;
  @Input()                      id: string;
  @Input()                      moderator: boolean;

  @ViewChild('video')           video: ElementRef;
  @ViewChild('videoBackground') videoBackground: ElementRef;

  private subscription: Subscription;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private io: IOService,
    private rtc: RTCService,
  ) {
    this.subscription = this.rtc.update$.subscribe(() => this.update());
  }

  onClickBan() { this.io.moderatorBan(this.id); this.busy = true; }
  onClickKick() { this.io.moderatorKick(this.id); this.busy = true; }

  ngAfterViewInit() {
    this.update();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.update();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  update() {
    if (this.video && this.video.nativeElement && this.id)
        this.video.nativeElement.srcObject = this.rtc.stream(this.id);
    if (this.videoBackground && this.videoBackground.nativeElement && this.id)
        this.videoBackground.nativeElement.srcObject = this.rtc.stream(this.id);

    this.busy = false;
    this.changeDetector.markForCheck();
  }

}
