import {
  ChangeDetectorRef,
  Directive,
  ElementRef, HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';

@Directive({ selector: '[tooltip]' })
export class TooltipDirective implements OnChanges, OnDestroy, OnInit {

  @Input()  tooltip: string;
  @Input()  tooltipContainer: ElementRef;
  @Input()  tooltipPlacement: 'bottom' | 'left' | 'right' | 'top';

  private   $tooltip: HTMLDivElement;
  private   $tooltipInner: HTMLDivElement;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private element: ElementRef,
  ) {
    let arrow = document.createElement('div');
        arrow.className = 'arrow';

    let tooltipInner = this.$tooltipInner = document.createElement('div');
        tooltipInner.className = 'tooltip-inner';

    let tooltip = this.$tooltip = document.createElement('div');
        tooltip.className = 'tooltip show bs-tooltip-top';
        tooltip.appendChild(arrow);
        tooltip.appendChild(tooltipInner);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tooltip)
        this.$tooltipInner.innerHTML = this.tooltip;
    if (changes.tooltipPlacement)
        this.$tooltip.className = `tooltip show bs-tooltip-${ this.tooltipPlacement }`;

    this.changeDetector.markForCheck();
  }

  ngOnDestroy() {
    this.close();
  }

  ngOnInit() {
    this.tooltipContainer = this.tooltipContainer || this.element;
    this.tooltipContainer.nativeElement.style.position = 'relative';
  }

  @HostListener('focusout')
  @HostListener('mouseleave')
  @HostListener('touchend')
  close() {
    this.tooltipContainer.nativeElement == this.$tooltip.parentNode && this.tooltipContainer.nativeElement.removeChild(this.$tooltip);
    this.changeDetector.markForCheck();
  }

  @HostListener('focusin')
  @HostListener('mouseenter')
  @HostListener('touchstart')
  open() {
    if (this.tooltip) {
      this.tooltipContainer.nativeElement.appendChild(this.$tooltip);
      this.changeDetector.markForCheck();
    }
  }

}
