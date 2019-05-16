import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LineChartReviewComponent } from './line-chart-review.component';

describe('LineChartReviewComponent', () => {
  let component: LineChartReviewComponent;
  let fixture: ComponentFixture<LineChartReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LineChartReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LineChartReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
