import { Injectable } from '@angular/core';
import {io, Socket} from 'socket.io-client';
import {BehaviorSubject} from "rxjs";
import {ChatCommand} from "../../../../web-shared/enum/chat-command";

@Injectable({ providedIn: 'root' })
export class IOService {

  private socket: Socket;
  private socketStatus = new BehaviorSubject<SocketStatus>(SocketStatus.CONNECTING);

  private roomSize = new BehaviorSubject<number>(0);

  constructor() {
    this.socket = io({ reconnectionAttempts: Number.MAX_SAFE_INTEGER });
    this.socket.on('connect', () => this.socketStatus.next(SocketStatus.CONNECTED));
    this.socket.on('disconnect', () => this.socketStatus.next(SocketStatus.CONNECTING));
    this.socket.on('error', () => this.socketStatus.next(SocketStatus.DISCONNECTED));

    this.socket.on(ChatCommand.SIZE, (value: number) => this.roomSize.next(value));
  }

  get size() { return this.roomSize.asObservable() }
  get status() { return this.socketStatus.asObservable() }

  join(room: string) {
    this.socket.emit(ChatCommand.JOIN, room);
  }

  send(message: string) {
    this.socket.send(message);
  }

}

export enum SocketStatus {
  CONNECTED,
  CONNECTING,
  DISCONNECTED,
}
