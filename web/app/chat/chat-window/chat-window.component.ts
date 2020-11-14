import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {faArrowRight, faComment} from "@fortawesome/free-solid-svg-icons";
import {IOService, SocketStatus} from "../../shared/services/io.service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowComponent implements OnDestroy {

  readonly faComment = faComment;
  readonly faArrowRight = faArrowRight;

  readonly SocketStatus = SocketStatus;

  size: number;
  status: SocketStatus;

  subscriptionSize: Subscription;
  subscriptionStatus: Subscription;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private io: IOService,
  ) {
    this.subscriptionSize = io.size.subscribe(value => this.onSizeChange(value));
    this.subscriptionStatus = io.status.subscribe(value => this.onStatusChange(value));
  }

  onSizeChange(value: number) {
    this.size = value;
    this.changeDetector.markForCheck();
  }
  onStatusChange(value: SocketStatus) {
    this.status = value;
    this.changeDetector.markForCheck();

    if (this.status == SocketStatus.CONNECTED)
        this.io.join('miku'); // TODO: use the query param
  }

  ngOnDestroy() {
    this.subscriptionSize?.unsubscribe();
    this.subscriptionStatus?.unsubscribe();
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
