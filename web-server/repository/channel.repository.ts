import {Repository} from "../repository";
import {Channel, Channel$ID, Channel$JSON, Channel$ROW} from "../../web-shared/entity/channel.model";

export class ChannelRepository extends Repository<Channel, Channel$ID, Channel$JSON, Channel$ROW> {

  private static INSTANCE$: ChannelRepository;
  static get INSTANCE() { return this.INSTANCE$ = this.INSTANCE$ || new ChannelRepository() }

  private constructor() {
    super('channel', Channel, {
      id: { type: 'INTEGER', primary: true },

      arn: { type: 'TEXT' },
      authorized: { type: 'BOOLEAN' },
      ingest_endpoint: { type: 'TEXT' },
      latency_mode: { type: 'TEXT' },
      name: { type: 'TEXT' },
      playback_url: { type: 'TEXT' },
      type: { type: 'TEXT' },
    });
  }

}
