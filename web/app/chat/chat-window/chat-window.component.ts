import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy} from '@angular/core';
import {faArrowRight, faComment} from "@fortawesome/free-solid-svg-icons";
import {IOService, SocketStatus} from "../../shared/services/io.service";
import {Subscription} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {Event, EventService} from "../../shared/services/event.service";
import {faHeart} from "@fortawesome/free-regular-svg-icons";

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
  size: number;
  status: SocketStatus;
  video: any;

  subscriptionSize: Subscription;
  subscriptionStatus: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private changeDetector: ChangeDetectorRef,
    private eventService: EventService,
    private io: IOService
  ) {
    this.subscriptionSize = io.size.subscribe(value => this.onSizeChange(value));
    this.subscriptionStatus = io.status.subscribe(value => this.onStatusChange(value));

    this.activatedRoute.queryParams.subscribe(params => {
      eventService.getEventById(params.event).subscribe(event => this.event = event);
    })
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

  onLike() {
    console.log('Like ;)')
  }

  onConductCodeModal() {
    this.modal = !this.modal;
  }

  ngOnDestroy() {
    this.subscriptionSize?.unsubscribe();
    this.subscriptionStatus?.unsubscribe();
  }
}
