import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgWaveformComponent } from './ng-waveform.component';

describe('NgWaveformComponent', () => {
  let component: NgWaveformComponent;
  let fixture: ComponentFixture<NgWaveformComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgWaveformComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgWaveformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
