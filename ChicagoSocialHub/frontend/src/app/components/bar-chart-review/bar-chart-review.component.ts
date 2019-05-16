import { Component, OnInit, ViewEncapsulation } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { Place } from '../../place';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-bar-chart-review',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './bar-chart-review.component.html',
  styleUrls: ['./bar-chart-review.component.css']
})
export class BarChartReviewComponent implements OnInit {

  data: Place[]
  title = 'Bar Chart';
  private width: number;
  private height: number;
  private margin = { top: 20, right: 20, bottom: 30, left: 40 };

  private x: any;
  private y: any;
  private svg: any;
  private g: any;


  constructor(private placesService: PlacesService) { }

  ngOnInit() {
    this.placesService
      .getPlaces()
      .subscribe((data: Place[]) => {
        this.data = data;
        var hasConcat = new Array(data.length).fill(false);
        for (let i = 0; i < data.length; i++) {
          for (let j = i + 1; j < data.length; j++) {
            if (data[i].name == data[j].name) {
              if (!hasConcat[i]) {
                data[i].name = data[i].name.concat(" " + data[i].address1.valueOf());
                hasConcat[i] = true;
              }
              if (!hasConcat[j]) {
                data[j].name = data[j].name.concat(" " + data[j].address1.valueOf());
                hasConcat[j] = true;
              }
            }
          }
        }
        this.initSvg();
        this.initAxis();
        this.drawAxis();
        this.drawBars();
      });

  }

  private initSvg() {
    this.svg = d3.select('svg');
    this.width = +this.svg.attr('width') - this.margin.left - this.margin.right;
    this.height = +this.svg.attr('height') - this.margin.top - this.margin.bottom;
    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private initAxis() {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(this.data.map((d) => d.name));
    this.y.domain([0, d3Array.max(this.data, (d) => Number(d.rating.valueOf()))]);
  }

  private drawAxis() {
    var xAxis = this.g.append("g")
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x)).selectAll(".tick text")
      .call(this.wrap, 100);

    this.g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('Review Count');
  }

  private drawBars() {
    this.g.selectAll('.bar')
      .data(this.data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => this.x(d.name))
      .attr('y', (d) => this.y(d.rating))
      .attr('width', this.x.bandwidth())
      .attr('height', (d) => this.height - this.y(d.rating));
  }

  private wrap(text, width) {
    text.each(function () {
      var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
      while (word = words.pop()) {
        line.push(word)
        tspan.text(line.join(" "))
        if (tspan.node().getComputedTextLength() > width) {
          line.pop()
          tspan.text(line.join(" "))
          line = [word]
          tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
        }
      }
    });
  }


}
