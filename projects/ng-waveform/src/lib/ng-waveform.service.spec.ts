import { TestBed } from '@angular/core/testing';

import { NgWaveformService } from './ng-waveform.service';

describe('NgWaveformService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgWaveformService = TestBed.get(NgWaveformService);
    expect(service).toBeTruthy();
  });
});
