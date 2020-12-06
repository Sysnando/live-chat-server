import { Injectable } from '@angular/core';
import {io, Socket} from 'socket.io-client';
import {BehaviorSubject, Subject} from "rxjs";
import {IOCommand} from "../../../../web-shared/io";
import {ChatMessage, ChatMessage$JSON} from "../../../../web-shared/entity/chat-message.model";
import {RTCAnswer, RTCCandidate, RTCOffer} from "../../../../web-shared/rtc";

@Injectable({ providedIn: 'root' })
export class IOService {

  private fanCountdown = new BehaviorSubject<number>(0);
  private fanBroadcastStatus = new Subject<FanBroadcastStatus>();

  private moderatorActions = new Subject<ModeratorAction>();

  private queueSize = new BehaviorSubject<number>(0)
  private queueStatus = new BehaviorSubject<QueueStatus>(QueueStatus.NONE);

  private roomMessages = new Subject<ChatMessage>();
  private roomSize = new BehaviorSubject<number>(0);
  private roomVideo = new Subject<string>();

  private rtcAnswers = new Subject<RTCAnswer>();
  private rtcCandidates = new Subject<RTCCandidate>();
  private rtcOffers = new Subject<RTCOffer>();
  private rtcPeers = new Subject<string[]>();

  private socket: Socket;
  private socketStatus = new BehaviorSubject<SocketStatus>(SocketStatus.CONNECTING);

  constructor() {}

  get ID() { return this.socket.id }

  get fanBroadcastStatus$() { return this.fanBroadcastStatus.asObservable() }
  get fanCountdown$() { return this.fanCountdown.asObservable() }

  get moderatorActions$() { return this.moderatorActions.asObservable() }

  get queueSize$() { return this.queueSize.asObservable() }
  get queueStatus$() { return this.queueStatus.asObservable() }

  get roomMessages$() { return this.roomMessages.asObservable() }
  get roomSize$() { return this.roomSize.asObservable() }
  get roomVideo$() { return this.roomVideo.asObservable() }

  get rtcAnswers$() { return this.rtcAnswers.asObservable() }
  get rtcCandidates$() { return this.rtcCandidates.asObservable() }
  get rtcOffers$() { return this.rtcOffers.asObservable() }
  get rtcPeers$() { return this.rtcPeers.asObservable() }

  get socketStatus$() { return this.socketStatus.asObservable() }

  connect(token: string = window.localStorage.getItem('jhi-authenticationtoken')) {
    this.socket?.disconnect();
    this.socket = undefined;

    this.socket = io({ reconnectionAttempts: Number.MAX_SAFE_INTEGER, auth: { token } });
    this.socket.on('connect', () => this.socketStatus.next(SocketStatus.CONNECTED));
    this.socket.on('disconnect', () => this.socketStatus.next(SocketStatus.CONNECTING));
    this.socket.on('error', () => this.socketStatus.next(SocketStatus.DISCONNECTED));

    this.socket.on(IOCommand.FAN_BROADCAST_START, (value: number) => { this.fanCountdown.next(value); this.fanBroadcastStatus.next(FanBroadcastStatus.BROADCAST_START) });
    this.socket.on(IOCommand.FAN_BROADCAST_STOP, () => this.fanBroadcastStatus.next(FanBroadcastStatus.BROADCAST_STOP));

    this.socket.on(IOCommand.QUEUE_ENTER, () => this.queueStatus.next(QueueStatus.WAITING));
    this.socket.on(IOCommand.QUEUE_LEAVE, () => this.queueStatus.next(QueueStatus.NONE));
    this.socket.on(IOCommand.QUEUE_SIZE, (value: number) => this.queueSize.next(value));

    this.socket.on(IOCommand.MODERATOR_BAN, () => this.moderatorActions.next(ModeratorAction.BAN));
    this.socket.on(IOCommand.MODERATOR_KICK, () => this.moderatorActions.next(ModeratorAction.KICK));

    this.socket.on(IOCommand.ROOM_MESSAGE, (value: ChatMessage$JSON) => this.roomMessages.next(new ChatMessage(value)));
    this.socket.on(IOCommand.ROOM_MESSAGE_LOG, (value: ChatMessage$JSON[]) => value?.length && value.forEach(value => this.roomMessages.next(new ChatMessage(value))));
    this.socket.on(IOCommand.ROOM_SIZE, (value: number) => this.roomSize.next(value));
    this.socket.on(IOCommand.ROOM_VIDEO, (value: string) => this.roomVideo.next(value));

    this.socket.on(IOCommand.RTC_ANSWER, (value: RTCAnswer) => this.rtcAnswers.next(value));
    this.socket.on(IOCommand.RTC_CANDIDATE, (value: RTCCandidate) => this.rtcCandidates.next(value));
    this.socket.on(IOCommand.RTC_OFFER, (value: RTCOffer) => this.rtcOffers.next(value));
    this.socket.on(IOCommand.RTC_PEERS, (value: string[]) => this.rtcPeers.next(value));
  }

  fanEnter(room: string) { this.socket.emit(IOCommand.SPECTATOR_ENTER, room) }
  fanLeave() { this.socket.emit(IOCommand.FAN_LEAVE) }

  queueEnter() { this.socket.emit(IOCommand.QUEUE_ENTER) }
  queueLeave() { this.socket.emit(IOCommand.QUEUE_LEAVE) }

  moderatorBan(id: string) { this.socket.emit(IOCommand.MODERATOR_BAN, id) }
  moderatorKick(id: string) { this.socket.emit(IOCommand.MODERATOR_KICK, id) }

  roomEnter(name: string, room: string) {
    this.socket.emit(IOCommand.ROOM_ENTER, name, room);
  }
  roomMessage(message: string) {
    let chat = new ChatMessage();
        chat.message = message;

    this.socket.emit(IOCommand.ROOM_MESSAGE, chat);
  }

  rtcAnswer(answer: RTCAnswer) { this.socket.emit(IOCommand.RTC_ANSWER, answer) }
  rtcCandidate(candidate: RTCCandidate) { this.socket.emit(IOCommand.RTC_CANDIDATE, candidate) }
  rtcOffer(offer: RTCOffer) { this.socket.emit(IOCommand.RTC_OFFER, offer) }

}

export enum FanBroadcastStatus {
  BROADCAST_START,
  BROADCAST_STOP,
}

export enum QueueStatus {
  NONE,
  WAITING,
}

export enum SocketStatus {
  CONNECTED,
  CONNECTING,
  DISCONNECTED,
}

export enum ModeratorAction {
  BAN,
  KICK,
}
