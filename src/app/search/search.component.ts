import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { SearchService } from '../search.service';

// Depending on whether rollup is used, moment needs to be imported differently.
// Since Moment.js doesn't have a default export, we normally need to import using the `* as`
// syntax. However, rollup creates a synthetic default module and we thus need to import it using
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import {default as _rollupMoment, Moment} from 'moment';
import { MatDatepicker } from '@angular/material/datepicker';

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
  AplicationName: string;
  APIName: string;
  APIVersion: string;
  ResourceName: string;
  count: any;
  Price: any;
}

export interface Type {
  value: string;
  viewValue: string;
}

export interface Api {
  text: string;
  value: string;
}

export interface App {
  text: string;
}

export interface Header{
  text: string,
  value: string,
  width: string,
}

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
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
export class SearchComponent implements OnInit{

  isLoading: boolean = false;
  
  // Used for mat Select
  selectValue: string = 'api';
  types: Type[] = [
    {value: 'api', viewValue: 'API Name'},
    {value: 'app', viewValue: 'Application Name'},
  ];
  
  // Used for mat Autocomplete
  api: Api[] = JSON.parse(localStorage.getItem('api') || '');
  app: App[] = JSON.parse(localStorage.getItem('app') || '').map((val: any) => ({text: val}));
  options: any[] = this.api;
  myControl = new FormControl<string | any>('');
  filteredOptions: Observable<any[]> | undefined;

  // Used for mat Date Picker
  range = new FormGroup({
    start: new FormControl<Date | null>(null),
    end: new FormControl<Date | null>(null),
  });

  // Used for mat Table
  // data = new MatTableDataSource();
  data!: MatTableDataSource<DataSource>;

  // displayedColumns: any[] = [];
  headerApi: Header[] = [
    { text: 'Application Name', value:  'ApplicationName', width: '44%' },
    { text: 'Resource Name', value: 'ResourceName', width: '32%' },
    { text: 'Count', value: 'count', width: '10%' },
    { text: 'Price', value: 'Price', width: '14%' },
  ]
  headerApp: Header[] = [
    { text: 'API Name', value:  'APIName', width: '36%' },
    { text: 'Version', value: 'APIVersion', width: '8%' },
    { text: 'Resource Name', value: 'ResourceName', width: '32%' },
    { text: 'Count', value: 'count', width: '10%' },
    { text: 'Price', value: 'Price', width: '14%' },
  ]
  header: Header[] = [];
  
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private searchService: SearchService, 
    private router: Router,
  ) { }

  ngOnInit(): void {
    // Filter Autocomplete
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.value;
        return name ? this._filter(name as string) : this.api.slice();
      }),
    );
  }

  // If select changed, change autocomplete options
  onSelectChange(event: any){
    this.options = event.value === 'api' ? this.api : this.app
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.value;
        return name ? this._filter(name as string) : this.options.slice();
      }),
    );
  }

  displayFn(tempData: any): string {
    return tempData && tempData.text ? tempData.text : '';
  }

  private _filter(text: string): any[] {
    const filterValue = text.toLowerCase();

    return this.options.filter(option => option.text.toLowerCase().includes(filterValue));
  }

  // For datepicker's Tooltip
  tooltipValue(date: any){
    if(date)
      return moment(date).format("DD-MM-YYYY").toString();
    else
      return 'No Date Input';
  }

  // getAll
  getAll(event: any): void{
    this.isLoading = true;
    event.preventDefault();

    var text, value;
    if(this.selectValue == 'api'){
      text = this.myControl.value.text
      value = this.myControl.value.value
    }
    else{
      text = this.myControl.value.text
      value = this.myControl.value.text
    }

    if(this.range.value.end === null) this.range.value.end = this.range.value.start

    var from = moment(this.range.value.start).format("YYYY-MM-DD");
    var to   = moment(this.range.value.end).format("YYYY-MM-DD");
    var body = {
      dates: {
        from: from,
        to: to
      },
      text: text,
      value: value,
      type: this.selectValue,
      token: sessionStorage.getItem('token'),
      username: sessionStorage.getItem('username'),
      userrole: sessionStorage.getItem('session')
    }

    this.searchService.post_getAll(body)
    .subscribe(
      (response)=>{
        // console.log(response)
        if(response.errorCode == 2) {
          sessionStorage.clear();
          localStorage.clear();
          this.router.navigateByUrl('/');
        }
        else {
          if(!response.errorCode){
            // data.data.activePlan == undefined ? this.activePlan = null : this.activePlan = data.data.activePlan
            response.data.sort((a: any, b: any) => { return b.count!='-' && a.count!='-' ? b.count-a.count : b.count.toString().localeCompare(a.count.toString()) });
            this.data = new MatTableDataSource(response.data);
            this.data.paginator = this.paginator;
            this.data.sort = this.sort;
            this.header = this.headerSelected();
            // this.usedFilter.value = this.myControl.value.value
            // this.usedFilter.type = this.selectValue
            // this.usedDates = this.range
          }
        }
        this.isLoading = false;
      },
      error => {
        console.log(error);
      }
    );
  }
  
  headerSelected(){
    if(this.selectValue == 'api')
      return this.headerApi
    else if (this.selectValue == 'app')
      return this.headerApp
    else
      return this.header
  }

  // Return array element
  elementOf(array: any[]): string[]{
    if(!array) { return []; }
    return array.map(val => val.value)
  }

  // Filter Data Table
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.data.filter = filterValue.trim().toLowerCase();

    if (this.data.paginator) {
      this.data.paginator.firstPage();
    }
  }

  // Download PDF
  downloadPDF() {
    var tempData: any[] = this.data.data
    tempData = tempData.sort((a,b) => b.count - a.count);
    let total: any = tempData.reduce(function(acc, item) {
      if(item.count != '-' && item.Price != '-')
        return acc + (item.count * item.Price);
      else
        return acc;
    }, 0);

    if(this.range.value.end === null) this.range.value.end = this.range.value.start

    var from = moment(this.range.value.start).format("YYYY-MM-DD");
    var to   = moment(this.range.value.end).format("YYYY-MM-DD");
    
    let w: any = window.open()
    
    w.document.write('<style>' +
      'body { width: 300mm; margin: auto; font-family: Tahoma, sans-serif; }' +
      'table { border: 1px solid black; border-collapse: collapse; margin:auto; width: 80%;}'+
      'th, td { border: 1px solid black; border-collapse: collapse; margin:auto; padding: 5px; }'+
      '</style>'
    )

    w.document.write(`<header">
      <img src="../assets/img/LogoBankSinarmas_black.png" style="float: left; width: 150; height: 35;" ></img><br/>
      <h2 style="text-align: center"> Showing result of ${this.selectValue.toUpperCase()} that contains "${this.myControl.value.text}" </h2>
      <p>Date Range : ${from} ~ ${to} </p>
    </header>`)

    //tabel api
    w.document.write('<table>')
    w.document.write('<tr style="padding: 20px">')
    
    if(this.selectValue == 'api'){ // find by api
      this.headerApi.forEach((item) => { w.document.write(`<th style="font-size: 120%; width: ${item.width};">${item.text}</th>`) })
      w.document.write('</tr>')
      tempData.forEach(function(item) {
        var price, aligns
        if(item.count == undefined) item.count = "-"
        if(Number.isInteger(item.Price)) {
          price = new Intl.NumberFormat('id-ID', {style: 'currency',currency: 'IDR',}).format(item.Price)
          aligns = 'left'
        }
        else {
          price = item.Price
          aligns = 'center'
        }
        w.document.write(
        `<tr> 
          <td>${item.ApplicationName}</td>
          <td>${item.ResourceName}</td>
          <td style="text-align: center">${item.count}</td>
          <td style="text-align: ${aligns}">${price}</td>
        <tr>`
      )})
      w.document.write(
        `<tr>
          <td style="border: 0"></td>
          <td style="border: 0"></td>
          <td style="font-weight: bold">Total</td>
          <td>${new Intl.NumberFormat('id-ID', {style: 'currency',currency: 'IDR',}).format(total)}</td>
        </tr>`
      )
    }
    else if(this.selectValue == 'app'){ // find by applications
      this.headerApp.forEach((item) => { w.document.write(`<th style="font-size: 120%; width: ${item.width};">${item.text}</th>`) })
      w.document.write('</tr>')
      
      tempData.forEach((item) => {
        var price, aligns
        if(item.count == undefined) item.count = "-"
        if(Number.isInteger(item.Price)) {
          price = new Intl.NumberFormat('id-ID', {style: 'currency',currency: 'IDR',}).format(item.Price)
          aligns = 'left'
        }
        else {
          price = item.Price
          aligns = 'center'
        }
        w.document.write(
        `<tr> 
          <td>${item.APIName}</td>
          <td>${item.APIVersion}</td>
          <td>${item.ResourceName}</td>
          <td style="text-align: center">${item.count}</td>
          <td style="text-align: ${aligns}">${price}</td>
        <tr>`
      )})
      w.document.write(
        `<tr>
          <td style="border: 0"></td>
          <td style="border: 0"></td>
          <td style="border: 0"></td>
          <td style="font-weight: bold">Total</td>
          <td>${new Intl.NumberFormat('id-ID', {style: 'currency',currency: 'IDR',}).format(total)}</td>
        </tr>`
      )
    }

    w.document.write('</table>')
    
    w.document.write('<br>')
    
    w.document.close()
    w.setTimeout(function () {
      w.print()
    }, 1000)

  }
  
}