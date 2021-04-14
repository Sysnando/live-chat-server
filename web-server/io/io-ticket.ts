import {Server} from "socket.io";

export class IOTicket {

  private readonly  IO: Server;

  constructor(IO: Server) {
    this.IO = IO;
  }

  eventKick(OLD: string) {
    console.log('kick old token: ' + OLD)
    this.IO.emit(OLD, "Kick the older device");
  }
}
