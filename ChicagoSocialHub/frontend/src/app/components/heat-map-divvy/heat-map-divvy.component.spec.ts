import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatMapDivvyComponent } from './heat-map-divvy.component';

describe('HeatMapDivvyComponent', () => {
  let component: HeatMapDivvyComponent;
  let fixture: ComponentFixture<HeatMapDivvyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatMapDivvyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatMapDivvyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
