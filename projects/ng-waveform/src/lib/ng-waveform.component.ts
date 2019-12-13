import {
  Component, OnInit, OnChanges, OnDestroy, AfterViewInit,
  Input, ViewChild, ElementRef, Output, EventEmitter
} from '@angular/core';
import { from, interval, BehaviorSubject, of } from 'rxjs';
import { switchMap, tap, takeWhile, takeUntil } from 'rxjs/operators';

import { NgWaveformService } from './ng-waveform.service';
import { IRegionPositions } from './region.component';

export interface ITimeUpdateEvent {
  time: number;
  progress: number;
}

@Component({
  selector: 'ng-waveform',
  template: `
    <div #wrapperEl
      [ngStyle]="{
        'width.%': 100, 'position': 'relative',
        'height.px': height,
        'margin-bottom.px': useRegion && withRegionLabels ? 24 : 0
      }"
      (click)="onWrapperClick($event)"
    >
      <canvas [hidden]="!loaded" #canvasEl [ngStyle]="{'backgroundColor': backgroundColor}"></canvas>
      <div #overlayEl class="ng-waveform-overlay" [ngStyle]="{'backgroundColor': overlayBackgroundColor, 'width.%': progress}"></div>
      <ng-waveform-region *ngIf="useRegion"
        [start]="region.start" [end]="region.end" [duration]="duration"
        [regionBackgroundColor]="regionBackgroundColor"
        [startStickColor]="regionStartStickColor"
        [endStickColor]="regionEndStickColor"
        [regionTextColor]="regionTextColor"
        [withLabels]="withRegionLabels"
        (valueChanges)="onRegionChange($event)"></ng-waveform-region>
    </div>`,
  styles: [
    `.ng-waveform-overlay {
      position:absolute;
      top:0;
      bottom:0;
      left:0;
      pointer-events:none;
      transition:100ms linear width;
    }`
  ]
})
export class NgWaveformComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {
  @Input() src: string;
  @Input() height = 100;
  @Input() waveColor = '#d3d3d3';
  @Input() backgroundColor = 'transparent';
  @Input() overlayBackgroundColor = 'rgba(0, 0, 0, 0.5)';
  @Input() regionBackgroundColor = 'transparent';
  @Input() regionStartStickColor = 'red';
  @Input() regionEndStickColor = 'red';
  @Input() regionTextColor = '#000';
  @Input() useRegion = false;
  @Input() withRegionLabels = true;
  @Input() autoplay = false;

  @Output() trackLoaded = new EventEmitter<number>();
  @Output() rendered = new EventEmitter<number>();
  @Output() durationChange = new EventEmitter<number>();
  @Output() timeUpdate = new EventEmitter<ITimeUpdateEvent>();
  @Output() paused = new EventEmitter();
  @Output() regionChange = new EventEmitter<IRegionPositions>();

  srcUrl: string;

  private audioCtx: AudioContext;
  private audioCtxSource: AudioBufferSourceNode;
  private audioBuffer: AudioBuffer;

  private canvasCtx: CanvasRenderingContext2D;
  @ViewChild('wrapperEl', {static: false}) private wrapperEl: ElementRef;
  @ViewChild('canvasEl', {static: false}) private canvasEl: ElementRef;
  @ViewChild('overlayEl', {static: false}) private overlayEl: ElementRef;
  private wrapper: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private overlay: HTMLDivElement;

  // tslint:disable: variable-name
  private _isPlaying = false;
  private _isPlayingSubj = new BehaviorSubject<boolean>(false);
  private _isPlaying$ = this._isPlayingSubj.asObservable();
  private _duration: number;
  private _durationSubj = new BehaviorSubject<number>(0);
  private _currentTime = 0;
  private _savedCurrentTime = 0;
  private _audioContextStartTime = 0;
  private _progress = 0;
  private _loaded = false;
  private _regionSubj = new BehaviorSubject<IRegionPositions>({start: 0, end: 0});
  private _region: IRegionPositions;
  private _stopAtRegionEnd = false;
  // tslint:enable: variable-name

  get region() { return this._region; }
  get progress() { return this._progress; }
  get loaded() { return this._loaded; }
  get duration() { return this._duration; }

  constructor(private service: NgWaveformService) { }

  ngOnInit() {
    // tslint:disable-next-line:no-string-literal
    const AudioContext = window['AudioContext'] || window['webkitAudioContext'];
    this.audioCtx = new AudioContext();

    this._isPlaying$.pipe(
      tap(isPlaying => this._isPlaying = isPlaying),
      switchMap(isPlaying => interval(80).pipe(
        tap(t => this.setAudioCtxStartTime(t)),
        takeWhile(() => isPlaying))
      ),
      switchMap(() => of(this.audioCtx.currentTime - this._audioContextStartTime + this._savedCurrentTime)),
    )
    .subscribe(time => {
      this._progress = time / this._duration * 100;
      this.timeUpdate.emit({ time, progress: this._progress });
      this._currentTime = time;
      if (this.useRegion && this._stopAtRegionEnd && time > this.region.end) {
        this.pause();
        this._stopAtRegionEnd = false;
      }
    });

    this._durationSubj.asObservable().subscribe(duration => {
      this._duration = duration;
      /* Set initial region */
      if (this.useRegion) {
        const start = this._region && this._region.start ? this._region.start : 0;
        const end = this._region && this._region.end ? this._region.end : this._duration;
        this._regionSubj.next({ start, end });
      }
      this.durationChange.emit(this._duration);
    });

    this._regionSubj.asObservable().subscribe(region => {
      this._region = region;
      this.setCurrentTime(this._region.start);
      this.regionChange.emit(this._region);
    });
  }

  ngAfterViewInit() {
    this.canvas = this.canvasEl.nativeElement as HTMLCanvasElement;
    this.canvasCtx = this.canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    this.canvasCtx.scale(dpr, dpr);
    this.wrapper = this.wrapperEl.nativeElement as HTMLDivElement;
    this.overlay = this.overlayEl.nativeElement as HTMLDivElement;
  }

  ngOnChanges() {
    if (!this.src) {
      return;
    }
    if (!this.srcUrl || this.srcUrl !== this.src) {
      this.srcUrl = this.src;
      this.loadAudio();
    }
  }

  /**
   * Play audio
   * @param start starting position
   */
  play(start: number = 0): void {
    if (this._isPlaying) {
      return;
    }
    try {
      this.setAudioSource();
      const startPoint = start ? start : this._savedCurrentTime;
      this.audioCtxSource.start(0, startPoint);
      this.audioCtxSource.connect(this.audioCtx.destination);
      this._isPlayingSubj.next(true);
      if (this.useRegion && startPoint < this.region.end - 0.1) {
        this._stopAtRegionEnd = true;
      }
    } catch (err) {
      console.error(err);
      this._isPlayingSubj.next(false);
    }
  }

  /**
   * Pause audio
   */
  pause() {
    if (!this._isPlaying) {
      return;
    }
    this._savedCurrentTime = this._currentTime;
    try {
      this.audioCtxSource.disconnect(this.audioCtx.destination);
      this.audioCtxSource.stop();
      this._isPlayingSubj.next(false);
      this.paused.emit();
    } catch (err) {
      console.error(err);
      this._isPlayingSubj.next(false);
    }
  }

  /**
   * Change start position of region
   * @param time time in seconds
   */
  setRegionStart(time: number) {
    this._regionSubj.next({start: time, end: this._region.end});
  }

  /**
   * Change end position of region
   * @param time time in seconds
   */
  setRegionEnd(time: number) {
    this._regionSubj.next({start: this._region.start, end: time});
  }

  onWrapperClick(event: MouseEvent): void {
    if (!this.wrapper.getBoundingClientRect) {
      return;
    }
    const wrapperRect = this.wrapper.getBoundingClientRect();
    const x = event.x - wrapperRect.left;
    const time = this._duration * (x / wrapperRect.width);
    const ROUND_MULTIPLIER = 10000000;
    if (Math.round(time * ROUND_MULTIPLIER) !== Math.round(this.region.end * ROUND_MULTIPLIER)) {
      this.setCurrentTime(time);
    }
  }

  onRegionChange(position: IRegionPositions) {
    this._regionSubj.next(position);
  }

  /**
   * Sets current time when something changes
   * @param time time to set in seconds
   */
  private setCurrentTime(time: number) {
    this._savedCurrentTime = time;
    const isPlaying = this._isPlaying;
    this._isPlayingSubj.next(false);
    if (this.audioCtxSource) {
      this.audioCtxSource.stop();
    }
    this._progress = this._savedCurrentTime / this._duration * 100;
    this.timeUpdate.emit({ time: this._savedCurrentTime, progress: this._progress });
    if (isPlaying) {
      this.play();
    }
  }

  /**
   * Load mp3 and render it
   */
  private loadAudio() {
    this._currentTime = 0;
    this._savedCurrentTime = 0;
    this._loaded = false;
    const audioBuffer$ = this.service.loadTrack(this.srcUrl).pipe(
      switchMap(buff => this.decode(buff))
    );
    const now = Date.now();
    audioBuffer$.subscribe(audioBuffer => {
      this.trackLoaded.emit(Date.now() - now);
      this.audioBuffer = audioBuffer;
      this._durationSubj.next(this.audioBuffer.duration);
      this._loaded = true;
      this.render();
      if (this.autoplay) {
        this.play();
      }
    });
  }

  /**
   * Convert raw data from mp3 into Audio context decoded data
   * @param buffer Raw data from mp3
   */
  private decode(buffer: ArrayBuffer) {
    return from(this.audioCtx.decodeAudioData(buffer));
  }

  /**
   * Set Audio context source used to play audio
   * @param buffer audio buffer array
   */
  private setAudioSource() {
    this.audioCtxSource = this.audioCtx.createBufferSource();
    this.audioCtxSource.buffer = this.audioBuffer;
  }

  private setupCanvas(): void {
    if (!this.canvas) {
      return;
    }
    this.canvas.height = this.height;
    this.canvas.width = this.wrapper.offsetWidth;
    this.canvasCtx.fillStyle = this.waveColor;
    this.canvasCtx.translate(0, this.canvas.height / 2);
    this.canvasCtx.fillRect(0, 0, this.canvas.width, 1);
  }

  private render() {
    const now = Date.now();
    const rawChannel0 = this.audioBuffer.getChannelData(0);
    this.setupCanvas();
    const length = this.canvas.width;
    const filteredRaw = this.service.filterRaw(rawChannel0, length);
    const height = this.canvas.height;
    filteredRaw.forEach((item, i) => {
      this.canvasCtx.fillRect(i + 1, (item * height) / -2, 1, item * height);
    });
    this.rendered.emit(Date.now() - now);
  }

  private setAudioCtxStartTime(tick: number): void {
    if (tick !== 0) {
      return;
    }
    this._audioContextStartTime = this.audioCtx.currentTime;
  }

  ngOnDestroy() {
    this.audioCtxSource.stop();
  }
}
