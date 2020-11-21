import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {IOService, SocketStatus} from "../../shared/services/io.service";
import {Subscription} from "rxjs";
import {RTCService} from "../../shared/services/rtc.service";

@Component({
  selector: 'app-fans-spectator',
  templateUrl: './fans-spectator.component.html',
  styleUrls: ['./fans-spectator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FansSpectatorComponent implements OnDestroy {

  active: boolean;

  peers: string[];

  private subscriptionPeers: Subscription;
  private subscriptionSocketStatus: Subscription;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private io: IOService,
    private rtc: RTCService,
  ) {
    this.io.connect('spectator'); // TODO: use hard-coded token with a spectator role or something, no expiration. on the server only let localhost users connect with it
    this.rtc.reset();

    this.subscriptionPeers = this.io.rtcPeers$.subscribe(value => this.onPeers(value));
    this.subscriptionSocketStatus = io.socketStatus$.subscribe(value => this.onSocketStatus(value));
  }

  ngOnDestroy() {
    this.subscriptionPeers?.unsubscribe();
    this.subscriptionSocketStatus?.unsubscribe();
  }

  onPeers(value: string[]) {
    this.peers = value;
    this.changeDetector.markForCheck();
  }
  onSocketStatus(value: SocketStatus) {
    if (value == SocketStatus.CONNECTED)
      this.io.fanEnter('miku'); // TODO: use the query params
  }

  trackByValue(index: number, value: string) { return value }

}
