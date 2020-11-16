import {Server} from "socket.io";

export class IORoom {

  constructor(
    private readonly IO: Server,
    private readonly ROOM: string
  ) {}

}
