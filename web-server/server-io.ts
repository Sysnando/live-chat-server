import {Server, Socket} from "socket.io";
import * as http from "http";
import {ChatCommand} from "../web-shared/chat";
import {ChatMessage, ChatMessage$JSON} from "../web-shared/entity/chat-message.model";
import {ChatMessageRepository} from "./repository/chat-message.repository";
import {Utils} from "../web-shared/utils";

export const CHAT_LOG_SIZE = 50;

export const ROOM_SEPARATOR = '$';
export const ROOM_SEPARATOR_CHILD = '$c';
export const ROOM_SEPARATOR_FANS = '$f';

export const ROOM_CAPACITY_MAX = 700;
export const ROOM_CAPACITY_MIN = 300;

export class ServerIO {

  private static INSTANCE$: ServerIO;
  public  static INSTANCE(server?: http.Server) { return ServerIO.INSTANCE$ = ServerIO.INSTANCE$ || new ServerIO(server) }

  private readonly IO: Server;

  private readonly CHAT$dirty: { [key: string]: ChatMessage[] } = {};
  private readonly CHAT$log: { [key: string]: ChatMessage[] } = {};

  private constructor(server: http.Server) {
    this.IO = new Server(server);
    this.IO.on('connection', (value: Socket) => this.onConnection(value));
  }

  balancer$update() {
    this.balancer$roomRoot().forEach(value => this.balancer$shrink(value));
  }

  chat$persist() {
    Utils.objectKeys(this.CHAT$dirty)
      .filter(key => this.CHAT$dirty[key]?.length)
      .forEach(key => {
        let messages = this.CHAT$dirty[key];

        ChatMessageRepository.INSTANCE.saveAll(messages)
        this.CHAT$dirty[key] = [];
      });
  }

  broadcast$size() {
    let sizeByRoot = this.balancer$roomRoot().reduce((acc, value) => { acc[value] = this.balancer$roomRootSize(value); return acc }, {} as any);

    // Send to each room the root's size
    Array
      .from(this.IO.sockets.adapter.rooms.keys())
      .forEach(value => this.IO.sockets.in(value).emit(ChatCommand.ROOM_SIZE, sizeByRoot[this.room$root(value)]));
  }

  private balancer$grow(room: string): string {
    let roomRoot = this.room$root(room);
    let roomSize = this.room$size(room);

    // If the room is empty, it means we just reached the bottom and now we must distribute some of the users from the parent
    if (roomSize == 0 && roomRoot != room) {
      this.room$sockets(this.room$parent(room)).slice(0, ROOM_CAPACITY_MAX / 2).forEach(value => {
        value.join(room);
        value.leave(this.room$parent(room));
      });
    }

    // If the room is not empty but also not full, simply join it
    if (roomSize < ROOM_CAPACITY_MAX)
      return room;

    return this.balancer$grow(this.room$child(room));
  }
  private balancer$shrink(room: string) {
    let children = this.balancer$roomChildren(room);
        children = children.sort((a, b) => -a.localeCompare(b));

    for (let i = children.length - 1; i >= 0; i --) {
      let child = children[i];
      let childSize = this.room$size(child);
      if (childSize > ROOM_CAPACITY_MIN) continue;

      let childParent = this.room$parent(child);
      let childParentSize = this.room$size(childParent);
      if (childParentSize + childSize >= ROOM_CAPACITY_MAX) continue;

      // Merge child room with parent
      this.room$sockets(child).forEach(value => {
        value.join(childParent);
        value.leave(child);
      });
    }
  }
  private balancer$roomChildren(room: string) { return Array.from(this.IO.sockets.adapter.rooms.keys()).filter(value => value.startsWith(this.room$child(room))) }
  private balancer$roomRoot() { return Array.from(this.IO.sockets.adapter.rooms.keys()).filter(value => !value.includes(ROOM_SEPARATOR_CHILD) && !value.includes(ROOM_SEPARATOR_FANS)) }
  private balancer$roomRootSize(room: string) { return this.room$size(room) + this.balancer$roomChildren(room)?.map(value => this.room$size(value)).reduce((a, b) => a + b, 0) || 0 }

  private chat$load(room: string) { return this.CHAT$log[room]?.length ? new Promise(resolve => resolve(this.CHAT$log[room])) : ChatMessageRepository.INSTANCE.findByRoom(room, CHAT_LOG_SIZE).then(value => this.CHAT$log[room] = value || []) }
  private chat$push(room: string, message: ChatMessage) {
    this.CHAT$log[room] = this.CHAT$log[room] || [];
    this.CHAT$log[room].push(message);
    this.CHAT$log[room].length > CHAT_LOG_SIZE && this.CHAT$log[room].shift();

    message = message.clone();
    message.room = room;

    this.CHAT$dirty[room] = this.CHAT$dirty[room] || [];
    this.CHAT$dirty[room].push(message);
  }

  private room$child(room: string) { return `${ room }${ ROOM_SEPARATOR_CHILD }` }
  private room$name(room: string) { return room?.replace(new RegExp(`/${ ROOM_SEPARATOR }/g`), '') }
  private room$parent(room: string) { return room?.includes(ROOM_SEPARATOR_CHILD) ? room?.slice(0, room.lastIndexOf(ROOM_SEPARATOR_CHILD)) : room }
  private room$root(room: string) { return room?.includes(ROOM_SEPARATOR_CHILD) ? room?.slice(0, room.indexOf(ROOM_SEPARATOR_CHILD)) : room }
  private room$size(room: string) { return this.IO.sockets.adapter.rooms.get(room)?.size || 0 }
  private room$sockets(room: string) { return Array.from(this.IO.sockets.adapter.rooms.get(room)).map(value => this.IO.sockets.sockets.get(value)) }

  private onConnection(socket: Socket) {
    socket.on(ChatCommand.ROOM_JOIN, (room: string) => this.onRoomJoin(socket, room));
    socket.on(ChatCommand.ROOM_MESSAGE, (message: ChatMessage$JSON) => this.onRoomMessage(socket, new ChatMessage(message)));
  }

  private onRoomJoin(socket: Socket, room: string) {
    room = this.room$name(room);

    // Leave all rooms
    socket.rooms.forEach(room => socket.leave(room));

    // Join the requested room
    socket.join(room = this.balancer$grow(room));

    // Send room size & chat log
    this.chat$load(room).then(value => {
      socket.emit(ChatCommand.ROOM_SIZE, this.balancer$roomRootSize(this.room$root(room)));
      socket.emit(ChatCommand.ROOM_MESSAGE_LOG, value)
    });
  }
  private onRoomMessage(socket: Socket, message: ChatMessage) {
    message.time = new Date();

    let room = Array.from(socket.rooms)?.filter(value => !value.includes(ROOM_SEPARATOR_FANS))?.[0];
    if (room) {
      this.IO.in(room).emit(ChatCommand.ROOM_MESSAGE, message);
      this.chat$push(room, message);
    }
  }

}
