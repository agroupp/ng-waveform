import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgWaveformModule } from 'ng-waveform';
// import { NgWaveformModule } from '../../../../dist/ng-waveform';

import { AppComponent } from './app.component';
import { WaveformDemoComponent } from './waveform/waveform.component';

@NgModule({
  declarations: [
    AppComponent,
    WaveformDemoComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    NgWaveformModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
