import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

import { BillingService } from '../billing.service';

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
    dateInput: 'MMMM YYYY',
  },
  display: {
    dateInput: 'MMMM YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export interface DataSource {
  APICount: string;
  APIName: string;
  APIVersion: string;
  ActivePlan: any;
  ApplicationName: string;
  Date: any;
  Price: any;
  ResourceName: string;
  TotalBilling: any;
}

export interface Type {
  value: string;
  viewValue: string;
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
  selector: 'app-billing',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.css'],
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
export class BillingComponent implements OnInit{

  isLoading: boolean = false
  
  // Used for mat Autocomplete
  app: App[] = JSON.parse(localStorage.getItem('app') || '').map((val: any) => ({text: val}));
  options: any[] = this.app;
  myControl = new FormControl<string | any>('');
  filteredOptions: Observable<any[]> | undefined;

  // Used for mat Date Picker
  date = new FormControl(moment().subtract(1, 'months'));
  minDate: Date;
  maxDate: Date;

  // Used for mat Table
  // data = new MatTableDataSource();
  data!: MatTableDataSource<DataSource>;
  price: any;
  totalCount: any;
  totalBilling: any;

  // displayedColumns: any[] = [];
  header0: Header[] = [
    { text: 'API Name', value: 'APIName', width: '35%' },
    { text: 'Operation Name', value: 'ResourceName', width: '30%' },
    { text: 'Count', value: 'APICount', width: '10%' },
    { text: 'Price', value: 'Price', width: '10%' },
    { text: 'Total', value: 'TotalBilling', width: '15%' },
  ]
  header1: Header[] = [
    { text: 'API Name', value: 'APIName', width: '50%' },
    { text: 'Operation Name', value: 'ResourceName', width: '40%' },
    { text: 'Count', value: 'APICount', width: '10%' },
  ]
  header: Header[] = [];

  // for PDF
  billingType: string = '';
  currentFilter: string = '';
  yearMonth: any;
  
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private billingService: BillingService,
    private router: Router,
  ) {
    var currentDate = new Date();
    const firstDay = 1;
    
    var prevMonth = currentDate.getMonth() - 1;
    this.maxDate = new Date(currentDate.getFullYear(), prevMonth, firstDay);
    
    var prevYear = currentDate.getFullYear() - 1;
    this.minDate = new Date(prevYear, prevMonth + 1, firstDay);
  }

  ngOnInit(): void {
    // Filter Autocomplete
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => {
        const name = typeof value === 'string' ? value : value?.value;
        return name ? this._filter(name as string) : this.app.slice();
      }),
    );
  }

  displayFn(temp: any): string {
    return temp && temp.text ? temp.text : '';
  }

  private _filter(text: string): any[] {
    const filterValue = text.toLowerCase();

    return this.options.filter(option => option.text.toLowerCase().includes(filterValue));
  }

  // Date picker
  setMonthAndYear(normalizedMonthAndYear: Moment, datepicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value!;
    ctrlValue.date(1);
    ctrlValue.month(normalizedMonthAndYear.month());
    ctrlValue.year(normalizedMonthAndYear.year());
    this.date.setValue(ctrlValue);
    datepicker.close();
  }

  // getAll
  getAll(event: any): void{
    this.isLoading = true
    event.preventDefault();
    
    var monthDate = this.date.value?.format("YYYY-MM");

    var value = this.myControl.value.text;
    var body = {
      date: monthDate,
      value: value,
      token: sessionStorage.getItem('token'),
      username: sessionStorage.getItem('username'),
      userrole: sessionStorage.getItem('session')
    }
    this.billingService.post_getAll(body)
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
              // response.data.sort((a: any, b: any) => { return b.count!='-' && a.count!='-' ? b.count-a.count : b.count.toString().localeCompare(a.count.toString()) });
              // this.data = new MatTableDataSource(response.data);
              // this.data.paginator = this.paginator;
              // this.data.sort = this.sort;
            // this.usedFilter.value = this.myControl.value.value
            // this.usedFilter.type = this.selectValue
            // this.usedDates = this.range
            
            this.billingType = response.ActivePlan
            this.currentFilter = value
            this.yearMonth = monthDate
            if(response.ActivePlan == 'Tier'){
              response.vueArray.sort((a: any, b: any) => { return b.APICount-a.APICount });
              this.data = new MatTableDataSource(response.vueArray);
              this.data.paginator = this.paginator;
              this.data.sort = this.sort;
              this.header = this.header1
              this.price = response.Price
              this.totalCount = response.TotalCount
              this.totalBilling = response.TotalBilling
            }
            else{
              response.sort((a: any, b: any) => { return b.TotalBilling-a.TotalBilling });
              this.data = new MatTableDataSource(response);
              this.data.paginator = this.paginator;
              this.data.sort = this.sort;
              this.header = this.header0
            }
          }
        }
        this.isLoading = false
      },
      error => {
        console.log(error);
      }
    );
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
    var tempData: any[] = this.data.data;
    console.log(this.data)

    let w: any = window.open()
      
    w.document.write('<style>' +
      'body { width: 300mm; margin: auto; font-family: Tahoma, sans-serif; }' +
      'table { border: 1px solid black; border-collapse: collapse; margin:auto; width: 90%;}'+
      'th, td { border: 1px solid black; border-collapse: collapse; margin:auto; padding: 5px; }'+
      '</style>'
    )
    
    w.document.write(`<header>
      <img src="../assets/img/LogoBankSinarmas_black.png" style="float: left; width: 150; height: 35;" ></img><br/>
      <h2 style="text-align: center">Application ${this.currentFilter}</h2>
      <p style="margin: left;">Date : ${this.yearMonth}
    </header>`)

    if (this.billingType != "Tier") { // if single type
      let total: any = tempData.reduce(function(acc, item) {
        if(item.TotalBilling != '-')
          return acc + item.TotalBilling;
        else
          return acc;
      }, 0);

      tempData.sort((a,b) => b.TotalBilling - a.TotalBilling) //sort data
      
      //tabel api
      w.document.write('<table>')
      w.document.write('<tr style="padding: 20px">')
      this.header0.forEach((item) => { w.document.write(`<th style="font-size: 120%; width: ${item.width};">${item.text}</th>`) })
      w.document.write('</tr>')
      
      tempData.forEach((item) => {
        if(item.count == undefined) item.count = "-"
        w.document.write(
        `<tr> 
          <td>${item.APIName}</td>
          <td style="width: 14%;">${item.ResourceName}</td>
          <td style="text-align: center">${item.APICount}</td>
          <td>${new Intl.NumberFormat('id-ID', {style: 'currency',currency: 'IDR',}).format(item.Price)}</td>
          <td>${new Intl.NumberFormat('id-ID', {style: 'currency',currency: 'IDR',}).format(item.TotalBilling)}</td>
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
      w.document.write('</table>')
      
      w.document.write('<br>')
    } else {
      tempData.sort((a,b) => b.APICount - a.APICount) //sort data
      
      //tabel api
      w.document.write('<table>')
      w.document.write('<tr style="padding: 20px">')
      this.header1.forEach((item) => { w.document.write(`<th style="font-size: 120%; width: ${item.width};">${item.text}</th>`) })
      w.document.write('</tr>')
      
      tempData.forEach((item) => {
        if(item.count == undefined) item.count = "-"
        w.document.write(
        `<tr> 
          <td>${item.APIName}</td>
          <td style="width: 14%;">${item.ResourceName}</td>
          <td style="text-align: center">${item.APICount}</td>
        <tr>`
      )})
      w.document.write('</table>')
      
      w.document.write('<br>')
      
      w.document.write(
        `<table style="border: 0px; margin: auto;">
          <tr>
            <td style="border: 0px; width: 18%;">Price per hit</td>
            <td style="border: 0px; width: 2%;">:</td>
            <td style="border: 0px; width: 80;%">${new Intl.NumberFormat('id-ID', {style: 'currency',currency: 'IDR',}).format(this.price)}</td>
          </tr>
          <tr>
            <td style="border: 0px; width: 18%;">Total count</td>
            <td style="border: 0px; width: 2%;">:</td>
            <td style="border: 0px; width: 80%;">${this.totalCount}</td>
          </tr>
          <tr>
            <td style="border: 0px; width: 18%;">Total billing</td>
            <td style="border: 0px; width: 2%;">:</td>
            <td style="border: 0px; width: 80%;">${new Intl.NumberFormat('id-ID', {style: 'currency',currency: 'IDR',}).format(this.totalBilling)}</td>
          </tr>
        </table>`
      )
    }
    
    w.document.close()
    w.setTimeout(function () {
      w.print()
    }, 1000)
  }
 
}
