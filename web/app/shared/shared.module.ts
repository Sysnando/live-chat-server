import { NgModule } from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {TooltipDirective} from "./directives/tooltip.directive";



@NgModule({
  declarations: [
    TooltipDirective,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
  ],
  exports: [
    // Directives
    TooltipDirective,

    // Modules
    CommonModule,
    FontAwesomeModule,
  ],
  providers: [
    DatePipe,
  ]
})
export class SharedModule { }
