import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import {faArrowRight, faComment} from "@fortawesome/free-solid-svg-icons";
import {faHeart} from "@fortawesome/free-regular-svg-icons";
import {
  FanBroadcastStatus,
  IOService,
  ModeratorAction,
  QueueStatus,
  SocketStatus
} from "../../shared/services/io.service";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {Event, EventService} from "../../shared/services/event.service";
import {DatePipe} from "@angular/common";
import {ChatMessage} from "../../../../web-shared/entity/chat-message.model";
import {ChatWindowModalPage} from "./chat-window-modal/chat-window-modal.component";

const LOG_SIZE = 100;

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowComponent implements OnDestroy, OnInit {

  readonly faArrowRight = faArrowRight;
  readonly faComment = faComment;
  readonly faHeart = faHeart;

  readonly QueueStatus = QueueStatus;
  readonly SocketStatus = SocketStatus;

  event: Event;

                        busy$queue: boolean;

                        chatInput: string;
                        chatMessages: ChatMessage[] = [];
  @ViewChild('chatLog') chatLog: ElementRef;

                        modalOpen: boolean;
                        modalPage: ChatWindowModalPage;

                        queueSize: number;
                        queueStatus: QueueStatus;

                        roomSize: number;

                        socketStatus: SocketStatus;

                        subscriptionFanStatus: Subscription;
                        subscriptionModeratorAction: Subscription;
                        subscriptionQueueSize: Subscription;
                        subscriptionQueueStatus: Subscription;
                        subscriptionRoomMessage: Subscription;
                        subscriptionRoomSize: Subscription;
                        subscriptionSocketStatus: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private date: DatePipe,
    private eventService: EventService,
    private io: IOService,
  ) {
    this.io.connect();

    this.subscriptionFanStatus = io.fanBroadcastStatus$.subscribe(value => this.onFanStatus(value));
    this.subscriptionModeratorAction = io.moderatorActions$.subscribe(value => this.onModeratorAction(value));
    this.subscriptionQueueSize = io.queueSize$.subscribe(value => this.onQueueSize(value));
    this.subscriptionQueueStatus = io.queueStatus$.subscribe(value => this.onQueueStatus(value));
    this.subscriptionRoomMessage = io.roomMessages$.subscribe(value => this.onRoomChat(value));
    this.subscriptionRoomSize = io.roomSize$.subscribe(value => this.onRoomSize(value));
    this.subscriptionSocketStatus = io.socketStatus$.subscribe(value => this.onSocketStatus(value));

    // TODO: put this in a resolver?
    eventService.getEventById(this.activatedRoute.snapshot.queryParamMap.get('event')).subscribe(event => this.event = event);
  }

  get chatDisabled() { return this.socketStatus != SocketStatus.CONNECTED || !this.chatInput?.trim().length }

  chatMessage$from(message: ChatMessage) { return message?.from }
  chatMessage$message(message: ChatMessage) { return message?.message }
  chatMessage$time(message: ChatMessage) { return message?.time && this.date.transform(message.time, 'HH:mm') }

  ngOnDestroy() {
    this.subscriptionFanStatus?.unsubscribe();
    this.subscriptionQueueSize?.unsubscribe();
    this.subscriptionQueueStatus?.unsubscribe();
    this.subscriptionRoomMessage?.unsubscribe();
    this.subscriptionRoomSize?.unsubscribe();
    this.subscriptionSocketStatus?.unsubscribe();
  }

  ngOnInit() {
    this.io.connect();
  }

  onClickQueueEnter() {
    this.modalPage = ChatWindowModalPage.SETUP_ACCEPT;
    this.onModalOpen();
  }
  onClickQueueLeave() {
    this.busy$queue = true;

    this.io.queueLeave();
  }
  onClickRoomMessageSend() {
    if (this.chatDisabled) return;

    this.io.roomMessage(this.chatInput);
    this.chatInput = '';
    this.changeDetector.markForCheck();
  }
  onClickLike() {
    console.log('Like ;)') // TODO:
  }

  onFanStatus(value: FanBroadcastStatus) {
    if (value == FanBroadcastStatus.BROADCAST_START) this.modalPage = ChatWindowModalPage.STREAM_START;
    if (value == FanBroadcastStatus.BROADCAST_STOP)  this.modalPage = ChatWindowModalPage.STREAM_STOP;

    this.onModalOpen();
  }

  onModalOpen() {
    this.modalOpen = true;
    this.changeDetector.markForCheck();
  }
  onModalClose(success: boolean) {
    this.modalOpen = false;
    this.changeDetector.markForCheck();

    this.busy$queue = success;
  }

  onModeratorAction(value: ModeratorAction) {
    console.log('onModeratorAction', value)
    if (value == ModeratorAction.BAN) {
      this.modalPage = ChatWindowModalPage.STREAM_STOP_BANNED;
      this.onModalOpen();
    }
    if (value == ModeratorAction.KICK) {
      this.modalPage = ChatWindowModalPage.STREAM_STOP_KICKED;
      this.onModalOpen();
    }
  }

  onQueueSize(value: number) {
    this.queueSize = value;
    this.changeDetector.markForCheck();
  }
  onQueueStatus(value: QueueStatus) {
    this.busy$queue = false;

    this.queueStatus = value;
    this.changeDetector.markForCheck();
  }

  onRoomChat(value: ChatMessage) {
    this.chatMessages.push(value);
    this.chatMessages.length > LOG_SIZE && this.chatMessages.shift();

    this.changeDetector.markForCheck();
    this.chatLog.nativeElement.scrollTo({ top: this.chatLog.nativeElement.scrollHeight, behavior: 'smooth' });
  }
  onRoomSize(value: number) {
    this.roomSize = value;
    this.changeDetector.markForCheck();
  }

  onSocketStatus(value: SocketStatus) {
    this.socketStatus = value;
    this.changeDetector.markForCheck();

    console.log('onSocketStatus', value)
    if (this.socketStatus == SocketStatus.CONNECTED) {
        this.chatMessages = [];
        this.queueStatus = QueueStatus.NONE;

        this.io.roomEnter('Sr. Banana', 'miku'); // TODO: use the query params
    } else if (this.modalPage != ChatWindowModalPage.STREAM_STOP_BANNED) {
        this.onModalClose(false);
    }
  }

}
