import { Component, OnInit, ViewChild, Inject, ElementRef, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar, MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { map, startWith } from 'rxjs/operators';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

import { PricingService } from '../pricing.service';

export interface DataSource {
  APIName: string;
  ResourceName: string;
  Price: any;
}

export interface App {
  text: string;
}

export interface Header{
  text: string,
  value: string,
  width: string,
}

export interface Tier{
  hitLimit: number,
  price: any
}

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.css'],
})
export class PricingComponent implements OnInit{

  isLoading: boolean = false
  
  // Used for mat Autocomplete
  app: App[] = JSON.parse(localStorage.getItem('app') || '').map((val: any) => ({text: val}));
  options: any[] = this.app;
  myControl = new FormControl<string | any>('');
  filteredOptions: Observable<any[]> | undefined;

  // User for set active button
  activePlan: string = '';

  // Used for mat Table
  // data = new MatTableDataSource();
  data!: MatTableDataSource<DataSource>;
  applicationName!: string;
  applicationID!: string;

  // displayedColumns: any[] = [];
  header: Header[] = [
    { text: 'API Name', value:  'APIName', width: '50%' },
    { text: 'Resource Name', value: 'ResourceName', width: '35%' },
    { text: 'Price', value: 'Price', width: '15%' },
  ];
  
  // Userd for table's paginator and sorting
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  // Used for tier
  tiers: Tier[] = [ {hitLimit: 0, price: 0} ];
  tierLastPrice: any | null = 0;
  readonly: boolean = true;

  tempTiers: Tier[] = [];
  tempTierLastPrice: string | null = null;

  // User for Drag and Scroll tiers
  @ViewChild('tierCard', { static: false })
  tierCard!: ElementRef;
  
  constructor(
    private pricingService: PricingService, 
    private router: Router,
    private _snackbar: MatSnackBar,
    public dialog: MatDialog,
  ) { }

  snackbar(text: string){
    this._snackbar.openFromComponent(SnackbarPricing, {
      duration: 3000,
      data: text
    });
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
    // this.getAll(null)
  }
  
  displayFn(tempData: any): string {
    return tempData && tempData.text ? tempData.text : '';
  }

  private _filter(text: string): any[] {
    const filterValue = text.toLowerCase();

    return this.options.filter(option => option.text.toLowerCase().includes(filterValue));
  }


  // getAll
  getAll(event: any): void{
    this.isLoading = true
    if(event) event.preventDefault();

    var body = {
      // name: 'digital-banking',
      name: this.myControl.value.text,
      token: sessionStorage.getItem('token'),
      username: sessionStorage.getItem('username'),
      userrole: sessionStorage.getItem('session')
    }

    this.pricingService.post_getAll(body)
    .subscribe(
      (response)=>{
        if(response.errorCode == 2) {
          sessionStorage.clear();
          localStorage.clear();
          this.router.navigateByUrl('/');
          this.snackbar(response.message);
        }
        else {
          if(!response.errorCode){
            this.activePlan = response.activePlan;
            this.data = new MatTableDataSource(response.result);
            this.data.paginator = this.paginator;
            this.data.sort = this.sort;
            if(response.tierResult.length){
              this.tiers = response.tierResult
              this.tierLastPrice = response.lastTier
              this.applicationName = response.result[0].ApplicationName
              this.applicationID = response.result[0].ApplicationID
            }
            else{
              this.tiers = [{hitLimit: 0, price: 0}]
              this.tierLastPrice = null
              // this.tierCount = 0
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

  addTier(position: number){
    const maxScrollLeft = this.tierCard.nativeElement.scrollWidth - this.tierCard.nativeElement.offsetWidth;
    const xPosition = maxScrollLeft ? maxScrollLeft + 200 : 0
    if(position){
      var lastIndex = this.tiers.length - 1;
      this.tiers.push({hitLimit: this.tiers[lastIndex].hitLimit * 2, price: this.tierLastPrice})
      this.tierLastPrice = this.tierLastPrice / 2
      this.tierCard.nativeElement.style.transform = `translate3d(${xPosition * -1}px,0px,0px)`
    }
    else{
      this.tiers.unshift({hitLimit: this.tiers[0].hitLimit / 2, price: this.tiers[0].price * 2})
      this.tierCard.nativeElement.style.transform = `translate3d(${xPosition}px,0px,0px)`
    }
  }

  deleteTier(index: number){
    this.tiers.splice(index,1);
    console.log(this.tierCard.nativeElement.offsetLeft)
    if(Math.floor(this.tiers.length) == index)
      this.tierCard.nativeElement.style.transform = 'translate3d(0px,0px,0px)'
    // else if(Math.floor(this.tiers.length) > index)
    //   this.tierCard.nativeElement.style.transform = `translate3d(${this.tierCard.nativeElement.offsetLeft + 200}px,0px,0px)`
    // else if(Math.floor(this.tiers.length) < index)
    //   this.tierCard.nativeElement.style.transform = `translate3d(${this.tierCard.nativeElement.offsetLeft - 200}px,0px,0px)`
  }

  editTier(){
    this.tempTiers = JSON.parse(JSON.stringify(this.tiers));
    // this.tempTiers = this.tiers;
    this.tempTierLastPrice = this.tierLastPrice
    this.readonly = false
  }
  
  cancelEditTier(){
    this.tiers = this.tempTiers
    this.tierLastPrice = this.tempTierLastPrice
    this.readonly = true
    this.tierCard.nativeElement.style.transform = 'translate3d(0px,0px,0px)'
  }

  // Used for drag and scroll tiers
  onDragEnd(event: CdkDragEnd) {
    const maxScrollLeft = this.tierCard.nativeElement.scrollWidth - this.tierCard.nativeElement.offsetWidth;
    const finalPosition = event.source.getFreeDragPosition().x
    
    if(maxScrollLeft){
      if(finalPosition > maxScrollLeft){
        event.source.setFreeDragPosition({ x: maxScrollLeft + 20 , y: 0 })
      }
      else if(finalPosition < -1 * maxScrollLeft){
        event.source.setFreeDragPosition({ x: -1 * maxScrollLeft - 20 , y: 0 })
      }
    }
    else {
      event.source.setFreeDragPosition({ x: 0 , y: 0 })
    }
  }
  
  // Opening confirm dialog
  openDialogConfirm(data: any | null, type: any) {
    console.log(data)
    const injectedData: any = data || {};
    injectedData.type = type;
    const dialogRef = this.dialog.open(DialogPricing, {
      data: injectedData,
      width: '25%',
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.isLoading = true
        switch(type){
          case 'price': //dialog after confirmed saving price
            var body: any = {
              APIID: result[1].APIID,
              ResourceName: result[1].ResourceName,
              ApplicationID: result[1].ApplicationID,
              Price: parseInt(result[0].replace(/[^\d,-]/g, '')),
              token: sessionStorage.getItem('token'),
              username: sessionStorage.getItem('username'),
              userrole: sessionStorage.getItem('session')
            }
        
            this.pricingService.post_savePrice(body)
            .subscribe(
              (response)=>{
                if(response.errorCode != undefined && response.errorCode == 2) {
                  sessionStorage.clear();
                  localStorage.clear();
                  this.router.navigateByUrl('/');
                }
                else {
                  if(response.errorCode){
                    this.snackbar(response.message)
                  }
                  else{
                    this.getAll(null);
                    this.snackbar(response.message)
                  }
                }
                this.isLoading = false
              },
              error => {
                console.log(error);
              }
            );
            break;
            
          case 'tier': //dialog after confirmed saving tier settings
            var body: any = {
              tiers: this.tiers,
              tierLastPrice: this.tierLastPrice,
              ApplicationName: this.applicationName,
              ApplicationID: this.applicationID,
              token: sessionStorage.getItem('token'),
              username: sessionStorage.getItem('username'),
              userrole: sessionStorage.getItem('session')
            }
        
            this.pricingService.post_saveTier(body)
            .subscribe(
              (response)=>{
                if(response.errorCode != undefined && response.errorCode == 2) {
                  sessionStorage.clear();
                  localStorage.clear();
                  this.router.navigateByUrl('/');
                }
                else {
                  if(response.errorCode){
                    this.snackbar(response.message)
                  }
                  else{
                    this.readonly = true
                    this.snackbar(response.message)
                  }
                }
                this.isLoading = false
              },
              error => {
                console.log(error);
              }
            );
            break;

          case 'plan': //dialog after confirmed plan changing
            var body: any = {
              plan: result,
              ApplicationName: this.applicationName,
              token: sessionStorage.getItem('token'),
              username: sessionStorage.getItem('username'),
              userrole: sessionStorage.getItem('session')
            }
        
            this.pricingService.post_changePlan(body)
            .subscribe(
              (response)=>{
                if(response.errorCode != undefined && response.errorCode == 2) {
                  sessionStorage.clear();
                  localStorage.clear();
                  this.router.navigateByUrl('/');
                }
                else {
                  if(response.errorCode){
                    this.snackbar(response.message)
                  }
                  else{
                    this.activePlan = result
                    this.snackbar(response.message)
                  }
                }
                this.isLoading = false
              },
              error => {
                console.log(error);
              }
            );
            break;
        }
      }
    });
  }
}

@Component({
  selector: 'dialog-pricing',
  templateUrl: './dialog-pricing.component.html',
  styleUrls: ['./pricing.component.css'],
})
export class DialogPricing {

  constructor(
    public dialogRef: MatDialogRef<DialogPricing>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

}

@Component({
  selector: 'snack-pricing',
  templateUrl: 'snackbar-pricing.component.html',
  styles: [
    `
    :host {
      display: flex;
    }

    .text {
      /* background-color: green; */
    }

    .button {
      /* background-color: green; */
      color: white;
    }
  `,
  ],
})
export class SnackbarPricing {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) {}
  snackBarRef = inject(MatSnackBarRef);
}