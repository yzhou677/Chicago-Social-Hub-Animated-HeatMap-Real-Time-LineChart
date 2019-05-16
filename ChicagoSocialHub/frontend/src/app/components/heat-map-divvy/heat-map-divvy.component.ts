import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Station } from '../../station';
import { PlacesService } from '../../places.service';
import * as d3 from 'd3-selection';



interface Location {
  lat: number;
  lng: number;
  zoom: number;
  address_level_1?: string;
  address_level_2?: string;
  address_country?: string;
  address_zip?: string;
  address_state?: string;
  label: string;
}

@Component({
  selector: 'app-heat-map-divvy',
  templateUrl: './heat-map-divvy.component.html',
  styleUrls: ['./heat-map-divvy.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HeatMapDivvyComponent implements OnInit {

  private map: google.maps.Map = null;
  private heatmap: google.maps.visualization.HeatmapLayer = null;
  amountOfStationsOfOneBeat = 608;
  stations: Station[] = [];
  stationList = [];
  stationIndex = 0;
  setInterval: any;
  stationOneHour: Station[] = [];
  stationOneDay: Station[] = [];

  constructor(private placesService: PlacesService) { }

  ngOnInit() {
  }

  getLastSixZeroEightData(coords) {
    var station: Station[] = [];
    var left = this.stations.length % this.amountOfStationsOfOneBeat;
    this.stations = this.stations.slice(left, this.stations.length);
    let i = 0;
    let j = this.amountOfStationsOfOneBeat;
    while (j <= this.stations.length) {
      station = this.stations.slice(i, j);
      j = j + this.amountOfStationsOfOneBeat;
      i = i + this.amountOfStationsOfOneBeat;
      this.stationList.push(station)
    }
    this.stationList[0].forEach(element => {
      // can also be a google.maps.MVCArray with LatLng[] inside    
      coords.push({
        location: new google.maps.LatLng(element.latitude.valueOf(),
          element.longitude.valueOf()), weight: Number(element.availableDocks.valueOf()).valueOf()
      });
    });
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      map: this.map,
      data: coords
    });
    d3.selectAll("#date").text(this.stationList[0][0].lastCommunicationTime.valueOf());

    this.setInterval = setInterval(this.callAtInterval.bind(this), 20);
  }
  callAtTimeOut() {
    const coords = [];
    this.stationIndex = this.stationIndex + 1;
    this.stationList[this.stationIndex].forEach(element => {
      // can also be a google.maps.MVCArray with LatLng[] inside    
      coords.push({
        location: new google.maps.LatLng(element.latitude.valueOf(),
          element.longitude.valueOf()), weight: Number(element.availableDocks.valueOf()).valueOf()
      });
    });
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      map: this.map,
      data: coords
    });
    d3.selectAll("#date").text(this.stationList[this.stationIndex][0].lastCommunicationTime.valueOf());

  }
  callAtInterval() {
    console.log("running", this.stationIndex);
    if (this.stationIndex + 2 >= this.stationList.length) {
      clearInterval(this.setInterval);
      console.log("done")
      d3.selectAll('#play-button').style("opacity", 1);
    } else {
      setTimeout(this.callAtTimeOut.bind(this), 10);
    }
  }

  getWithinOneHourData() {
    var stationDataOneHour: Station[] = [];
    var dateBegin = new Date();
    for (let i = this.stationOneDay.length - 1; i >= 0; i--) {
      var dateEnd = new Date(this.stationOneDay[i].lastCommunicationTime.valueOf());
      var dateDiff = dateBegin.getTime() - dateEnd.getTime();
      var leave1 = dateDiff % (24 * 3600 * 1000);
      var hours = Math.ceil(leave1 / (3600 * 1000));
      if (hours <= 1) {
        stationDataOneHour = [this.stationOneDay[i]].concat(stationDataOneHour);
      } else {
        break;
      }
    }
    return stationDataOneHour;
  }


  onMapLoad(mapInstance: google.maps.Map) {
    d3.selectAll('#play-button').style("opacity", 0);
    this.stationIndex = 0;
    this.stationList = [];
    this.map = mapInstance;
    const coords = [];
    this.placesService
      .getEntireCityDivvyStationsInformation()
      .subscribe((data: Station[]) => {
        d3.selectAll('#loading-sign').style("opacity", 0);
        this.stationOneDay = data;
        this.stationOneHour = this.getWithinOneHourData();
        this.stations = this.stationOneHour;
        this.getLastSixZeroEightData(coords);
      });
  }

  playAnimateAgain() {
    d3.selectAll('#play-button').style("opacity", 0);
    this.stationIndex = 0;
    const coords = [];
    this.stationList[0].forEach(element => {
      // can also be a google.maps.MVCArray with LatLng[] inside    
      coords.push({
        location: new google.maps.LatLng(element.latitude.valueOf(),
          element.longitude.valueOf()), weight: Number(element.availableDocks.valueOf()).valueOf()
      });
    });
    this.heatmap = new google.maps.visualization.HeatmapLayer({
      map: this.map,
      data: coords
    });
    this.setInterval = setInterval(this.callAtInterval.bind(this), 20);
  }
  stopPlayAnimate() {
    clearInterval(this.setInterval);
    d3.selectAll('#play-button').style("opacity", 1);
  }


  playOneDayAnimation() {
    d3.selectAll('#dropdownBasic1').text("24 Hours");
    d3.selectAll('#play-button').style("opacity", 0);
    this.stationIndex = 0;
    this.stationList = [];
    const coords = [];
    this.stations = this.stationOneDay;
    this.getLastSixZeroEightData(coords);
  }

  playOneHourAnimation() {
    d3.selectAll('#dropdownBasic1').text("1 Hour");
    d3.selectAll('#play-button').style("opacity", 0);
    this.stationIndex = 0;
    this.stationList = [];
    const coords = [];
    this.stations = this.getWithinOneHourData();
    this.getLastSixZeroEightData(coords);
  }

  public location: Location = {
    lat: 41.882607,
    lng: -87.643548,
    label: 'You are Here',
    zoom: 10.5
  };


}
