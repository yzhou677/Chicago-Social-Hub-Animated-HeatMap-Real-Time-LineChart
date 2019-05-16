import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BarChartReviewComponent } from './bar-chart-review.component';

describe('BarChartReviewComponent', () => {
  let component: BarChartReviewComponent;
  let fixture: ComponentFixture<BarChartReviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BarChartReviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BarChartReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
