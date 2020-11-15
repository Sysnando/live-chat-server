import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {faArrowRight, faComment} from "@fortawesome/free-solid-svg-icons";
import {faHeart} from "@fortawesome/free-regular-svg-icons";
import {IOService, SocketStatus} from "../../shared/services/io.service";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {Event, EventService} from "../../shared/services/event.service";
import {DatePipe} from "@angular/common";
import {ChatMessage} from "../../../../web-shared/entity/chat-message.model";

const LOG_SIZE = 100;

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowComponent implements OnDestroy {

  readonly faArrowRight = faArrowRight;
  readonly faComment = faComment;
  readonly faHeart = faHeart;

  readonly SocketStatus = SocketStatus;

  event: Event;
  modal: boolean = false;
  video: any;

                        chatInput: string;
                        chatMessages: ChatMessage[] = [];
  @ViewChild('chatLog') chatLog: ElementRef;

                        roomSize: number;
                        roomStatus: SocketStatus;

                        subscriptionMessage: Subscription;
                        subscriptionSize: Subscription;
                        subscriptionStatus: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private date: DatePipe,
    private eventService: EventService,
    private io: IOService,
  ) {
    this.subscriptionMessage = io.roomMessage$.subscribe(value => this.onRoomMessage(value));
    this.subscriptionSize = io.roomSize$.subscribe(value => this.onRoomSize(value));
    this.subscriptionStatus = io.socketStatus$.subscribe(value => this.onSocketStatus(value));

    this.activatedRoute.queryParams.subscribe(params => {
      eventService.getEventById(params.event).subscribe(event => this.event = event);
    })
  }

  get chatDisabled() { return this.roomStatus != SocketStatus.CONNECTED || !this.chatInput?.trim().length }

  chatMessage$from(message: ChatMessage) { return message?.from }
  chatMessage$message(message: ChatMessage) { return message?.message }
  chatMessage$time(message: ChatMessage) { return message?.time && this.date.transform(message.time, 'HH:mm') }

  onRoomMessage(value: ChatMessage) {
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
    this.roomStatus = value;
    this.changeDetector.markForCheck();

    if (this.roomStatus == SocketStatus.CONNECTED) {
        this.chatMessages = [];
        this.io.join('Sr. Banana', 'miku'); // TODO: use the query params
    }
  }

  onLike() {
    console.log('Like ;)')
  }

  onConductCodeModal() {
    this.modal = !this.modal;
  }

  onClickSend() {
    if (this.chatDisabled) return;

    this.io.send(this.chatInput);
    this.chatInput = '';
    this.changeDetector.markForCheck();
  }

  ngOnDestroy() {
    this.subscriptionSize?.unsubscribe();
    this.subscriptionStatus?.unsubscribe();
  }

}
