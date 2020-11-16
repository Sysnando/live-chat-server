import { Injectable } from '@angular/core';
import {io, Socket} from 'socket.io-client';
import {BehaviorSubject, Subject} from "rxjs";
import {IOCommand} from "../../../../web-shared/io";
import {ChatMessage, ChatMessage$JSON} from "../../../../web-shared/entity/chat-message.model";

@Injectable({ providedIn: 'root' })
export class IOService {

  private name: string;

  private roomMessage = new Subject<ChatMessage>();
  private roomSize = new BehaviorSubject<number>(0);

  private socket: Socket;
  private socketStatus = new BehaviorSubject<SocketStatus>(SocketStatus.CONNECTING);

  constructor() {
    this.socket = io({ reconnectionAttempts: Number.MAX_SAFE_INTEGER });
    this.socket.on('connect', () => this.socketStatus.next(SocketStatus.CONNECTED));
    this.socket.on('disconnect', () => this.socketStatus.next(SocketStatus.CONNECTING));
    this.socket.on('error', () => this.socketStatus.next(SocketStatus.DISCONNECTED));

    this.socket.on(IOCommand.ROOM_MESSAGE, (value: ChatMessage$JSON) => this.roomMessage.next(new ChatMessage(value)));
    this.socket.on(IOCommand.ROOM_MESSAGE_LOG, (value: ChatMessage$JSON[]) => value?.length && value.forEach(value => this.roomMessage.next(new ChatMessage(value))));
    this.socket.on(IOCommand.ROOM_SIZE, (value: number) => this.roomSize.next(value));
  }

  get roomMessage$() { return this.roomMessage.asObservable() }
  get roomSize$() { return this.roomSize.asObservable() }

  get socketStatus$() { return this.socketStatus.asObservable() }

  queueJoin() {
    this.socket.emit(IOCommand.QUEUE_JOIN);
  }
  queueLeave() {
    this.socket.emit(IOCommand.QUEUE_LEAVE);
  }

  roomJoin(name: string, room: string) {
    this.name = name;

    this.socket.emit(IOCommand.ROOM_JOIN, room);
  }
  roomSend(message: string) {
    let chat = new ChatMessage();
        chat.from = this.name;
        chat.message = message;

    this.socket.emit(IOCommand.ROOM_MESSAGE, chat);
  }

}

export enum SocketStatus {
  CONNECTED,
  CONNECTING,
  DISCONNECTED,
}
