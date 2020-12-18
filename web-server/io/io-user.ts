import {Server, Socket} from "socket.io";
import {ChatMessage} from "../../web-shared/entity/chat-message.model";
import {IORoom} from "./io-room";
import jwt from 'jsonwebtoken';
import {JWT_SECRET} from "../../web-shared/constants";

export class IOUser {

  public readonly   ADDRESS: string;
  public readonly   ID: string;
  public readonly   SOCKET: Socket;

  private readonly  IO: Server;
  private           NAME: string;
  private           ROOM: IORoom;
  private readonly  ROLES: IOUserRole[];

  constructor(IO: Server, SOCKET: Socket) {
    this.ADDRESS = SOCKET.handshake.address.slice(SOCKET.handshake.address.lastIndexOf(':') + 1);
    this.ID = SOCKET.id;
    this.IO = IO;

    try {
      let TOKEN = (SOCKET.handshake.auth as any)?.token as string;
      let TOKEN_DECODED = TOKEN && jwt.verify(TOKEN, Buffer.from(JWT_SECRET, 'base64')) as { sub: string, auth: string, exp: number };

      // Decode ROLES
      this.ROLES = TOKEN_DECODED?.auth?.split(',') as IOUserRole[];
    } catch (error) { }

    this.SOCKET = SOCKET;
    this.SOCKET.on('disconnect', () => this.roomLeave());
  }

  fanLeave() { this.ROOM?.onFanLeave(this) }

  isRole(role: IOUserRole) { return this.ROLES?.length && this.ROLES.includes(role) }

  moderatorBan(user: IOUser) {
    if (this.isRole(IOUserRole.ROLE_MODERATOR) && user)
        this.ROOM?.onModeratorBan(user);
  }
  moderatorKick(user: IOUser) {
    if (this.isRole(IOUserRole.ROLE_MODERATOR) && user)
        this.ROOM?.onModeratorKick(user);
  }

  queueEnter() { this.ROOM?.onQueueEnter(this) }
  queueLeave() { this.ROOM?.onQueueLeave(this) }

  roomEnter(name: string, room: IORoom) {
    if (room.ID == this.ROOM?.ID) return;

    // Leave previous room
    this.roomLeave();

    this.NAME = name;
    this.ROOM = room;

    // Join the requested room
    this.ROOM?.onRoomEnter(this);
  }
  roomMessage(message: ChatMessage) {
    message.from = this.NAME;
    message.time = new Date();

    this.ROOM?.onRoomMessage(this, message);
  }
  roomLeave() {
    this.ROOM?.onFanLeave(this);
    this.ROOM?.onQueueLeave(this);
    this.ROOM?.onRoomLeave(this);
    this.ROOM?.onSpectatorLeave(this);
  }

  spectatorEnter(room: IORoom) {
    if (room.ID == this.ROOM?.ID) return;
    if (this.isRole(IOUserRole.ROLE_MODERATOR) != true && this.isRole(IOUserRole.ROLE_SPECTATOR) != true) return;

    // Leave previous room
    this.roomLeave();

    this.ROOM = room;

    // Join the requested room
    room.onSpectatorEnter(this);
  }

}

export enum IOUserRole {
  ROLE_MODERATOR = 'ROLE_MODERATOR',
  ROLE_SPECTATOR = 'ROLE_SPECTATOR',
}
