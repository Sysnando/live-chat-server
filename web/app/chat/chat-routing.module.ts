import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {ChatWindowComponent} from "./chat-window/chat-window.component";

const routes: Routes = [
  {
    path: '',
    component: ChatWindowComponent,
  }
];

@NgModule({ imports: [RouterModule.forChild(routes)] })
export class ChatRoutingModule {}
