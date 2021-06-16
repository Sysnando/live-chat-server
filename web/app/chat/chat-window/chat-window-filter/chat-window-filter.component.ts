import {Component, OnInit, ChangeDetectionStrategy, Input} from '@angular/core';

@Component({
  selector: 'app-chat-window-filter',
  templateUrl: './chat-window-filter.component.html',
  styleUrls: ['./chat-window-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatWindowFilterComponent implements OnInit {

  @Input() properties: CarrouselProperties;
  @Input() cards: CarrouselCards[];

  constructor() { }

  ngOnInit(): void {
  }
}

export interface CarrouselProperties {
  height?: number;
  width?: number;
  cellWidth?: number;
  cellsToShow?: number;
  cellsToScroll?: number;
  loop?: boolean;
  lightDOM?: boolean;
  overflowCellsLimit?: number;
  freeScroll?: boolean;
  autoplay?: boolean;
  autoplayInterval?: number;
  pauseOnHover?: boolean;
  dots?: boolean;
  objectFit?: 'contain' | 'cover' | 'none';
  margin?: number;
  minSwipeDistance?: number;
  transitionDuration?: number;
  transitionTimingFunction?: 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear';
  counter?: boolean;
  counterSeparator?: " / ";
  borderRadius?: number;
  arrows?: boolean;
  arrowsOutside?: boolean;
  arrowsTheme?: 'light' | 'dark';
}

export interface CarrouselCards {
  click?: () => {};
  name: string;
  thumbPath: string;
}
