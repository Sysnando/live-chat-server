import {Repository} from "../repository";
import {Event, Event$ID, Event$JSON, Event$ROW} from "../../web-shared/entity/event.model";

export class EventRepository extends Repository<Event, Event$ID, Event$JSON, Event$ROW> {

  private static INSTANCE$: EventRepository;
  static get INSTANCE() { return this.INSTANCE$ = this.INSTANCE$ || new EventRepository() }

  private constructor() {
    super('event', Event, {
      id: { type: 'INTEGER', primary: true },

      event_date: { type: 'TIMESTAMP' },
      duration: { type: 'INTEGER' },

      title: { type: 'TEXT' },
      description: { type: 'TEXT' },

      accept_donation: { type: 'BOOLEAN' },
      accept_chat: { type: 'BOOLEAN' },
      paid: { type: 'BOOLEAN' },

      twitter: { type: 'TEXT' },
      facebook: { type: 'TEXT' },
      youtube: { type: 'TEXT' },

      highlight_img: { type: 'TEXT' },
      highlight_img_content_type: { type: 'TEXT' },

      artist_id: { type: 'INTEGER' },
    });
  }

}
