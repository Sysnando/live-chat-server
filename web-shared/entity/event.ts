import {Entity} from "../entity";

export class Event extends Entity<Event$JSON, Event$ROW> {

  constructor(json?: Event$JSON) {
    super(json)
  }

  toJSON(): Event$JSON {
    return {
      // TODO:
    }
  }

  toROW(): Event$ROW {
    return {
      // TODO:
    }
  }

  static fromROW(row: Event$ROW) {
    return new Event({
      // TODO:
    });
  }

}

export interface Event$JSON {

}

export interface Event$ROW {

}
