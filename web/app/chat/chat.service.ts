import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ChatService {

  constructor() { }

  /*
  public sendMessage(chatMsg: ChatMessage) {
    this.socket.emit('message', chatMsg);
  }

  public joinChatRoom(chatMsg: ChatMessage) {
    this.socket.emit('join', chatMsg);
  }

  public getMessages = (chatMsg) => {
    return Observable.create((observer) => {
      this.socket.on(chatMsg.name, (message) => {
        observer.next(message);
      });
    });
  }

  public getOnline = (chatMsg) => {
    return Observable.create((observer) => {
      this.socket.on(chatMsg.name + '-online-users', (online) => {
        observer.next(online);
      });
    });
  }

   */
}

/*
export class ChatMessage {
  name: string;
  user: string;

  color: string;
  time: string;
  msg: string;

  constructor(eventId, user) {
    this.name = eventId;
    this.user = user;
    this.color = this.getRandomColor(5);
    this.msg = '';
  }

  clean() {
    this.time = '';
    this.msg = '';
  }

  getRandomColor(brightness) {
    // Six levels of brightness from 0 to 5, 0 being the darkest
    var rgb = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
    var mix = [brightness * 51, brightness * 51, brightness * 51]; //51 => 255/5
    var mixedrgb = [rgb[0] + mix[0], rgb[1] + mix[1], rgb[2] + mix[2]].map(function (x) { return Math.round(x / 2.0) })
    return "rgb(" + mixedrgb.join(",") + ")";
  }
}

 */
