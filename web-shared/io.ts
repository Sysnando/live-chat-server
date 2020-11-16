export enum IOCommand {
  FANS_READY = 'fans.stream.ready',
  FANS_START = 'fans.stream.start',
  FANS_STOP = 'fans.stream.stop',

  QUEUE_JOIN = 'queue.join',
  QUEUE_LEAVE = 'queue.leave',
  QUEUE_SIZE = 'queue.size',

  ROOM_JOIN = 'room.join',
  ROOM_MESSAGE = 'room.message',
  ROOM_MESSAGE_LOG = 'room.message.log',
  ROOM_SIZE = 'room.size',
}
