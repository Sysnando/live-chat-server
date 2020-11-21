import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {FansModeratorComponent} from "./fans-moderator/fans-moderator.component";
import {FansSpectatorComponent} from "./fans-spectator/fans-spectator.component";

const routes: Routes = [
  {
    path: 'moderator',
    component: FansModeratorComponent,
  },
  {
    path: 'spectator',
    component: FansSpectatorComponent,
  }
]

@NgModule({ imports: [RouterModule.forChild(routes)] })
export class FansRoutingModule {}
