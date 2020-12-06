import {Entity, Entity$JSON, Entity$ROW} from "../entity";

export class Channel extends Entity<Channel$ID, Channel$JSON, Channel$ROW> {

  arn: string;
  authorized: boolean;
  ingestEndpoint: string;
  latencyMode: string;
  name: string;
  playbackUrl: string;
  type: string;

  constructor(json?: Channel$JSON) {
    super(json);

    if (json) {
      this.arn = json.arn;
      this.authorized = json.authorized;
      this.ingestEndpoint = json.ingestEndpoint;
      this.latencyMode = json.latencyMode;
      this.name = json.name;
      this.playbackUrl = json.playbackUrl;
      this.type = json.type;
    }
  }

  toJSON(): Channel$JSON {
    return {
      id: this.id,
      arn: this.arn,
      authorized: this.authorized,
      ingestEndpoint: this.ingestEndpoint,
      latencyMode: this.latencyMode,
      name: this.name,
      playbackUrl: this.playbackUrl,
      type: this.type,
    }
  }

  toROW(): Channel$ROW {
    return {
      id: this.id,
      arn: this.arn,
      authorized: this.authorized,
      ingest_endpoint: this.ingestEndpoint,
      latency_mode: this.latencyMode,
      name: this.name,
      playback_url: this.playbackUrl,
      type: this.type,
    };
  }

  static fromROW(row: Channel$ROW) {
    return new Channel({
      id: row.id,
      arn: row.arn,
      authorized: row.authorized,
      ingestEndpoint: row.ingest_endpoint,
      latencyMode: row.latency_mode,
      name: row.name,
      playbackUrl: row.playback_url,
      type: row.type,
    })
  }

}


export type Channel$ID = number;
export interface Channel$JSON extends Entity$JSON<Channel$ID> {

  arn: string;
  authorized: boolean;
  ingestEndpoint: string;
  latencyMode: string;
  name: string;
  playbackUrl: string;
  type: string;

}

export interface Channel$ROW extends Entity$ROW<Channel$ID> {

  arn: string;
  authorized: boolean;
  ingest_endpoint: string;
  latency_mode: string;
  name: string;
  playback_url: string;
  type: string;

}
