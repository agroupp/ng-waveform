import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { NgWaveformModule } from '../../../../dist/ng-waveform';

import { AppComponent } from './app.component';
import { WaveformDemoComponent } from './waveform/waveform.component';

@NgModule({
  declarations: [
    AppComponent,
    WaveformDemoComponent
  ],
  imports: [
    BrowserModule,
    NgWaveformModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
