import {Component, Input, OnDestroy, OnChanges, SimpleChanges, AfterViewInit} from '@angular/core';
import videojs, {VideoJsPlayerOptions} from 'video.js';

import { registerIVSQualityPlugin, registerIVSTech, VideoJSIVSTech, VideoJSQualityPlugin } from 'amazon-ivs-player';

@Component({
  selector: 'chat-window-video',
  templateUrl: './chat-window-video.component.html',
  styleUrls: ['./chat-window-video.component.scss'],
})
export class ChatWindowVideoComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() src: string;
  @Input() options: VideoJsPlayerOptions;

  player: videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;

  constructor() {}

  ngAfterViewInit() {

    registerIVSTech(videojs, { wasmBinary: '/assets/amazon-ivs/amazon-ivs-wasmworker.min.wasm', wasmWorker: '/assets/amazon-ivs/amazon-ivs-wasmworker.min.js' });
    registerIVSQualityPlugin(videojs);

    this.player = videojs('ushowme-player', this.options, () => this.onPlayerReady()) as videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;
    this.player.enableIVSQualityPlugin();
    this.onPlayerSrc();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.src)
        this.onPlayerSrc();
  }

  ngOnDestroy() {
    this.player?.dispose();
  }

  onPlayerReady() {
    console.log('onPlayerReady')
    this.player?.play();
  }
  onPlayerSrc() {
    if (this.player && this.src)
        this.player.src({ src: this.src, type: 'application/x-mpegURL' });
  }

}

interface ChatWindowVideoOptions {
  autoplay: boolean;
  controls: boolean;
  muted: boolean;
  techOrder?: string[];
}
