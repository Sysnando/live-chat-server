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
import {filter} from "rxjs/operators";
import {BehaviorSubject} from "rxjs";

export const CHAT_LOG_SIZE = 50;

export const ROOM_SEPARATOR = '$';
export const ROOM_SEPARATOR_CHAT = '$c';

export const ROOM_CAPACITY_MAX = 700;
export const ROOM_CAPACITY_MIN = 300;

export class IORoom {

  public readonly   ID: string;

  private readonly  BANNED: { [key: string]: boolean } = {};

  private readonly  CHAT$dirty: { [key: string]: ChatMessage[] } = {};
  private readonly  CHAT$log: { [key: string]: ChatMessage[] } = {};

  private readonly  FAN$queue: IOUser[] = [];
  private readonly  FAN$spectator: IOUser[] = [];

  private readonly  IO: Server;

  private           EVENT: Event;
  private           EVENT_STREAM: Stream;
  private           EVENT_STREAM_CHANNEL: Channel;
  private           EVENT_STREAM_KEY: StreamKey;

  private           INIT: boolean;
  private           INIT_COMPLETE: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private           FAN$room: IOUser[];
  private           FAN$room$duration: number;
  private           FAN$room$size: number;
  private           FAN$room$tick: number;

  private           RECORDER: IORoomRecorder;

  constructor(ID: string, IO: Server) {
    this.ID = ID;
    this.IO = IO;
  }

  async init(): Promise<this> {
    if (this.INIT) return this.initialized.then(() => this);
        this.INIT = true;

    this.EVENT = await EventRepository.INSTANCE.findOneById(this.ID);
    this.EVENT_STREAM = this.EVENT && await StreamRepository.INSTANCE.findOneByEventAndType(this.EVENT.id, "TOP_FAN");
    this.EVENT_STREAM_CHANNEL = this.EVENT && this.EVENT_STREAM && await ChannelRepository.INSTANCE.findOneById(this.EVENT_STREAM.channelId);
    this.EVENT_STREAM_KEY = this.EVENT && this.EVENT_STREAM && await StreamKeyRepository.INSTANCE.findOneById(this.EVENT_STREAM.streamKeyId);

    if (this.EVENT == undefined)
        throw new Error(`Invalid Event ID: ${ this.ID }`);

    this.FAN$room$duration = this.EVENT.topFansTimer;
    this.FAN$room$size = this.EVENT.topFansQueueSize + 1;
    this.FAN$room$tick = this.EVENT.topFansTimer;
    this.FAN$room = new Array(this.FAN$room$size).fill(undefined);

    this.INIT_COMPLETE.next(true);
    console.log(`Room for Event ${ this.EVENT.id } initialized. Duration: ${ this.FAN$room$duration }, Size: ${ this.FAN$room$size }`);

    return this;
  }

  get initialized(): Promise<boolean> { return new Promise(resolve => this.INIT_COMPLETE.pipe(filter(value => value)).subscribe(() => resolve())) }

  get urlFans() { return this.EVENT_STREAM_CHANNEL.playbackUrl }
  get urlIngest() { return `rtmps://${ this.EVENT_STREAM_CHANNEL.ingestEndpoint }:443/app/${ this.EVENT_STREAM_KEY.value }` }
  get urlSpectator() { return `fans/spectator?${ QUERY_PARAM_EVENT }=${ this.EVENT.id }` }

  async onFanEnter(user: IOUser) {
    await this.initialized;

    if (this.BANNED[user?.ADDRESS] && user.SOCKET.disconnect(true)) return;
    if (this.FAN$room.includes(user) && user) return;

    // Calculate position
    let position = this.FAN$room.findIndex(value => value == undefined);
        position = Math.min(Math.max(position, 3), this.FAN$room$size);

    this.FAN$room.splice(position, 0, user);

    // Notify user & peers
    user?.SOCKET.emit(IOCommand.QUEUE_LEAVE);
    user?.SOCKET.emit(IOCommand.FAN_BROADCAST_START, this.FAN$room$duration * (position - 1));
    this.update$queue$peers();
  }
  async onFanLeave(user: IOUser, graceful: boolean = false) {
    await this.initialized;

    if (this.FAN$room.includes(user) && user)
        this.FAN$room[this.FAN$room.indexOf(user)] = undefined;

    // Notify user & peers
    graceful && user?.SOCKET.emit(IOCommand.FAN_BROADCAST_STOP);
    this.update$queue$peers();
  }

  async onQueueEnter(user: IOUser) {
    await this.initialized;

    if (this.BANNED[user.ADDRESS] && user.SOCKET.disconnect(true)) return;
    if (this.FAN$queue.includes(user)) return;
        this.FAN$queue.push(user);

    user.SOCKET.emit(IOCommand.QUEUE_ENTER);
    user.SOCKET.emit(IOCommand.QUEUE_SIZE, this.queue$size(user));
  }
  async onQueueLeave(user: IOUser) {
    await this.initialized;

    if (this.FAN$queue.includes(user) == false) return;
        this.FAN$queue.splice(this.FAN$queue.indexOf(user, 1), 1);

    user.SOCKET.emit(IOCommand.QUEUE_LEAVE);
  }

  async onModeratorBan(user: IOUser) {
    await this.initialized;

    this.BANNED[user.ADDRESS] = true;

    user.roomLeave();
    user.SOCKET.emit(IOCommand.MODERATOR_BAN);
    user.SOCKET.disconnect();
  }
  async onModeratorKick(user: IOUser) {
    await this.initialized;

    user.SOCKET.emit(IOCommand.MODERATOR_KICK);

    await this.onFanLeave(user);
  }

  async onRoomEnter(user: IOUser) {
    await this.initialized;

    if (this.BANNED[user.ADDRESS] && user.SOCKET.disconnect(true)) return;

    let room = this.chat$room$grow(this.name$chat());
    let roomSize = this.size$chat() + 1;

    // Start recorder if necessary
    if (this.RECORDER == undefined) {
        this.RECORDER = new IORoomRecorder(this);
        this.RECORDER.start();
    }

    // Load chat log
    let log = await this.chat$log$load(room);

    user.SOCKET.join(room);
    user.SOCKET.emit(IOCommand.ROOM_MESSAGE_LOG, log)
    user.SOCKET.emit(IOCommand.ROOM_SIZE, roomSize);
    user.SOCKET.emit(IOCommand.ROOM_VIDEO, this.urlFans);
  }
  async onRoomLeave(user: IOUser) {
    await this.initialized;

    // Leave all related rooms
    user.SOCKET.rooms.forEach(value => value.startsWith(this.ID) && user.SOCKET.leave(value));

    // Stop recorder if necessary
    if (this.RECORDER && this.size$chat() == 0) {
        this.RECORDER.stop();
        this.RECORDER = undefined;
    }

    await this.onFanLeave(user);
    await this.onQueueLeave(user);
  }
  async onRoomMessage(user: IOUser, message: ChatMessage) {
    await this.initialized;

    if (this.BANNED[user.ADDRESS] && user.SOCKET.disconnect(true)) return;

    let room = Array.from(user.SOCKET.rooms).find(value => value.startsWith(this.name$chat()));

    this.IO.in(room).emit(IOCommand.ROOM_MESSAGE, message);
    this.chat$log$push(room, message);
  }

  async onSpectatorEnter(user: IOUser) {
    await this.initialized;

    if (this.BANNED[user.ADDRESS] && user.SOCKET.disconnect(true)) return;
    if (this.FAN$spectator.includes(user)) return;

    this.FAN$spectator.push(user);
    this.update$queue$peers();
  }
  async onSpectatorLeave(user: IOUser) {
    await this.initialized;

    if (this.FAN$spectator.includes(user))
        this.FAN$spectator.splice(this.FAN$spectator.indexOf(user), 1);
  }

  async update$chat$log() { await this.initialized; Utils.objectKeys(this.CHAT$dirty).forEach(value => this.chat$log$persist(`${ value }`)) }
  async update$chat$room() { await this.initialized; this.chat$room$shrink() }
  async update$chat$size() {
    await this.initialized;

    let size = this.size$chat();
    let rooms = this.rooms$chat();
        rooms.forEach(value => this.IO.sockets.in(value).emit(IOCommand.ROOM_SIZE, size));
  }

  async update$queue() {
    await this.initialized;

    if (this.FAN$room$tick = this.FAN$room$tick - 1) return;
        this.FAN$room$tick = this.FAN$room$duration;

    // Take first user from the queue and add it as a Fan
    this.onFanEnter(this.FAN$queue.shift())

    // Notify queue
    this.FAN$queue.forEach(user => user.SOCKET.emit(IOCommand.QUEUE_SIZE, this.queue$size(user)));

    // Remove current broadcasting user from FAN room as their time has ended
    this.onFanLeave(this.FAN$room.shift(), true);
  }
  update$queue$peers() {
    // Notify peers about the presence of each other
    this.FAN$room.forEach(value => value?.SOCKET.emit(IOCommand.RTC_PEERS, this.FAN$spectator.map(value => value.ID)));
    this.FAN$spectator.forEach(value => value.SOCKET.emit(IOCommand.RTC_PEERS, this.FAN$room.map(value => value?.ID)));
    this.FAN$spectator.forEach(value => value.SOCKET.emit(IOCommand.RTC_PEERS_NAMES, this.FAN$room.map(value => value?.NAME)));
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
