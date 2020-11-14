import { Injectable } from '@angular/core';
import {io, Socket} from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class IOService {

  private static socket: Socket;
  private static socketStatus: SocketStatus;

  constructor() {
    IOService.socketStatus = SocketStatus.DISCONNECTED;
    IOService.socket = io();
    //IOService.socket.on('')
  }

}

export enum SocketStatus {
  CONNECTED,
  CONNECTING,
  DISCONNECTED,
}
