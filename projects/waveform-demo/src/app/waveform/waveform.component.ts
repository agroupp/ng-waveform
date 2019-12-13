import { Component, OnInit, ViewChild } from '@angular/core';
import { ITimeUpdateEvent, NgWaveformComponent, IRegionPositions } from '../../../../../dist/ng-waveform';

@Component({
  selector: 'app-waveform',
  templateUrl: './waveform.component.html',
  styleUrls: ['./waveform.component.scss']
})
export class WaveformDemoComponent implements OnInit {
  @ViewChild('waveform', { static: false }) waveform: NgWaveformComponent;
  play = false;
  isLoaded = false;
  duration: number;
  currentTime: ITimeUpdateEvent;
  regionPositions: IRegionPositions;
  src = 'https://sapi.audioburst.com/audio/repo/play/mobile/39806809/6DrlWNAAyGzA.mp3?userId=outbrain_demo-28fc-40ff-9002-5f1e371b1c49&appName=outbrain_demo&prefix=playlist_news.foreign';
  constructor() { }

  ngOnInit() {
  }

  onPlayButtonClick() {
    this.waveform.play();
    this.play = true;
  }

  onPauseButtonClick() {
    this.waveform.pause();
  }

  onTrackLoaded(time: number) {
    console.log(`Track loaded in ${time}ms`);
    this.waveform.setRegionStart(10);
    this.waveform.setRegionEnd(40);
  }

  onTrackRendered(time: number) {
    console.log(`Rendering time ${time}ms`);
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
  }
}
