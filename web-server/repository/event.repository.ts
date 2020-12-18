import {Repository} from "../repository";
import {Event, Event$ID, Event$JSON, Event$ROW} from "../../web-shared/entity/event.model";

export class EventRepository extends Repository<Event, Event$ID, Event$JSON, Event$ROW> {

  private static INSTANCE$: EventRepository;
  static get INSTANCE() { return this.INSTANCE$ = this.INSTANCE$ || new EventRepository() }

  private constructor() {
    super('event', Event, {
      id: { type: 'INTEGER', primary: true },

      title: { type: 'TEXT' },
      description: { type: 'TEXT' },

      has_chat: { type: 'BOOLEAN' },
      has_donation: { type: 'BOOLEAN' },
      has_topfan: { type: 'BOOLEAN' },

      top_fans_queue_size: { type: 'INTEGER' },
      top_fans_timer: { type: 'INTEGER' },
    });
  }

}
