import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartDivvyChildComponent } from './line-chart-divvy-child.component';

describe('LineChartDivvyChildComponent', () => {
  let component: LineChartDivvyChildComponent;
  let fixture: ComponentFixture<LineChartDivvyChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartDivvyChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartDivvyChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
