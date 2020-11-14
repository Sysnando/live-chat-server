import {Server, Socket} from "socket.io";
import * as http from "http";
import {ChatCommand} from "../web-shared/enum/chat-command";

export const ROOM_SEPARATOR = '$';
export const ROOM_SEPARATOR_CHILD = '$c';

export const ROOM_CAPACITY = 1000;

export class ServerIO {

  private static INSTANCE$: ServerIO;
  public  static INSTANCE(server?: http.Server) { return ServerIO.INSTANCE$ = ServerIO.INSTANCE$ || new ServerIO(server) }

  private readonly io: Server;

  constructor(server: http.Server) {
    this.io = new Server(server);
    this.io.on('connection', (value: Socket) => this.onConnection(value));
  }

  broadcast$size() {
    this.io.sockets.adapter.rooms
      .forEach((sockets, room) => sockets
        .forEach(socket => this.io.sockets.sockets.get(socket).emit(ChatCommand.SIZE, sockets.size)))
  }

  async balancer$grow(room: string): Promise<string> {
    let roomSize = await this.room$size(room);

    // If the room is empty, it means we just reached the bottom and now we must distribute some of the users from the parent
    if (roomSize == 0)
      this.room$sockets(this.room$parent(room)).slice(0, ROOM_CAPACITY / 2).forEach(value => {
        value.join(room);
        value.leave(this.room$parent(room));
      });

    // If the room is not empty but also not full, simply join it
    if (roomSize < ROOM_CAPACITY)
      return room;

    return await this.balancer$grow(`${ room }${ ROOM_SEPARATOR_CHILD }`)
  }
  balancer$rooms(room: string) {
    return Array.from(this.io.sockets.adapter.rooms.keys()).filter(value => value.slice(0, value.indexOf(ROOM_SEPARATOR_CHILD)) == room);
  }

  private async room$join(socket: Socket, room: string) {
    // Leave all rooms
    socket.rooms.forEach(room => socket.leave(room));

    // Join the requested room
    socket.join(await this.balancer$grow(room));

    // Send room size
    socket.emit(ChatCommand.SIZE, await this.room$size(room));
  }
  private room$name(room: string) { return room?.replace(new RegExp(`/${ ROOM_SEPARATOR }/g`), '') }
  private room$parent(room: string) { return room?.slice(0, room.lastIndexOf(ROOM_SEPARATOR_CHILD)) }
  private room$size(room: string) { return Array.from(this.io.sockets.in(room).sockets.values()).length }
  private room$sockets(room: string) { return Array.from(this.io.sockets.in(room).sockets.values()) }


  private onConnection(socket: Socket) {
    socket.on(ChatCommand.JOIN, (room: string) => this.room$join(socket, room));
  }

}
