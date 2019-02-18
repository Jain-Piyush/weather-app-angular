import { Component, OnInit } from '@angular/core';
import * as CanvasJS from './canvasjs.min';
import {MatDatepickerInputEvent} from '@angular/material/datepicker';
import {FormControl} from '@angular/forms';
import * as _moment from 'moment';
import {default as _rollupMoment, Moment} from 'moment';

const moment = _rollupMoment || _moment;

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {

	sdate = new FormControl(moment('1/2/2012'));
	edate = new FormControl(moment('1/2/2015'));

  startYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.sdate.value;
    ctrlValue.year(normalizedYear.year());
    this.sdate.setValue(ctrlValue);
  }

  startMonthHandler(normlizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.sdate.value;
    ctrlValue.month(normlizedMonth.month());
    this.sdate.setValue(ctrlValue);
    datepicker.close();
    this.startDate = new Date(this.sdate.value).getTime();
    this.fetchData()
  }

  endYearHandler(normalizedYear: Moment) {
    const ctrlValue = this.edate.value;
    ctrlValue.year(normalizedYear.year());
    this.edate.setValue(ctrlValue);
  }

  endMonthHandler(normlizedMonth: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.edate.value;
    ctrlValue.month(normlizedMonth.month());
    this.edate.setValue(ctrlValue);
    datepicker.close();
    this.endDate = new Date(this.edate.value).getTime();
    this.fetchData()
  }

  unit = 'Rainfall'
  region = 'Wales' 
  dataPoints = [{x:0,y:0}]
  startDate = new Date(2012,0,1).getTime();
  endDate = new Date(2015,0,1).getTime()

  constructor() {
       
    }

  ngOnInit() {
      this.fetchData()
    }

  unitChange(e){
   this.unit = e.value
   this.fetchData()
  }

  regionChange(e) {
  	this.region = e.value
  	this.fetchData()
  }

  fetchData(){

  	var targetUrl = `https://s3.eu-west-2.amazonaws.com/interview-question-data/metoffice/${this.unit}-${this.region}.json`

  	var request = new Request(targetUrl);
  	fetch(request,{mode:'cors'})
      .then(blob => blob.json())
      .then(data => {
      	let dps = []

        for(var i = 0; i < data.length; i++) {
         
          dps.push({ x: new Date(data[i].year,data[i].month-1,1), y: data[i].value, 
                     year:data[i].year,month:data[i].month,date: new Date(data[i].year,data[i].month-1,1).getTime()
                  });  
          
        }
        let filterData = dps.filter((o)=> { 
 
            if(this.startDate && this.endDate){
              return o.date >= this.startDate && o.date <= this.endDate
            }else if(this.startDate){
              return o.date >= this.startDate
            }
            else if(this.endDate) {
              return o.date <= this.endDate
            }
            else{return o}
           });
        this.generateChart(filterData)
      })
      .catch(e => {
        console.log('error in fetching data----',e);
        return e;
      });
       
  }

  generateChart(dps) {
    this.dataPoints = dps
  	let chart = new CanvasJS.Chart("chartContainer", {
       	theme: "dark1",
		animationEnabled: true,
		zoomEnabled: true,
		title: {
			text: `Region = ${this.region}, Unit = ${this.unit}`
		},
		axisY: {
         includeZero: false
       },
		data: [{
			type: "area",
			dataPoints: this.dataPoints
		}]
	});
		
	chart.render();
  }
}




