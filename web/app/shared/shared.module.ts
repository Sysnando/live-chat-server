import { NgModule } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FontAwesomeModule,
  ],
  exports: [
    // Modules
    CommonModule,
    FontAwesomeModule,
  ],
  providers: [
    DatePipe,
  ]
})
export class SharedModule { }
