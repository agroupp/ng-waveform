import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ITimeUpdateEvent, NgWaveformComponent, IRegionPositions } from 'ng-waveform';
// import { ITimeUpdateEvent, NgWaveformComponent, IRegionPositions } from '../../../../../dist/ng-waveform';

@Component({
  selector: 'app-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.scss']
})
export class WaveformDemoComponent implements OnInit {
  @ViewChild('waveform', { static: false }) waveform: NgWaveformComponent;
  play = false;
  isLoaded = false;
  trackLoadTime: number;
  renderingTime: number;
  duration: number;
  currentTime: ITimeUpdateEvent;
  regionPositions: IRegionPositions;

  srcForm: FormGroup;
  isSrcError = false;
  isAudioQueried = false;

  isRegionCtrl = new FormControl(true);
  regionStartCtrl = new FormControl(0);
  regionEndCtrl = new FormControl(0);

  useRegion = true;
  src: string;
  constructor() { }

  ngOnInit() {
    this.srcForm = new FormGroup({src: new FormControl()});
    this.srcForm.valueChanges.subscribe(() => this.isSrcError = false);
    this.isRegionCtrl.valueChanges.subscribe(value => this.useRegion = value);
    this.regionStartCtrl.valueChanges.subscribe(value => {
      if (!this.waveform) {
        return;
      }
      this.waveform.setRegionStart(value);
    });
    this.regionEndCtrl.valueChanges.subscribe(value => {
      if (!this.waveform) {
        return;
      }
      this.waveform.setRegionEnd(value);
    });
  }

  onSrcFormSubmit() {
    this.isAudioQueried = false;
    const value = this.srcForm.get('src').value;
    try {
      const url = new URL(value);
      if (!url) {
        throw new Error('Bad Url');
      }
      this.src = value;
      this.isAudioQueried = true;
    } catch (err) {
      this.isSrcError = true;
    }
  }

  onPlayButtonClick() {
    this.waveform.play();
    this.play = true;
  }

  onPauseButtonClick() {
    this.waveform.pause();
  }

  onTrackLoaded(time: number) {
    this.trackLoadTime = time;
  }

  onTrackRendered(time: number) {
    this.renderingTime = time;
    this.isLoaded = true;
  }

  onDurationChange(duration: number) {
    this.duration = duration;
  }

  onTimeUpdate(event: ITimeUpdateEvent) {
    this.currentTime = event;
  }

  onPaused() {
    this.play = false;
  }

  onRegionChange(region: IRegionPositions) {
    this.regionPositions = region;
    this.regionStartCtrl.setValue(this.regionPositions.start);
    this.regionEndCtrl.setValue(this.regionPositions.end);
  }
}
