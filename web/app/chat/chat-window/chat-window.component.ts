import { Component, ChangeDetectionStrategy } from '@angular/core';
import {faArrowRight, faComment} from "@fortawesome/free-solid-svg-icons";
import {IOService} from "../../shared/services/io.service";

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowComponent {

  readonly faComment = faComment;
  readonly faArrowRight = faArrowRight;

  constructor(private io: IOService) {
    io.connect()
  }

  /*

  online: number = 0;
  chatMsg: ChatMessage;
  chatMsgList: ChatMessage[] = [];

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {

    //0. join a chat room
    this.chatMsg = new ChatMessage("Room", "User");
    this.chatService.joinChatRoom(this.chatMsg);

    //1. new chat messsages listener
    this.chatService
      .getMessages(this.chatMsg)
      .subscribe((message) => {
        this.chatMsgList.push(message);
      });

    //2. online users count listener
    this.chatService
      .getOnline(this.chatMsg)
      .subscribe((online) => {
        this.online = online;
      });
  }

  sendMessage(){
    if(this.chatMsg) {
      this.chatMsg.time = formatDate(new Date(), 'hh:mm',  'en-US');
      this.chatService.sendMessage(this.chatMsg);
    }
    this.chatMsg.clean();
  }

   */

}