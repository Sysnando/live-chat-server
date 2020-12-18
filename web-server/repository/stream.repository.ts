import {Repository} from "../repository";
import {Stream, Stream$ID, Stream$JSON, Stream$ROW, Stream$Type} from "../../web-shared/entity/stream.model";

export class StreamRepository extends Repository<Stream, Stream$ID, Stream$JSON, Stream$ROW> {

  private static INSTANCE$: StreamRepository;
  static get INSTANCE() { return this.INSTANCE$ = this.INSTANCE$ || new StreamRepository() }

  private constructor() {
    super('stream', Stream, {
      id: { type: 'INTEGER', primary: true },

      type: { type: 'TEXT' },

      channel_id: { type: 'INTEGER' },
      stream_key_id: { type: 'INTEGER' },
      event_id: { type: 'INTEGER' },
    });
  }

  findOneByEventAndType(event: string, type: Stream$Type) {
    return this.find('event_id=$1 AND type=$2', [event, type]).then(value => value?.[0])
  }

}
