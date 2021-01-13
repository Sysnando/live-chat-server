import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {IOService, SocketStatus} from "../../shared/services/io.service";
import {Subscription} from "rxjs";
import {RTCService} from "../../shared/services/rtc.service";
import {QUERY_PARAM_EVENT, QUERY_PARAM_NAME} from "../../../../web-shared/constants";
import {adjectives, animals, colors, uniqueNamesGenerator} from "unique-names-generator";
import {ActivatedRoute} from "@angular/router";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-fans-spectator',
  templateUrl: './fans-spectator.component.html',
  styleUrls: ['./fans-spectator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FansSpectatorComponent implements OnDestroy {

              paramEvent: string;

              peers: string[];
              peersNames: string[];

  private     subscriptionPeers: Subscription;
  private     subscriptionPeersNames: Subscription;
  private     subscriptionSocketStatus: Subscription;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private io: IOService,
    private route: ActivatedRoute,
    private rtc: RTCService,
  ) {
    this.paramEvent = route.snapshot.queryParamMap.get(QUERY_PARAM_EVENT);
    this.paramEvent && this.io.connect(environment.TOKEN_SPECTATOR);
    this.paramEvent && this.rtc.reset();

    this.subscriptionPeers = this.io.rtcPeers$.subscribe(value => this.onPeers(value));
    this.subscriptionPeersNames = this.io.rtcPeersNames$.subscribe(value => this.onPeersNames(value));
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
  onPeersNames(value: string[]) {
    this.peersNames = value;
    this.changeDetector.markForCheck();
  }
  onSocketStatus(value: SocketStatus) {
    if (value == SocketStatus.CONNECTED)
      this.io.fanEnter(this.paramEvent);
  }

  peerName(index: number) { return this.peersNames?.[index] }

  trackByValue(index: number, value: string) { return value }

}
