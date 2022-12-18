import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgWaveformComponent } from './ng-waveform.component';
import { HttpClientModule } from '@angular/common/http';
import { DragDropDirective } from './drag-drop.directive';

import { RegionComponent } from './region.component';
import { NgWaveformService } from './ng-waveform.service';

@NgModule({
  declarations: [NgWaveformComponent, DragDropDirective, RegionComponent],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [NgWaveformService],
  exports: [NgWaveformComponent]
})
export class NgWaveformModule { }
