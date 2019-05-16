import { Component, OnInit, ChangeDetectionStrategy, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { Station } from '../../../station';
import { moveAverage as MoveAverage } from '../../../moveAverage';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';


import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as time from 'd3-time'
import 'd3-transition';


@Component({
  selector: 'app-line-chart-divvy-child',
  templateUrl: './line-chart-divvy-child.component.html',
  styleUrls: ['./line-chart-divvy-child.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class LineChartDivvyChildComponent implements OnInit, OnChanges {

  timeTitle = 'One Hour'
  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;

  private line: d3Shape.Line<Station>;
  private line1: d3Shape.Line<MoveAverage>;
  private line2: d3Shape.Line<MoveAverage>;
  private xAxis: any;
  private yAxis: any;
  private whichScale: any;
  private alreadyBuild: any;

  private moveAverage: MoveAverage[] = [];
  private averageHourNumber: number;
  private moveAverageDay: MoveAverage[] = [];
  private averageDayNumber: number;
  private cutMoveAverageDay: MoveAverage[] = [];

  stationSelected$: Observable<Station[]>;
  stationData: Station[];

  @Input() stationDataSevenDay: Station[];
  @Input() stationDataOneDay: Station[];
  @Input() stationDataOneHour: Station[];


  constructor() {
    this.width = 1300 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.alreadyBuild = 0;
    this.whichScale = 0;
    this.averageHourNumber = 0;
    this.averageDayNumber = 0;
  }

  ngOnInit() {
    this.initSvg();
    this.initAxis();
  }

  ngOnChanges() {
    if (this.stationDataSevenDay && this.alreadyBuild == 0) {
      this.alreadyBuild = 1;
      this.stationData = this.stationDataOneHour;
      this.stationSelected$ = of(this.stationData);
      this.drawChart();
    } else if (this.stationDataSevenDay && this.alreadyBuild == 1) {
      if (this.whichScale == 0) {
        this.stationData = this.stationDataOneHour;
        this.stationSelected$ = of(this.stationData);
        this.updateChart();
      }
      if (this.whichScale == 1) {
        this.stationData = this.stationDataOneDay;
        this.stationSelected$ = of(this.stationData);
        this.updateChart();
      }
      if (this.whichScale == 2) {
        this.stationData = this.stationDataSevenDay;
        this.stationSelected$ = of(this.stationData);
        this.updateChart();
      }
      if (this.whichScale == 3 || this.whichScale == 4) {
        this.stationData = this.stationDataOneHour;
        this.stationSelected$ = of(this.stationData);
        this.stationDataOneDay = this.stationDataOneDay;
        this.setMoveAverageHour();
        this.setMoveAverageDay();
        this.updateChartSMA();
      }
    }
  }


  subscribeIntervalOneHour() {
    this.timeTitle = 'One Hour';
    this.whichScale = 0;
    this.stationData = this.stationDataOneHour;
    this.stationSelected$ = of(this.stationData);
    this.updateChart();
  }

  subscribeIntervalOneDay() {
    this.timeTitle = 'Twenty Four Hours';
    this.whichScale = 1;
    this.stationData = this.stationDataOneDay;
    this.stationSelected$ = of(this.stationData);
    this.updateChart();
  }

  subscribeIntervalSevenDay() {
    this.timeTitle = 'Seven Days';
    this.whichScale = 2;
    this.stationData = this.stationDataSevenDay;
    this.stationSelected$ = of(this.stationData);
    this.updateChart();
  }

  subscribeIntervalSMA() {
    this.timeTitle = 'SMA CHART';
    this.whichScale = 3;
    this.stationData = this.stationDataOneHour;
    this.stationSelected$ = of(this.stationData);
    this.setMoveAverageHour();
    this.setMoveAverageDay();
    this.updateChartSMA();
  }

  subscribeIntervalSMAOneDay() {
    this.timeTitle = 'SMA CHART';
    this.whichScale = 4;
    this.stationData = this.stationDataOneDay;
    this.stationSelected$ = of(this.stationData);
    this.setMoveAverageHour();
    this.setMoveAverageDay();
    this.updateChartSMA();
  }


  setMoveAverageHour() {
    this.averageHourNumber = 0;
    this.moveAverage = [];
    for (let i = 0; i < this.stationDataOneHour.length; i++) {
      let temp: MoveAverage = {} as any;
      this.averageHourNumber = this.averageHourNumber + this.stationDataOneHour[i].availableDocks.valueOf();
      temp.availableDocks = Number(this.averageHourNumber / (i + 1));
      temp.lastCommunicationTime = this.stationDataOneHour[i].lastCommunicationTime;
      this.moveAverage.push(temp);
    }
  }

  setMoveAverageDay() {
    this.averageDayNumber = 0;
    this.moveAverageDay = [];
    for (let i = 0; i < this.stationDataOneDay.length; i++) {
      let temp: MoveAverage = {} as any;
      this.averageDayNumber = this.averageDayNumber + this.stationDataOneDay[i].availableDocks.valueOf();
      temp.availableDocks = Number(this.averageDayNumber / (i + 1));
      temp.lastCommunicationTime = this.stationDataOneDay[i].lastCommunicationTime;
      this.moveAverageDay.push(temp);
    }
  }

  drawChart() {
    this.drawAxis();
    this.drawLine();
  }

  initSvg() {
    this.svg = d3.select('svg')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  initAxis() {
    this.x = d3Scale.scaleTime().range([0, this.width]);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
  }

  drawAxis() {
    //this.x.domain([new Date(new Date().getTime() - 60*60*1000), new Date()])
    this.x.domain(d3Array.extent(this.stationData, (d) => new Date(d.lastCommunicationTime.valueOf())));
    this.y.domain([0, d3Array.max(this.stationData, (d) => Number(d.availableDocks.valueOf())) + 5]);
    this.xAxis = d3Axis.axisBottom(this.x).ticks(time.timeMinute.every(2));
    this.yAxis = d3Axis.axisLeft(this.y);
    this.svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(this.xAxis);

    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(this.yAxis)
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('availableDocks');
  }

  drawLine() {
    this.line = d3Shape.line<Station>();
    this.line.x((d: any) => this.x(new Date(d.lastCommunicationTime.valueOf())))
      .y((d: any) => this.y(d.availableDocks.valueOf()));
      
    this.svg.append('path')
      .datum(this.stationData)
      .attr('class', 'line')
      .attr('d', this.line(this.stationData));

    this.line1 = d3Shape.line<MoveAverage>();
    this.line1.x((d: any) => this.x(new Date(d.lastCommunicationTime.valueOf())))
      .y((d: any) => this.y(d.availableDocks.valueOf()));
    this.svg.append('path')
      .datum(this.moveAverage)
      .attr('class', 'line1')
      .attr('d', this.line1(this.moveAverage))
      .style("opacity", 0);


    this.line2 = d3Shape.line<MoveAverage>();
    this.line2.x((d: any) => this.x(new Date(d.lastCommunicationTime.valueOf())))
      .y((d: any) => this.y(d.availableDocks.valueOf()));
    this.svg.append('path')
      .datum(this.moveAverageDay)
      .attr('class', 'line2')
      .attr('d', this.line2(this.moveAverageDay))
      .style("opacity", 0);
  }

  maxData(d1, d2, d3) {
    var temp = d1;
    if (d2 > temp) {
      temp = d2;
    }
    if (d3 > temp) {
      temp = d3;
    }
    return temp;
  }


  updateChart() {
    var body = d3.select('body').transition();
    body.selectAll(".d-inline-block")
      .style("opacity", 1);

    this.x.domain(d3Array.extent(this.stationData, (d) => new Date(d.lastCommunicationTime.valueOf())));
    this.y.domain([0, d3Array.max(this.stationData, (d) => Number(d.availableDocks.valueOf())) + 5]);
    if (this.whichScale == 0) {
      this.xAxis = d3Axis.axisBottom(this.x).ticks(time.timeMinute.every(2));
    }
    if (this.whichScale == 1) {
      this.xAxis = d3Axis.axisBottom(this.x).ticks(time.timeHour.every(1));
    }
    if (this.whichScale == 2) {
      this.xAxis = d3Axis.axisBottom(this.x).ticks(time.timeDay.every(1));
    }

    var svg = d3.select('svg').transition();
    svg.selectAll(".line")
      .duration(750)
      .attr("d", this.line(this.stationData));

    svg.selectAll(".line1")
      .style("opacity", 0);

    svg.selectAll(".line2")
      .style("opacity", 0);

    svg.select(".axis.axis--x")
      .duration(750)
      .call(this.xAxis);

    svg.select(".axis.axis--y")
      .duration(750)
      .call(this.yAxis);
  }

  updateChartSMA() {
    var maximum: any;
    if (this.whichScale == 3) {
      this.xAxis = d3Axis.axisBottom(this.x).ticks(time.timeMinute.every(2));
      this.cutMoveAverageDay = this.moveAverageDay.slice(-this.stationData.length);
    } else if (this.whichScale == 4) {
      this.xAxis = d3Axis.axisBottom(this.x).ticks(time.timeHour.every(1));
      this.cutMoveAverageDay = this.moveAverageDay;
    }

    maximum = this.maxData(d3Array.max(this.cutMoveAverageDay, (d) => Number(d.availableDocks.valueOf()))
      , d3Array.max(this.moveAverage, (d) => Number(d.availableDocks.valueOf()))
      , d3Array.max(this.stationData, (d) => Number(d.availableDocks.valueOf())));
    this.x.domain(d3Array.extent(this.stationData, (d) => new Date(d.lastCommunicationTime.valueOf())));

    this.y.domain([0, Number(maximum) + 5]);

    var svg = d3.select('svg').transition();

    svg.selectAll(".line")
      .duration(750)
      .attr("d", this.line(this.stationData));

    svg.selectAll(".line1")
      .attr("d", this.line1(this.moveAverage))
      .style("opacity", 1);

    svg.selectAll(".line2")
      .attr("d", this.line2(this.cutMoveAverageDay))
      .style("opacity", 1);

    svg.select(".axis.axis--x")
      .duration(750)
      .call(this.xAxis);

    svg.select(".axis.axis--y")
      .duration(750)
      .call(this.yAxis);
  }

}
