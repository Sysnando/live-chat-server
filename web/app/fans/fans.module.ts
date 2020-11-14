import { NgModule } from '@angular/core';
import { FansWindowComponent } from './fans-window/fans-window.component';
import {FansRoutingModule} from "./fans-routing.module";
import {SharedModule} from "../shared/shared.module";

@NgModule({
  declarations: [FansWindowComponent],
  imports: [
    FansRoutingModule,
    SharedModule,
  ]
})
export class FansModule { }
