import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-fans-window',
  templateUrl: './fans-window.component.html',
  styleUrls: ['./fans-window.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FansWindowComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
