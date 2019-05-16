import { Component, OnInit } from '@angular/core';
import { PlacesService } from '../../places.service';
import { Router } from '@angular/router';
import * as d3 from 'd3-selection';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  constructor(private placesService: PlacesService, private router: Router) { }

  ngOnInit() {
  }
  findEntireCityStations() {
    d3.selectAll('#loading').style("opacity", 1);
    this.placesService.findEntireCityDivvyStationsInformation().subscribe(() => {
      this.router.navigate(['/heat_map_divvy']);
    });
  }

}
