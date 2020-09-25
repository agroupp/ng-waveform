import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaveformDemoComponent } from './waveform.component';

describe('WaveformDemoComponent', () => {
  let component: WaveformDemoComponent;
  let fixture: ComponentFixture<WaveformDemoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WaveformDemoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WaveformDemoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
