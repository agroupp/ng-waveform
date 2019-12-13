import {
  Component, OnChanges, AfterViewInit, AfterViewChecked,
  Input, ViewChild, ElementRef, Output, EventEmitter, ChangeDetectorRef
} from '@angular/core';

export interface IRegionPositions {
  start: number;
  end: number;
}

/**
 * Region component.
 */
@Component({
  selector: 'ng-waveform-region',
  template: `
    <div class="wrapper" #wrapper>
      <div class="region" *ngIf="position.end > 0"
      [ngStyle]="{
        'left.%': position.start,
        'right.%': 100 - position.end,
        'backgroundColor': regionBackgroundColor
      }">
        <div class="ng-waveform-region-start-wrapper" libDragDrop
          (dragging)="onRegionStartDragging($event)" (dragFinished)="valueChanges.emit({start: start, end: end})">
          <div class="ng-waveform-region-stick"
            [ngStyle]="{'backgroundColor': startStickColor, 'height': withLabels ? 'calc(100% + 10px)' : '100%'}">
            <span class="ng-waveform-region-label" *ngIf="withLabels && position.end - position.start > 5"
              [ngStyle]="{'color': regionTextColor}">{{start | number:'1.2-2'}}</span>
          </div>
        </div>
        <div class="ng-waveform-region-end-wrapper" libDragDrop
          (dragging)="onRegionEndDragging($event)" (dragFinished)="valueChanges.emit({start: start, end: end})">
          <div class="ng-waveform-region-stick"
            [ngStyle]="{'backgroundColor': endStickColor, 'height': withLabels ? 'calc(100% + 10px)' : '100%'}">
            <span class="ng-waveform-region-label" *ngIf="withLabels && position.end - position.start > 5"
              [ngStyle]="{'color': regionTextColor}">{{end | number:'1.2-2'}}</span>
          </div>
        </div>
        <div class="ng-waveform-region-length" *ngIf="withLabels && end - start > 7">
          <div class="line" [ngStyle]="{'backgroundColor': regionTextColor}"></div>
          <span [ngStyle]="{'color': regionTextColor}">{{(end - start) | number:'1.2-2'}}s</span>
          <div class="line" [ngStyle]="{'backgroundColor': regionTextColor}"></div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.wrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 10;
      pointer-events: none;
    }`,
    `.region {
      position: absolute;
      top: 0;
      bottom: 0;
    }`,
    `.ng-waveform-region-start-wrapper, .ng-waveform-region-end-wrapper {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 10px;
      cursor: e-resize;
      pointer-events: all;
    }`,
    `.ng-waveform-region-start-wrapper {
      left: -4px;
    }`,
    `.ng-waveform-region-end-wrapper {
      right: -4px;
    }`,
    `.ng-waveform-region-stick {
      width: 2px;
      margin: 0 auto;
    }`,
    `.ng-waveform-region-label {
      font-size: 13px;
      position: absolute;
      bottom: -25px;
      max-width: 30px;
      min-width: 30px;
      text-align: center;
      left: -10px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }`,
    `.ng-waveform-region-length {
      position: absolute;
      bottom: -25px;
      display: flex;
      align-items: center;
      left: 10px;
      right: 10px;
    }`,
    `.ng-waveform-region-length span {
      text-align: center;
      display: block;
      max-width: 30px;
      min-width: 30px;
      font-size: 13px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }`,
    `.ng-waveform-region-length .line {
      flex: 1 1 auto;
      margin: 0 10px;
      height: 1px;
    }`
  ]
})
export class RegionComponent implements OnChanges, AfterViewInit, AfterViewChecked {
  @Input() start = 0;
  @Input() end = 0;
  @Input() duration = 0;
  @Input() regionBackgroundColor = 'transparent';
  @Input() startStickColor = 'red';
  @Input() endStickColor = 'red';
  @Input() regionTextColor = '#000';
  @Input() withLabels = true;
  position: IRegionPositions = {start: 0, end: 0};

  /** Emits when region length changes */
  @Output() valueChanges = new EventEmitter<IRegionPositions>();

  @ViewChild('wrapper', {static: false}) private wrapperEl: ElementRef;
  private wrapper: HTMLDivElement;

  constructor(private cd: ChangeDetectorRef) {}

  ngAfterViewInit() {
    this.wrapper = this.wrapperEl.nativeElement as HTMLDivElement;
    this.init();
  }

  ngAfterViewChecked() {
    this.cd.detectChanges();
  }

  ngOnChanges() {
    this.init();
  }

  private init(): void {
    if (this.end === 0 || this.duration === 0 || !this.wrapper) {
      return;
    }
    this.position = {
      start: (this.start / this.duration) * 100,
      end: (this.end / this.duration) * 100
    };
  }

  private update() {

  }

  onRegionStartDragging(x: number): void {
    this.onDragging('start', x);
  }

  onRegionEndDragging(x: number): void {
    this.onDragging('end', x);
  }

  private onDragging(element: 'start' | 'end', x: number): void {
    if (!this.wrapper || !this.wrapper.getBoundingClientRect) {
      return;
    }
    const rect = this.wrapper.getBoundingClientRect();
    x = x - rect.left;
    const position = x > rect.width ? 100 : (x / rect.width) * 100;
    if (element === 'start') {
      this.position.start = x < 0 ? 0 : position;
      this.start = this.position.start * this.duration / 100;
    } else if (element === 'end') {
      this.position.end = x < 1 ? 0.01 : position;
      this.end = this.position.end * this.duration / 100;
    }
  }
}
