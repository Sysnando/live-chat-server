import {Entity, Entity$JSON, Entity$ROW} from "../entity";
import {Utils} from "../utils";

export class Event extends Entity<Event$ID, Event$JSON, Event$ROW> {

  eventDate: Date;
  duration: number;

  title: string;
  description: string;

  acceptDonation: boolean;
  acceptChat: boolean;
  paid: boolean;

  twitter: string;
  facebook: string;
  youtube: string;

  highlightImg: string;
  highlightImgContentType: string;

  artistId: number;

  constructor(json?: Event$JSON) {
    super(json);

    if (json) {
      this.eventDate = Utils.dateFromString(json.eventDate),
      this.duration = json.duration,

      this.title = json.title;
      this.description = json.description;

      this.acceptDonation = json.acceptDonation;
      this.acceptChat = json.acceptChat;
      this.paid = json.paid;

      this.twitter = json.twitter;
      this.facebook = json.facebook;
      this.youtube = json.youtube;

      this.highlightImg = json.highlightImg;
      this.highlightImgContentType = json.highlightImgContentType;

      this.artistId = json.artistId;
    }
  }

  toJSON(): Event$JSON {
    return {
      id: this.id,

      eventDate: Utils.dateToString(this.eventDate),
      duration: this.duration,

      title: this.title,
      description: this.description,

      acceptDonation: this.acceptDonation,
      acceptChat: this.acceptChat,
      paid: this.paid,

      twitter: this.twitter,
      facebook: this.facebook,
      youtube: this.youtube,

      highlightImg: this.highlightImg,
      highlightImgContentType: this.highlightImgContentType,

      artistId: this.artistId,
    }
  }

  toROW(): Event$ROW {
    return {
      id: this.id,

      event_date: this.eventDate,
      duration: this.duration,

      title: this.title,
      description: this.description,

      accept_donation: this.acceptDonation,
      accept_chat: this.acceptChat,
      paid: this.paid,

      twitter: this.twitter,
      facebook: this.facebook,
      youtube: this.youtube,

      highlight_img: this.highlightImg,
      highlight_img_content_type: this.highlightImgContentType,

      artist_id: this.artistId,
    }
  }

  static fromROW(row: Event$ROW) {
    return new Event({
      id: row.id,

      eventDate: Utils.dateToString(row.event_date),
      duration: row.duration,

      title: row.title,
      description: row.description,

      acceptDonation: row.accept_donation,
      acceptChat: row.accept_chat,
      paid: row.paid,

      twitter: row.twitter,
      facebook: row.facebook,
      youtube: row.youtube,

      highlightImg: row.highlight_img,
      highlightImgContentType: row.highlight_img_content_type,

      artistId: row.artist_id,
    });
  }

}

export type Event$ID = number;
export interface Event$JSON extends Entity$JSON<Event$ID> {

  eventDate: string;
  duration: number;

  title: string;
  description: string;

  acceptDonation: boolean;
  acceptChat: boolean;
  paid: boolean;

  twitter: string;
  facebook: string;
  youtube: string;

  highlightImg: string;
  highlightImgContentType: string;

  artistId: number;

}

export interface Event$ROW extends Entity$ROW<Event$ID> {

  event_date: Date;
  duration: number;

  title: string;
  description: string;

  accept_donation: boolean;
  accept_chat: boolean;
  paid: boolean;

  twitter: string;
  facebook: string;
  youtube: string;

  highlight_img: string;
  highlight_img_content_type: string;

  artist_id: number;

}
