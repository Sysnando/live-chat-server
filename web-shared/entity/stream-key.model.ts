import {Entity, Entity$JSON, Entity$ROW} from "../entity";

export class StreamKey extends Entity<StreamKey$ID, StreamKey$JSON, StreamKey$ROW> {

  arn: string;
  channelArn: string;
  value: string;

  constructor(json?: StreamKey$JSON) {
    super(json);

    if (json) {
      this.arn = json.arn;
      this.channelArn = json.channelArn;
      this.value = json.value;
    }
  }

  toJSON(): StreamKey$JSON {
    return {
      id: this.id,
      arn: this.arn,
      channelArn: this.channelArn,
      value: this.value,
    };
  }

  toROW(): StreamKey$ROW {
    return {
      id: this.id,
      arn: this.arn,
      channel_arn: this.channelArn,
      value: this.value,
    };
  }

  static fromROW(row: StreamKey$ROW) {
    return new StreamKey({
      id: row.id,
      arn: row.arn,
      channelArn: row.channel_arn,
      value: row.value,
    })
  }

}

export type StreamKey$ID = number;

export interface StreamKey$JSON extends Entity$JSON<StreamKey$ID> {
  arn: string;
  channelArn: string;
  value: string;
}

export interface StreamKey$ROW extends Entity$ROW<StreamKey$ID> {
  arn: string;
  channel_arn: string;
  value: string;
}
