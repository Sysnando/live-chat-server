import { NgModule } from '@angular/core';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import {ChatRoutingModule} from "./chat-routing.module";
import {SharedModule} from "../shared/shared.module";

@NgModule({
  declarations: [ChatWindowComponent],
  imports: [
    SharedModule,
    ChatRoutingModule,
  ]
})
export class ChatModule { }
