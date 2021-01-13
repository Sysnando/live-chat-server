import {AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, SimpleChanges} from '@angular/core';
import videojs, {VideoJsPlayerOptions} from 'video.js';

import {
  PlayerEventType,
  PlayerState,
  registerIVSQualityPlugin,
  registerIVSTech,
  VideoJSIVSTech,
  VideoJSQualityPlugin
} from 'amazon-ivs-player';
import {fromEvent, merge, Subscription} from "rxjs";
import {faPlay} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'chat-window-video',
  templateUrl: './chat-window-video.component.html',
  styleUrls: ['./chat-window-video.component.scss'],
})
export class ChatWindowVideoComponent implements AfterViewInit, OnChanges, OnDestroy {

  readonly  faPlay = faPlay;

  @Input()  options: VideoJsPlayerOptions;
  @Input()  src: string;

            player: videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;
  private   playerSubscriptionError: Subscription;
  private   playerSubscriptionUpdate: Subscription;
  private   playerTimeout: any;

  constructor(private changeDetector: ChangeDetectorRef) {}

  get isPlaying() { return this.player?.getIVSPlayer()?.getState() == PlayerState.PLAYING }
  get isBuffering() { return this.player?.getIVSPlayer()?.getState() == PlayerState.BUFFERING }

  ngAfterViewInit() {
    registerIVSTech(videojs, { wasmBinary: '/assets/amazon-ivs/amazon-ivs-wasmworker.min.wasm', wasmWorker: '/assets/amazon-ivs/amazon-ivs-wasmworker.min.js' });
    registerIVSQualityPlugin(videojs);

    this.player = videojs('ushowme-player', this.options) as videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;
    this.player.getIVSPlayer().setAutoplay(true);
    this.player.getIVSPlayer().setMuted(true);
    this.playerSubscriptionError = merge(...[PlayerEventType.AUDIO_BLOCKED, PlayerEventType.ERROR, PlayerEventType.NETWORK_UNAVAILABLE, PlayerEventType.PLAYBACK_BLOCKED].map(value => fromEvent(this.player.getIVSPlayer(), value))).subscribe(() => this.onPlayerError());
    this.playerSubscriptionUpdate = merge(...[PlayerState.BUFFERING, PlayerState.ENDED, PlayerState.IDLE, PlayerState.PLAYING, PlayerState.READY].map(value => fromEvent(this.player.getIVSPlayer(), value))).subscribe(() => this.onPlayerUpdate());

    this.onPlayerSrc();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.src)
        this.onPlayerSrc();
  }

  ngOnDestroy() {
    this.player?.dispose();
    this.playerSubscriptionError?.unsubscribe();
    this.playerSubscriptionUpdate?.unsubscribe();
  }

  onPlayerError() {
    this.playerTimeout = setTimeout(() => this.onPlayerSrc(), 3000);
  }
  onPlayerSrc() {
    if (this.player && this.src)
        this.player.src({ src: this.src, type: 'application/x-mpegURL' });

    this.playerTimeout && clearTimeout(this.playerTimeout);
    this.changeDetector.markForCheck();
  }
  onPlayerUpdate() {
    this.changeDetector.markForCheck();
  }

  play() {
    if (this.player?.getIVSPlayer()?.getState() == PlayerState.ENDED) this.onPlayerSrc();
    else                                                              this.player?.play();
  }

}
