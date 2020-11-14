import { NgModule } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import {ChatRoutingModule} from "./chat-routing.module";
import {SharedModule} from "../shared/shared.module";
import { ChatVideoComponent } from './chat-video/chat-video.component';

@NgModule({
  declarations: [ChatWindowComponent, ChatVideoComponent],
  imports: [
    SharedModule,
    ChatRoutingModule,
  ]
})
export class ChatModule { }
