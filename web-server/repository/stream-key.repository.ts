import {Repository} from "../repository";
import {StreamKey, StreamKey$ID, StreamKey$JSON, StreamKey$ROW} from "../../web-shared/entity/stream-key.model";

export class StreamKeyRepository extends Repository<StreamKey, StreamKey$ID, StreamKey$JSON, StreamKey$ROW> {

  private static INSTANCE$: StreamKeyRepository;
  static get INSTANCE() { return this.INSTANCE$ = this.INSTANCE$ || new StreamKeyRepository() }

  private constructor() {
    super('stream_key', StreamKey, {
      id: { type: 'INTEGER', primary: true },

      arn: { type: 'TEXT' },
      channel_arn: { type: 'TEXT' },
      value: { type: 'TEXT' },
    });
  }

}
