import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {FansWindowComponent} from "./fans-window/fans-window.component";

const routes: Routes = [
  {
    path: '',
    component: FansWindowComponent,
  }
]

@NgModule({ imports: [RouterModule.forChild(routes)] })
export class FansRoutingModule {}
