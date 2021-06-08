import {Server} from "socket.io";

export class IOTicket {

  private readonly  IO: Server;

  constructor(IO: Server) {
    this.IO = IO;
  }

  eventKick(oldKey: string, newKey: string) {
    console.log('kick old: ' + newKey + ' - new:' + newKey)
    this.IO.emit(oldKey, newKey);
  }
}
