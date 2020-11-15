import {Entity, Entity$JSON, Entity$ROW} from "../entity";

export class ChatMessage extends Entity<ChatMessage$ID, ChatMessage$JSON, ChatMessage$ROW> {

  from: string;
  message: string;
  room: string;
  time: Date;

  constructor(json?: ChatMessage$JSON) {
    super(json);

    if (json) {
      this.from = json.from;
      this.message = json.message;
      this.room = json.room;
      this.time = new Date(json.time);
    }
  }

  toJSON(): ChatMessage$JSON {
    return {
      from: this.from,
      message: this.message,
    //room: this.room,
      time: this.time?.getTime(),
    };
  }

  toROW(): ChatMessage$ROW {
    return {
      from: this.from,
      message: this.message,
      room: this.room,
      time: this.time,
    };
  }

  static fromROW(row: ChatMessage$ROW) {
    return new ChatMessage({
      from: row.from,
      message: row.message,
      room: row.room,
      time: row.time?.getTime(),
    })
  }

}

export type ChatMessage$ID = void;
export interface ChatMessage$JSON extends Entity$JSON<ChatMessage$ID> {
  from: string;
  message: string;
  room?: string;
  time?: number;
}

export interface ChatMessage$ROW extends Entity$ROW<ChatMessage$ID> {
  from: string;
  message: string;
  room: string;
  time: Date;
}
