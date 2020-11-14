import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  ]
})
export class SharedModule { }
