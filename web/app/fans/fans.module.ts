import { NgModule } from '@angular/core';
import {FansRoutingModule} from "./fans-routing.module";
import {SharedModule} from "../shared/shared.module";
import { FansModeratorComponent } from './fans-moderator/fans-moderator.component';
import { FansSpectatorComponent } from "./fans-spectator/fans-spectator.component";
import { FansVideoComponent } from './fans-video/fans-video.component';

@NgModule({
  declarations: [
    FansModeratorComponent,
    FansSpectatorComponent,
    FansVideoComponent,
  ],
  imports: [
    FansRoutingModule,
    SharedModule,
  ]
})
export class FansModule { }
