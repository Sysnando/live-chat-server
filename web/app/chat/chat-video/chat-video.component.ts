import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import videojs from 'video.js';

import { registerIVSQualityPlugin, registerIVSTech, VideoJSEvents, VideoJSIVSTech, VideoJSQualityPlugin } from 'amazon-ivs-player';

@Component({
  selector: 'chat-video',
  templateUrl: './chat-video.component.html',
  styleUrls: ['./chat-video.component.scss'],
})
export class ChatVideoComponent implements OnInit, OnDestroy {
  @Input() playbackUrl: string;
  @Input() options: {
    autoplay: boolean;
    controls: boolean;
    techOrder?: ['AmazonIVS']
  };
  player?: videojs.Player;

  constructor() {}

  ngOnInit() {

    registerIVSTech(videojs, {
      wasmBinary: '/assets/amazon-ivs/amazon-ivs-wasmworker.min.js',
      wasmWorker: '/assets/amazon-ivs/amazon-ivs-wasmworker.min.wasm',
    });

    const player = videojs(
      'chat-player', this.options, function onPlayerReady() { console.warn('Player is ready to use');}
    ) as videojs.Player & VideoJSIVSTech & VideoJSQualityPlugin;

    registerIVSQualityPlugin(videojs);

    //player.enableIVSQualityPlugin();

    player.src({
      src: this.playbackUrl,
      type: 'application/x-mpegURL',
    });
  }

  ngOnDestroy() {
    // destroy player
    if (this.player) {
      this.player.dispose();
    }
  }

}
