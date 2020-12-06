import {Component, ChangeDetectionStrategy, OnDestroy, ChangeDetectorRef} from '@angular/core';
import {IOService, SocketStatus} from "../../shared/services/io.service";
import {RTCService} from "../../shared/services/rtc.service";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {QUERY_PARAM_EVENT} from "../../../../web-shared/constants";

@Component({
  selector: 'app-fans-moderator',
  templateUrl: './fans-moderator.component.html',
  styleUrls: ['./fans-moderator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FansModeratorComponent implements OnDestroy {

              paramEvent: string;

              peer: string;
              peerQueue: string[];

  private     subscriptionPeers: Subscription;
  private     subscriptionSocketStatus: Subscription;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private io: IOService,
    private route: ActivatedRoute,
    private rtc: RTCService,
  ) {
    this.paramEvent = route.snapshot.queryParamMap.get(QUERY_PARAM_EVENT);
    this.paramEvent && this.io.connect('moderator'); // TODO: use hard-coded token with a spectator role or something, no expiration. on the server only let localhost users connect with it
    this.paramEvent && this.rtc.reset();

    this.subscriptionPeers = this.io.rtcPeers$.subscribe(value => this.onPeers(value));
    this.subscriptionSocketStatus = io.socketStatus$.subscribe(value => this.onSocketStatus(value));
  }

  ngOnDestroy() {
    this.subscriptionPeers?.unsubscribe();
    this.subscriptionSocketStatus?.unsubscribe();
  }

  onPeers(value: string[]) {
    this.peer = value[0];
    this.peerQueue = value.slice(1, 10);

    this.changeDetector.markForCheck();
  }
  onSocketStatus(value: SocketStatus) {
    if (value == SocketStatus.CONNECTED)
      this.io.fanEnter(this.paramEvent);
  }

  trackByValue(index: number, value: string) { return value }

}
