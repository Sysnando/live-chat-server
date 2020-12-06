import {Server, Socket} from "socket.io";
import {ChatMessage, ChatMessage$JSON} from "../../web-shared/entity/chat-message.model";
import {Utils} from "../../web-shared/utils";
import {IORoom, ROOM_SEPARATOR} from "./io-room";
import {IOUser} from "./io-user";
import {IOCommand} from "../../web-shared/io";
import * as http from "http";
import {RTCAnswer, RTCCandidate, RTCOffer} from "../../web-shared/rtc";

export class IOServer {

  private static INSTANCE$: IOServer;
  public  static INSTANCE(server?: http.Server) { return IOServer.INSTANCE$ = IOServer.INSTANCE$ || new IOServer(server) }

  private readonly IO: Server;

  private readonly IO$ROOMS: { [key: string]: IORoom } = {};
  private readonly IO$USERS: { [key: string]: IOUser } = {};

  private constructor(server: http.Server) {
    this.IO = new Server(server);
    this.IO.on('connection', (value: Socket) => this.onConnection(value));
  }

  update$chat$log() { this.room$list().forEach(value => value.update$chat$log()) }
  update$chat$room() { this.room$list().forEach(value => value.update$chat$room()) }
  update$chat$size() { this.room$list().forEach(value => value.update$chat$size()) }

  update$queue() { this.room$list().forEach(value => value.update$queue()) }

  private onConnection(socket: Socket) {
    let user = this.IO$USERS[socket.id] = new IOUser(this.IO, socket, (socket.handshake.auth as any)?.token as string);

    socket.on(IOCommand.FAN_LEAVE, () => this.onFanLeave(user));

    socket.on(IOCommand.QUEUE_ENTER, () => this.onQueueEnter(user));
    socket.on(IOCommand.QUEUE_LEAVE, () => this.onQueueLeave(user));

    socket.on(IOCommand.MODERATOR_BAN, (id: string) => this.onModeratorBan(user, id));
    socket.on(IOCommand.MODERATOR_KICK, (id: string) => this.onModeratorKick(user, id));

    socket.on(IOCommand.ROOM_ENTER, (name: string, room: string) => this.onRoomEnter(user, name, this.room$name(room)));
    socket.on(IOCommand.ROOM_MESSAGE, (message: ChatMessage$JSON) => this.onRoomMessage(user, new ChatMessage(message)));

    socket.on(IOCommand.RTC_ANSWER, (value: RTCAnswer) => this.onRtcAnswer(user, value));
    socket.on(IOCommand.RTC_CANDIDATE, (value: RTCCandidate) => this.onRtcCandidate(user, value));
    socket.on(IOCommand.RTC_OFFER, (value: RTCOffer) => this.onRtcOffer(user, value));

    socket.on(IOCommand.SPECTATOR_ENTER, (room: string) => this.onSpectatorEnter(user, this.room$name(room)));
  }

  private onFanLeave(user: IOUser) { user.fanLeave() }

  private onQueueEnter(user: IOUser) { user.queueEnter() }
  private onQueueLeave(user: IOUser) { user.queueLeave() }

  private onModeratorBan(user: IOUser, id: string) { user.moderatorBan(this.user$find(id)) }
  private onModeratorKick(user: IOUser, id: string) { user.moderatorKick(this.user$find(id)) }

  private onRoomEnter(user: IOUser, name: string, room: string) { this.room$findOrCreate(room).init().then(value => user.roomEnter(name, value)) }
  private onRoomMessage(user: IOUser, message: ChatMessage) { user.roomMessage(message) }

  private onRtcAnswer(user: IOUser, value: RTCAnswer) { this.user$find(value.to)?.SOCKET.emit(IOCommand.RTC_ANSWER, { from: user.ID, sdp: value.sdp } as RTCAnswer) }
  private onRtcCandidate(user: IOUser, value: RTCCandidate) { this.user$find(value.to)?.SOCKET.emit(IOCommand.RTC_CANDIDATE, { from: user.ID, sdpCandidate: value.sdpCandidate, sdpMid: value.sdpMid, sdpMLineIndex: value.sdpMLineIndex } as RTCCandidate) }
  private onRtcOffer(user: IOUser, value: RTCOffer) { this.user$find(value.to)?.SOCKET.emit(IOCommand.RTC_OFFER, { from: user.ID, sdp: value.sdp } as RTCOffer) }

  private onSpectatorEnter(user: IOUser, room: string) { user.spectatorEnter(this.room$findOrCreate(room)) }

  private room$find(id: string) { return this.IO$ROOMS[id] }
  private room$findOrCreate(id: string) { return this.IO$ROOMS[id] = this.IO$ROOMS[id] || new IORoom(id, this.IO) }
  private room$list() { return Utils.objectValues(this.IO$ROOMS) }
  private room$name(name: string) { return name?.replace(new RegExp(`/${ ROOM_SEPARATOR }/g`), '') }

  private user$find(id: string) { return this.IO$USERS[id] }
  private user$list() { return Utils.objectValues(this.IO$USERS) }

}
