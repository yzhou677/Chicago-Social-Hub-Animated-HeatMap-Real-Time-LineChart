import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Place } from '../../place';
import { PlacesService } from '../../places.service';

import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';

@Component({
  selector: 'app-line-chart-review',
  templateUrl: './line-chart-review.component.html',
  styleUrls: ['./line-chart-review.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class LineChartReviewComponent implements OnInit {
  title = 'Line Chart';
  data: Place[]

  private margin = { top: 20, right: 20, bottom: 30, left: 50 };
  private width: number;
  private height: number;
  private x: any;
  private y: any;
  private svg: any;
  private line: d3Shape.Line<Place>;

  constructor(private placesService: PlacesService) {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
  }

  ngOnInit() {
    this.placesService
      .getPlaces()
      .subscribe((data: Place[]) => {
        this.data = data;
        var hasConcat = new Array(data.length).fill(false);
        for (let i = 0; i < data.length; i++) {
          for(let j = i +1; j < data.length; j++) {
            if (data[i].name == data[j].name){
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
        this.drawLine();
      });

  }
 

  private initSvg() {
    this.svg = d3.select('svg')
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  private initAxis() {
    this.x = d3Scale.scaleBand().range([0, this.width]).padding(1);
    this.y = d3Scale.scaleLinear().range([this.height, 0]);
    this.x.domain(this.data.map((d) => d.name));
    this.y.domain(d3Array.extent(this.data, (d) => Number(d.rating.valueOf())));
  }

  private drawAxis() {

    this.svg.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x)).selectAll(".tick text")
      .call(this.wrap, 100);

    this.svg.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .text('Review Count');
  }

  private drawLine() {
    this.line = d3Shape.line<Place>();
    this.line.x((d: any) => this.x(d.name))
      .y((d: any) => this.y(Number(d.rating.valueOf())));

    this.svg.append('path')
      .datum(this.data)
      .attr('class', 'line')
      .attr('d', this.line);
  }
   private wrap(text, width) {
    text.each(function() {
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
