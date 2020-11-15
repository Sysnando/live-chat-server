import {Repository} from "../repository";
import {
  ChatMessage,
  ChatMessage$ID,
  ChatMessage$JSON,
  ChatMessage$ROW
} from "../../web-shared/entity/chat-message.model";

export class ChatMessageRepository extends Repository<ChatMessage, ChatMessage$ID, ChatMessage$JSON, ChatMessage$ROW> {

  private static INSTANCE$: ChatMessageRepository;
  static get INSTANCE() { return this.INSTANCE$ = this.INSTANCE$ || new ChatMessageRepository() }

  private constructor() {
    super('chat_messages', ChatMessage, {
      from: { type: 'TEXT' },

      message: { type: 'TEXT' },

      room: { type: 'TEXT', index: true },
      time: { type: 'TIMESTAMP', index: true },
    });
  }

  findByRoom(room: string, n: number) {
    return this.find(`room=$1 ORDER BY time DESC LIMIT ${ n }`, [room]).then(value => value?.reverse());
  }

}
