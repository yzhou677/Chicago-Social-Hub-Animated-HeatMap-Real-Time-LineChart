import { Component, OnInit, Input, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Station } from '../../station';

import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-line-chart-divvy',
  templateUrl: './line-chart-divvy.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./line-chart-divvy.component.css']
})
export class LineChartDivvyComponent implements OnInit, OnDestroy {

  title = 'Line Chart';

  stationDataSevenDay: Station[];
  stationDataOneHour: Station[];
  stationDataOneDay: Station[];

  updatedStationDataSevenDay: Station[];
  updatedStationDataOneHour: Station[];
  updatedStationDataOneDay: Station[];

  stationDataAll: Station[];


  thisID: any;

  constructor(private placesService: PlacesService) { }

  getWithinSevenDayData(data) {
    var stationDataSevenDays: Station[] = [];
    var dateBegin = new Date();
    for (let i = data.length - 1; i >= 0; i--) {
      var dateEnd = new Date(data[i].lastCommunicationTime.valueOf());
      var dateDiff = dateBegin.getTime() - dateEnd.getTime();
      var dayDiff = Math.ceil(dateDiff / (24 * 3600 * 1000));
      if (dayDiff <= 7) {
        stationDataSevenDays = [data[i]].concat(stationDataSevenDays);
      } else {
        break;
      }
    }
    return stationDataSevenDays;
  }

  getWithinOneHourData() {
    var stationDataOneHour: Station[] = [];
    var dateBegin = new Date();
    for (let i = this.stationDataSevenDay.length - 1; i >= 0; i--) {
      var dateEnd = new Date(this.stationDataSevenDay[i].lastCommunicationTime.valueOf());
      var dateDiff = dateBegin.getTime() - dateEnd.getTime();
      var leave1 = dateDiff % (24 * 3600 * 1000);
      var hours = Math.ceil(leave1 / (3600 * 1000));
      if (hours <= 1) {
        stationDataOneHour = [this.stationDataSevenDay[i]].concat(stationDataOneHour);
      } else {
        break;
      }
    }
    return stationDataOneHour;
  }

  getWithinOneDayData() {
    var stationDataOneDay: Station[] = [];
    var dateBegin = new Date();
    for (let i = this.stationDataSevenDay.length - 1; i >= 0; i--) {
      var dateEnd = new Date(this.stationDataSevenDay[i].lastCommunicationTime.valueOf());
      var dateDiff = dateBegin.getTime() - dateEnd.getTime();
      var dayDiff = Math.ceil(dateDiff / (24 * 3600 * 1000));
      if (dayDiff <= 1) {
        stationDataOneDay = [this.stationDataSevenDay[i]].concat(stationDataOneDay);
      } else {
        break;
      }
    }
    return stationDataOneDay;
  }

  updateStationDataWithinSevenDay() {
    var updateDateArray: Station[] = this.stationDataSevenDay;
    var dateBegin = new Date();
    for (let i = 0; i < this.stationDataSevenDay.length; i++) {
      var dateEnd = new Date(this.stationDataSevenDay[i].lastCommunicationTime.valueOf());
      var dateDiff = dateBegin.getTime() - dateEnd.getTime();
      var dayDiff = Math.ceil(dateDiff / (24 * 3600 * 1000));
      if (dayDiff > 7) {
        updateDateArray = this.stationDataSevenDay.slice(i + 1, this.stationDataSevenDay.length);
      } else {
        break;
      }
    }
    this.stationDataSevenDay = updateDateArray;
    return updateDateArray;
  }

  updateStationDataWithinOneDay() {
    var updateDateArray: Station[] = this.stationDataOneDay;
    var dateBegin = new Date();
    for (let i = 0; i < this.stationDataOneDay.length; i++) {
      var dateEnd = new Date(this.stationDataOneDay[i].lastCommunicationTime.valueOf());
      var dateDiff = dateBegin.getTime() - dateEnd.getTime();
      var dayDiff = Math.ceil(dateDiff / (24 * 3600 * 1000));
      if (dayDiff > 1) {
        updateDateArray = this.stationDataOneDay.slice(i + 1, this.stationDataOneDay.length);
      } else {
        break;
      }
    }
    this.stationDataOneDay = updateDateArray;
    return updateDateArray;
  }

  updateStationDataWithinOneHour() {
    var updateDateArray: Station[] = this.stationDataOneHour;
    var dateBegin = new Date();
    for (let i = 0; i < this.stationDataOneHour.length; i++) {
      var dateEnd = new Date(this.stationDataOneHour[i].lastCommunicationTime.valueOf());
      var dateDiff = dateBegin.getTime() - dateEnd.getTime();
      var leave1 = dateDiff % (24 * 3600 * 1000);
      var hours = Math.ceil(leave1 / (3600 * 1000));
      if (hours > 1) {
        updateDateArray = this.stationDataOneHour.slice(i + 1, this.stationDataOneHour.length);
      } else {
        break;
      }
    }
    this.stationDataOneHour = updateDateArray;
    return updateDateArray;
  }

  stationDataSevenDayDuplicate(stationData) {
    return this.stationDataAll.some(station_selected_info => station_selected_info.id == stationData.id
      && station_selected_info.stationName == stationData.stationName
      && station_selected_info.availableDocks == stationData.availableDocks
      && station_selected_info.lastCommunicationTime == stationData.lastCommunicationTime)
  }


  set updateDataSevenDay(status: Station[]) {
    this.stationDataSevenDay = status;
    this.updatedStationDataSevenDay = this.updateStationDataWithinSevenDay();

  }

  set updateDataOneDay(status: Station[]) {
    this.stationDataOneDay = status;
    this.updatedStationDataOneDay = this.updateStationDataWithinOneDay();

  }

  set updateDataOneHour(status: Station[]) {
    this.stationDataOneHour = status;
    this.updatedStationDataOneHour = this.updateStationDataWithinOneHour();

  }

  ngOnInit() {
    this.placesService
      .getSelectedStation()
      .subscribe((data: Station[]) => {
        this.thisID = data[0].id;
        this.stationDataAll = data;
        this.stationDataSevenDay = this.getWithinSevenDayData(data);
        this.updatedStationDataSevenDay = this.stationDataSevenDay;
        this.updateDataOneDay = this.getWithinOneDayData();
        this.updateDataOneHour = this.getWithinOneHourData();
        let UpdateObservable = this.placesService.getUpdates(this.thisID);
        UpdateObservable.subscribe((latestStatus: Station) => {
          if (!this.stationDataSevenDayDuplicate(latestStatus)) {
            console.log("latestStatus:", latestStatus)
            this.updateDataSevenDay = this.stationDataSevenDay.concat([latestStatus]);
            this.updateDataOneDay = this.stationDataOneDay.concat([latestStatus]);
            this.updateDataOneHour = this.stationDataOneHour.concat([latestStatus]);
            this.stationDataAll = this.stationDataAll.concat([latestStatus]);
          }
        });
      });
  }


  ngOnDestroy() {
    this.placesService.removeRegisteredIdOnDestory(this.thisID).subscribe(() => {
      console.log("removed")
    });
    this.placesService.socketOff();
  }

}
