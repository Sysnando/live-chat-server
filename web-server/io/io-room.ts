import {Server} from "socket.io";
import {ChatMessage} from "../../web-shared/entity/chat-message.model";
import {ChatMessageRepository} from "../repository/chat-message.repository";
import {IOCommand} from "../../web-shared/io";
import {Utils} from "../../web-shared/utils";
import {IOUser} from "./io-user";
import {IORoomRecorder} from "./io-room-recorder";
import {Event} from "../../web-shared/entity/event.model";
import {EventRepository} from "../repository/event.repository";
import {StreamRepository} from "../repository/stream.repository";
import {Stream} from "../../web-shared/entity/stream.model";
import {Channel} from "../../web-shared/entity/channel.model";
import {ChannelRepository} from "../repository/channel.repository";
import {StreamKey} from "../../web-shared/entity/stream-key.model";
import {StreamKeyRepository} from "../repository/stream-key.repository";
import {QUERY_PARAM_EVENT} from "../../web-shared/constants";

export const CHAT_LOG_SIZE = 50;

export const FAN_DURATION = 6;
export const FAN_SIZE = 10 + 1;

export const ROOM_SEPARATOR = '$';
export const ROOM_SEPARATOR_CHAT = '$c';

export const ROOM_CAPACITY_MAX = 700;
export const ROOM_CAPACITY_MIN = 300;

export class IORoom {

  public readonly   ID: string;

  private readonly  BANNED: { [key: string]: boolean } = {};

  private readonly  CHAT$dirty: { [key: string]: ChatMessage[] } = {};
  private readonly  CHAT$log: { [key: string]: ChatMessage[] } = {};

  private readonly  FAN$room: IOUser[] = new Array(FAN_SIZE).fill(undefined);
  private readonly  FAN$queue: IOUser[] = [];
  private readonly  FAN$spectator: IOUser[] = [];

  private readonly  IO: Server;

  private           EVENT: Event;
  private           EVENT_STREAM: Stream;
  private           EVENT_STREAM_CHANNEL: Channel;
  private           EVENT_STREAM_KEY: StreamKey;

  private           RECORDER: IORoomRecorder;

  constructor(ID: string, IO: Server) {
    this.ID = ID;
    this.IO = IO;
  }

  async init() {
    if (this.EVENT) return this;
        this.EVENT = await EventRepository.INSTANCE.findOneById(+this.ID);
        this.EVENT_STREAM = this.EVENT && await StreamRepository.INSTANCE.findOneByEventAndType(this.EVENT.id, "TOP_FAN");
        this.EVENT_STREAM_CHANNEL = this.EVENT && this.EVENT_STREAM && await ChannelRepository.INSTANCE.findOneById(this.EVENT_STREAM.channelId);
        this.EVENT_STREAM_KEY = this.EVENT && this.EVENT_STREAM && await StreamKeyRepository.INSTANCE.findOneById(this.EVENT_STREAM.streamKeyId);

    if (this.EVENT == undefined)
        throw new Error('Invalid Event ID');

    console.log(`Event ${ this.EVENT.id } initialized`);
    this.RECORDER = new IORoomRecorder(this);
    this.RECORDER.start();

    return this;
  }

  get urlFans() { return this.EVENT_STREAM_CHANNEL.playbackUrl }
  get urlIngest() { debugger; return `rtmps://${ this.EVENT_STREAM_CHANNEL.ingestEndpoint }:443/app/${ this.EVENT_STREAM_KEY.value }` }
  get urlSpectator() { return `fans/spectator?${ QUERY_PARAM_EVENT }=${ this.EVENT.id }` }

  onFanEnter(user: IOUser) {
    if (this.BANNED[user?.ADDRESS] && user.SOCKET.disconnect(true)) return;
    if (this.FAN$room.includes(user) && user) return;

    this.FAN$room.push(user);
  }
  onFanLeave(user: IOUser) {
    if (this.FAN$room.includes(user) && user)
        this.FAN$room[this.FAN$room.indexOf(user)] = undefined;
  }

  onQueueEnter(user: IOUser) {
    if (this.BANNED[user.ADDRESS] && user.SOCKET.disconnect(true)) return;
    if (this.FAN$queue.includes(user)) return;
        this.FAN$queue.push(user);

    user.SOCKET.emit(IOCommand.QUEUE_ENTER);
    user.SOCKET.emit(IOCommand.QUEUE_SIZE, this.queue$size(user));
  }
  onQueueLeave(user: IOUser) {
    if (this.FAN$queue.includes(user) == false) return;
        this.FAN$queue.splice(this.FAN$queue.indexOf(user, 1), 1);

    user.SOCKET.emit(IOCommand.QUEUE_LEAVE);
  }

  onModeratorBan(user: IOUser) {
    this.BANNED[user.ADDRESS] = true;

    user.roomLeave();
    user.SOCKET.emit(IOCommand.MODERATOR_BAN);
    user.SOCKET.disconnect();
  }
  onModeratorKick(user: IOUser) {
    user.SOCKET.emit(IOCommand.MODERATOR_KICK);

    this.onFanLeave(user);
  }

  onRoomEnter(user: IOUser) {
    if (this.BANNED[user.ADDRESS] && user.SOCKET.disconnect(true)) return;

    let room = this.chat$room$grow(this.name$chat());

    // Load chat log
    this.chat$log$load(room).then(value => {
      user.SOCKET.join(room);
      user.SOCKET.emit(IOCommand.ROOM_MESSAGE_LOG, value)
      user.SOCKET.emit(IOCommand.ROOM_SIZE, this.size$chat());
      user.SOCKET.emit(IOCommand.ROOM_VIDEO, this.urlFans);
    })
  }
  onRoomLeave(user: IOUser) {
    // Leave all related rooms
    user.SOCKET.rooms.forEach(value => value.startsWith(this.ID) && user.SOCKET.leave(value));

    this.onFanLeave(user);
    this.onQueueLeave(user);
  }
  onRoomMessage(user: IOUser, message: ChatMessage) {
    if (this.BANNED[user.ADDRESS] && user.SOCKET.disconnect(true)) return;

    let room = Array.from(user.SOCKET.rooms).find(value => value.startsWith(this.name$chat()));

    this.IO.in(room).emit(IOCommand.ROOM_MESSAGE, message);
    this.chat$log$push(room, message);
  }

  onSpectatorEnter(user: IOUser) {
    if (this.BANNED[user.ADDRESS] && user.SOCKET.disconnect(true)) return;
    if (this.FAN$spectator.includes(user)) return;

    this.FAN$spectator.push(user);
  }
  onSpectatorLeave(user: IOUser) {
    if (this.FAN$spectator.includes(user))
        this.FAN$spectator.splice(this.FAN$spectator.indexOf(user), 1);
  }

  update$chat$log() { Utils.objectKeys(this.CHAT$dirty).forEach(value => this.chat$log$persist(`${ value }`)) }
  update$chat$room() { this.chat$room$shrink() }
  update$chat$size() {
    let size = this.size$chat();
    let rooms = this.rooms$chat();
        rooms.forEach(value => this.IO.sockets.in(value).emit(IOCommand.ROOM_SIZE, size));
  }

  update$queue() {
    let user;

    // Take first user from queue
    user = this.FAN$queue.shift();
    user?.SOCKET.emit(IOCommand.QUEUE_LEAVE);
    user?.SOCKET.emit(IOCommand.FAN_BROADCAST_START, FAN_DURATION * (FAN_SIZE - 1));
    user?.SOCKET.emit(IOCommand.RTC_PEERS, this.FAN$spectator.map(value => value.ID));

    // Notify queue
    this.FAN$queue.forEach(user => user.SOCKET.emit(IOCommand.QUEUE_SIZE, this.queue$size(user)));

    // Add user to FAN room at the end
    this.onFanEnter(user);

    // -------------------------------------------------------

    // Remove first user from FAN room
    user = this.FAN$room.shift();
    user?.SOCKET.emit(IOCommand.FAN_BROADCAST_STOP);

    // Notify peers about the presence of each other
    this.FAN$room.forEach(value => value?.SOCKET.emit(IOCommand.RTC_PEERS, this.FAN$spectator.map(value => value.ID)));
    this.FAN$spectator.forEach(value => value.SOCKET.emit(IOCommand.RTC_PEERS, this.FAN$room.map(value => value?.ID)));
  }

  private chat$log$load(room: string) {
    return this.CHAT$log[room]?.length
      ? new Promise(resolve => resolve(this.CHAT$log[room]))
      : ChatMessageRepository.INSTANCE.findByRoom(room, CHAT_LOG_SIZE)
        .then(value => this.CHAT$log[room] = value?.map(({ from, message, time }) => new ChatMessage({ from, message, time: time.getTime() })) || []); // Store log without the room information to save space
  }
  private chat$log$persist(room: string) {
    let messages = this.CHAT$dirty[room];

    if (this.CHAT$dirty[room]) {
        this.CHAT$dirty[room] = [];
        ChatMessageRepository.INSTANCE.saveAll(messages);
    }
  }
  private chat$log$push(room: string, message: ChatMessage) {
    this.CHAT$log[room] = this.CHAT$log[room] || [];
    this.CHAT$log[room].push(message);
    this.CHAT$log[room].length > CHAT_LOG_SIZE && this.CHAT$log[room].shift();

    message = message.clone();
    message.room = room;

    this.CHAT$dirty[room] = this.CHAT$dirty[room] || [];
    this.CHAT$dirty[room].push(message);
  }

  private chat$room$grow(room: string): string {
    let roomParent = this.name$chatParent(room);
    let roomSize = this.size(room);

    // If the room is empty, it means we just reached the bottom and now we must distribute some of the users from the parent
    if (roomSize == 0 && room != this.name$chat()) {
      this.sockets(roomParent).slice(0, ROOM_CAPACITY_MAX / 2).forEach(value => {
        value.join(room);
        value.leave(roomParent);
      });
    }

    // If the room is not empty but also not full, simply join it
    if (roomSize < ROOM_CAPACITY_MAX)
      return room;

    return this.chat$room$grow(this.name$chatChild(room));
  }
  private chat$room$shrink() {
    let rooms = this.rooms$chat().sort((a, b) => -a.localeCompare(b));

    for (let i = rooms.length - 1; i >= 0; i --) {
      let child = rooms[i];
      let childSize = this.size(child);
      if (childSize > ROOM_CAPACITY_MIN) continue;

      let childParent = this.name$chatParent(child);
      if (childParent == undefined) continue;

      let childParentSize = this.size(childParent);
      if (childParentSize + childSize >= ROOM_CAPACITY_MAX) continue;

      // Merge child room with parent
      this.sockets(child).forEach(value => {
        value.join(childParent);
        value.leave(child);
      });
    }
  }

  private name$chat() { return `${ this.ID }${ ROOM_SEPARATOR_CHAT }` }
  private name$chatChild(room: string) { return `${ room }${ ROOM_SEPARATOR_CHAT }` }
  private name$chatParent(room: string) { return room?.includes(ROOM_SEPARATOR_CHAT) && room != this.name$chat() ? room?.slice(0, room.lastIndexOf(ROOM_SEPARATOR_CHAT)) : undefined }

  private queue$size(user: IOUser) { return this.FAN$queue.indexOf(user) + 1 }

  private rooms() { return Array.from(this.IO.sockets.adapter.rooms.keys()).filter(value => value.startsWith(this.ID)) }
  private rooms$chat() { return Array.from(this.IO.sockets.adapter.rooms.keys()).filter(value => value.startsWith(this.name$chat())) }

  private size(room: string) { return this.IO.sockets.adapter.rooms.get(room)?.size || 0 }
  private size$chat() { return this.rooms().map(value => this.size(value)).reduce((a, b) => a + b, 0) || 0 }

  private sockets(room: string) { return Array.from(this.IO.sockets.adapter.rooms.get(room)).map(value => this.IO.sockets.sockets.get(value)) }

}
