import {Entity, Entity$JSON, Entity$ROW} from "../entity";

export class Event extends Entity<Event$ID, Event$JSON, Event$ROW> {

  title: string;
  description: string;

  hasChat: boolean;
  hasDonation: boolean;
  hasTopfan: boolean;

  topFansQueueSize: number;
  topFansTimer: number;

  constructor(json?: Event$JSON) {
    super(json);

    if (json) {
      this.title = json.title;
      this.description = json.description;

      this.hasChat = json.hasChat;
      this.hasDonation = json.hasDonation;
      this.hasTopfan = json.hasTopfan;

      this.topFansQueueSize = json.topFansQueueSize;
      this.topFansTimer = json.topFansTimer;
    }
  }

  toJSON(): Event$JSON {
    return {
      id: this.id,

      title: this.title,
      description: this.description,

      hasChat: this.hasChat,
      hasDonation: this.hasDonation,
      hasTopfan: this.hasTopfan,

      topFansQueueSize: this.topFansQueueSize,
      topFansTimer: this.topFansTimer,
    }
  }

  toROW(): Event$ROW {
    return {
      id: this.id,

      title: this.title,
      description: this.description,

      has_chat: this.hasChat,
      has_donation: this.hasDonation,
      has_topfan: this.hasTopfan,

      top_fans_queue_size: this.topFansQueueSize,
      top_fans_timer: this.topFansTimer,
    }
  }

  static fromROW(row: Event$ROW) {
    return new Event({
      id: row.id,

      title: row.title,
      description: row.description,

      hasChat: row.has_chat,
      hasDonation: row.has_donation,
      hasTopfan: row.has_topfan,

      topFansQueueSize: row.top_fans_queue_size,
      topFansTimer: row.top_fans_timer,
    });
  }

}

export type Event$ID = string;
export interface Event$JSON extends Entity$JSON<Event$ID> {

  title: string;
  description: string;

  hasChat: boolean;
  hasDonation: boolean;
  hasTopfan: boolean;

  topFansQueueSize: number;
  topFansTimer: number;

}

export interface Event$ROW extends Entity$ROW<Event$ID> {

  title: string;
  description: string;

  has_chat: boolean;
  has_donation: boolean;
  has_topfan: boolean;

  top_fans_queue_size: number;
  top_fans_timer: number;

}
