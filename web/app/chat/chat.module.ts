import { NgModule } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import {ChatRoutingModule} from "./chat-routing.module";
import {SharedModule} from "../shared/shared.module";
import { ChatVideoComponent } from './chat-video/chat-video.component';
import { ChatWindowModalComponent } from './chat-window/chat-window-modal/chat-window-modal.component';
import {FormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    ChatWindowComponent,
    ChatWindowModalComponent,
    ChatVideoComponent,
  ],
  imports: [
    FormsModule,
    SharedModule,
    ChatRoutingModule,
  ]
})
export class ChatModule { }
