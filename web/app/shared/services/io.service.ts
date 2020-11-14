import { Injectable } from '@angular/core';
import {io, Socket} from 'socket.io-client';
import {BehaviorSubject} from "rxjs";

@Injectable({ providedIn: 'root' })
export class IOService {

  private socket: Socket;
  private socketStatus = new BehaviorSubject<SocketStatus>(SocketStatus.CONNECTING);

  constructor() {
    this.socket = io({ reconnectionAttempts: Number.MAX_SAFE_INTEGER });
    this.socket.on('connect', () => this.socketStatus.next(SocketStatus.CONNECTED));
    this.socket.on('disconnect', () => this.socketStatus.next(SocketStatus.CONNECTING));
    this.socket.on('error', () => this.socketStatus.next(SocketStatus.DISCONNECTED));
  }

  get status() { return this.socketStatus.asObservable() }

}

export enum SocketStatus {
  CONNECTED,
  CONNECTING,
  DISCONNECTED,
}
