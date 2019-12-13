import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgWaveformComponent } from './ng-waveform.component';
import { HttpClientModule } from '@angular/common/http';
import { DragDropDirective } from './drag-drop.directive';

import { RegionComponent } from './region.component';

@NgModule({
  declarations: [NgWaveformComponent, DragDropDirective, RegionComponent],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [NgWaveformComponent]
})
export class NgWaveformModule { }
