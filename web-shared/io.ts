export enum IOCommand {
  FAN_BROADCAST_START = 'fan.broadcast.start',
  FAN_BROADCAST_STOP = 'fan.broadcast.stop',
  FAN_LEAVE = 'fan.leave',

  QUEUE_ENTER = 'queue.enter',
  QUEUE_LEAVE = 'queue.leave',
  QUEUE_SIZE = 'queue.size',

  MODERATOR_BAN = 'moderator.ban',
  MODERATOR_KICK = 'moderator.kick',

  ROOM_ENTER = 'room.enter',
  ROOM_MESSAGE = 'room.message',
  ROOM_MESSAGE_LOG = 'room.message.log',
  ROOM_SIZE = 'room.size',

  RTC_ANSWER = 'rtc.answer',
  RTC_CANDIDATE = 'rtc.candidate',
  RTC_OFFER = 'rtc.offer',
  RTC_PEERS = 'rtc.peers',

  SPECTATOR_ENTER = 'spectator.enter',
}
