import { NgModule } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import {ChatRoutingModule} from "./chat-routing.module";
import {SharedModule} from "../shared/shared.module";
import { ChatWindowModalComponent } from './chat-window/chat-window-modal/chat-window-modal.component';
import {FormsModule} from "@angular/forms";
import {ChatWindowVideoComponent} from "./chat-window/chat-window-video/chat-window-video.component";
import {IvyCarouselModule} from "angular-responsive-carousel";
import { ChatWindowFilterComponent } from './chat-window/chat-window-filter/chat-window-filter.component';

@NgModule({
  declarations: [
    ChatWindowComponent,
    ChatWindowModalComponent,
    ChatWindowVideoComponent,
    ChatWindowFilterComponent,
  ],
  imports: [
    FormsModule,
    SharedModule,
    ChatRoutingModule,
    IvyCarouselModule,
  ]
})
export class ChatModule { }
