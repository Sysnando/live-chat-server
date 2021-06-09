import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {SharedModule} from "./shared/shared.module";
import {IvyCarouselModule} from "angular-responsive-carousel";

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    SharedModule,
    IvyCarouselModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
