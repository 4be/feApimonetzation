import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { MostFrequentService } from '../most-frequent.service';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment, Moment} from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';
import { r3JitTypeSourceSpan } from '@angular/compiler';
import { Chart } from 'chart.js/auto';

const moment = _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export interface DataSource {
  key: any,
  doc_count: any,
}

export interface Header{
  text: string,
  value: string,
  width: string,
}


@Component({
  selector: 'app-most-frequent',
  templateUrl: './most-frequent.component.html',
  styleUrls: ['./most-frequent.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class MostFrequentComponent implements OnInit{

  isLoading: boolean = false;

  // Used for mat Date Picker
  range = new FormGroup({
    start: new FormControl<Date | null>(new Date()),
    end: new FormControl<Date | null>(new Date()),
  });

  // Used for mat Table
  // data = new MatTableDataSource();
  dataAPI!: MatTableDataSource<DataSource>;
  dataApplication!: MatTableDataSource<DataSource>;

  // displayedColumns: any[] = [];
  headerApi: Header[] = [
    { text: '#', value:  'index', width: '5%' },
    { text: 'API Name', value:  'key', width: '80%' },
    { text: 'Count', value: 'doc_count', width: '15%' },
  ]
  headerApp: Header[] = [
    { text: '#', value:  'index', width: '5%' },
    { text: 'Application Name', value:  'key', width: '80%' },
    { text: 'Count', value: 'doc_count', width: '15%' },
  ]

  // Used for Charts
  chart1: Chart;
  chart2: Chart;
  
  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private mostFrequentService: MostFrequentService, 
    private router: Router,
  ) { }

  ngOnInit(): void { this.getAll(null); }

  // For datepicker's Tooltip
  tooltipValue(date: any){
    if(date)
      return moment(date).format("DD-MM-YYYY").toString();
    else
      return 'No Date Input';
  }


  // getAll
  getAll(event: any): void{
    this.isLoading = true
    if(event) event.preventDefault();

    if(this.range.value.end === null) this.range.value.end = this.range.value.start

    // console.log(this.range.value)
    
    var from = moment(this.range.value.start).format("YYYY-MM-DD");
    var to   = moment(this.range.value.end).format("YYYY-MM-DD");

    var body = {
      dates: {
        from: from,
        to: to
      },
      type: '',
      token: sessionStorage.getItem('token'),
      username: sessionStorage.getItem('username'),
      userrole: sessionStorage.getItem('session')
    }

    var types = ['apiName.keyword', 'applicationName.keyword']
    types.forEach((type, i) => {
      body["type"] = type;
      this.mostFrequentService.post_getAll(body)
      .subscribe(
        (response)=>{
          if(response.errorCode == 2) {
            sessionStorage.clear();
            localStorage.clear();
            this.router.navigateByUrl('/');
          }
          else {
            if (!i) {
              this.dataAPI = new MatTableDataSource(response.aggregations.apiName.buckets.map((item: any, index: any) => {return {...item, index: index+1}}));
              this.mostFrequentService.setApiData(this.dataAPI);
              
              let apiNames =  this.dataAPI.data.map(d => d.key);
              let apiCount =  this.dataAPI.data.map(d => d.doc_count);

              const ctx = (document.getElementById('apiChart') as any).getContext('2d');
              if(this.chart1) this.chart1.destroy();
              this.chart1 = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: apiNames,
                  datasets: [
                    {
                      label: 'Count',
                      data: apiCount,
                      backgroundColor: 'rgb(146, 6, 11)',
                      borderColor: 'red',
                      borderWidth: 1
                    }
                  ]
                },
                options: {}
              });

            }
            else {
              this.dataApplication = new MatTableDataSource(response.aggregations.apiName.buckets.map((item: any, index: any) => {return {...item, index: index+1}}))
              this.mostFrequentService.setApplicationData(this.dataApplication);
              
              let applicationNames =  this.dataApplication.data.map(d => d.key);
              let applicationCount =  this.dataApplication.data.map(d => d.doc_count);

              const ctx = (document.getElementById('applicationChart') as any).getContext('2d');
              if(this.chart2) this.chart2.destroy();
              this.chart2 = new Chart(ctx, {
                type: 'bar',
                data: {
                  labels: applicationNames,
                  datasets: [
                    {
                      label: 'Count',
                      data: applicationCount,
                      backgroundColor: 'rgb(146, 6, 11)',
                      borderColor: 'red',
                      borderWidth: 1
                    }
                  ]
                },
                options: {}
              });
            }
            this.isLoading = false
          }
        },
        error => {
          console.log(error);
        }
      );
    })
  }
  
  // Return array element
  elementOf(array: any[]): string[]{
    if(!array) { return []; }
    return array.map(val => val.value)
  }

  // Filter Data Table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataAPI.filter = filterValue.trim().toLowerCase();
    this.dataApplication.filter = filterValue.trim().toLowerCase();
  }
 
}