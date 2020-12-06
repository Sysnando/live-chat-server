import {Entity, Entity$JSON, Entity$ROW} from "../entity";

export class Stream extends Entity<Stream$ID, Stream$JSON, Stream$ROW> {

  type: Stream$Type;
  channelId: number;
  streamKeyId: number;
  eventId: number;

  constructor(json?: Stream$JSON) {
    super(json);

    if (json) {
      this.type = json.type;
      this.channelId = json.channelId;
      this.streamKeyId = json.streamKeyId;
      this.eventId = json.eventId;
    }
  }

  toJSON(): Stream$JSON {
    return {
      id: this.id,
      type: this.type,
      channelId: this.channelId,
      streamKeyId: this.streamKeyId,
      eventId: this.eventId,
    }
  }

  toROW(): Stream$ROW {
    return {
      id: this.id,
      type: this.type,
      channel_id: this.channelId,
      stream_key_id: this.streamKeyId,
      event_id: this.eventId,
    };
  }

  static fromROW(row: Stream$ROW) {
    return new Stream({
      id: row.id,
      type: row.type,
      channelId: row.channel_id,
      streamKeyId: row.stream_key_id,
      eventId: row.event_id,
    });
  }

}

export type Stream$ID = number;
export type Stream$Type = 'PRINCIPAL' | 'TOP_FAN';

export interface Stream$JSON extends Entity$JSON<Stream$ID> {

  type: Stream$Type;
  channelId: number;
  streamKeyId: number;
  eventId: number;

}

export interface Stream$ROW extends Entity$ROW<Stream$ID> {

  type: Stream$Type;
  channel_id: number;
  stream_key_id: number;
  event_id: number;

}
