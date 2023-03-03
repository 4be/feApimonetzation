import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { UserManagementService } from '../user-management.service';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface DataSource {
  Username: string;
  UserRole: string;
}

export interface Header{
  text: string,
  value: string,
  width: string,
}


@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit{

  // Used for mat Table
  // data = new MatTableDataSource();
  data!: MatTableDataSource<DataSource>;

  header: Header[] = [
    { text: 'Username', value:  'Username', width: '60%' },
    { text: 'Role', value: 'UserRole', width: '30%' },
    { text: 'Actions', value: 'Actions', width: '10%' },
  ];
  
  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  constructor(
    private userManagementService: UserManagementService, 
    private router: Router,
    public dialog: MatDialog,
    private _snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.getAll(null);
  }

  // getAll
  getAll(event: any): void{
    if(event !== null) event.preventDefault();

    var body = {
      token: sessionStorage.getItem('token'),
      username: sessionStorage.getItem('username'),
      userrole: sessionStorage.getItem('session')
    }

    this.userManagementService.post_getAll(body)
    .subscribe(
      (response)=>{
        if(response.errorCode != undefined && response.errorCode == 2) {
          sessionStorage.clear();
          localStorage.clear();
          this.router.navigateByUrl('/');
        }
        else {
            let data = response.map((item: any) => {
              return {...item, Actions: null}
            });
            this.data = new MatTableDataSource(data);
            this.data.paginator = this.paginator;
            this.data.sort = this.sort;
            // this.usedFilter.value = this.myControl.value.value
            // this.usedFilter.type = this.selectValue
            // this.usedDates = this.range
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  
  // Return array element (used for header)
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

  // Opening confirm dialog
  openDialogConfirm(data: DataSource | null, type: any) {
    const injectedData: any = data || {};
    injectedData.type = type;
    const dialogRef = this.dialog.open(DialogConfirm, {
      data: injectedData,
      width: '25%',
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result)
      if(result){
        switch(type){
          case 'add': //dialog after confirmed ADDING new user
            var body: any = {
              newUsername: result[0],
              newPassword: result[1],
              token: sessionStorage.getItem('token'),
              username: sessionStorage.getItem('username'),
              userrole: sessionStorage.getItem('session')
            }
        
            this.userManagementService.post_addUser(body)
            .subscribe(
              (response)=>{
                if(response.errorCode != undefined && response.errorCode == 2) {
                  sessionStorage.clear();
                  localStorage.clear();
                  this.router.navigateByUrl('/');
                }
                else {
                  if(response.errorCode){
                    console.log(response.message)
                  }
                  else{
                    this.getAll(null);
                    // window.alert(`New User Added.`);
                    this._snackbar.open('New user added.', 'X', {
                      duration: 3000
                    });
                  }
                }
              },
              error => {
                console.log(error);
              }
            );
            break;

          case 'role': //dialog after confirmed changing ROLE
            var body: any = {
              searchUsername: result[0],
              newUserrole: result[1],
              token: sessionStorage.getItem('token'),
              username: sessionStorage.getItem('username'),
              userrole: sessionStorage.getItem('session')
            }
        
            this.userManagementService.post_changeRole(body)
            .subscribe(
              (response)=>{
                if(response.errorCode != undefined && response.errorCode == 2) {
                  sessionStorage.clear();
                  localStorage.clear();
                  this.router.navigateByUrl('/');
                }
                else {
                  if(response.errorCode){
                    console.log(response.message)
                  }
                  else{
                    this.getAll(null);
                    // window.alert(`User's role changed!`);
                    this._snackbar.open(
                      `User ${body.searchUsername}'s role has been changed to ${body.newUserrole}`, 'X', {
                      duration: 3000,
                    });
                  }
                }
              },
              error => {
                console.log(error);
              }
            );
            break;
          
          case 'password': //dialog after confirmed changing PASSWORD
            var body: any = {
              thisUsername: result[0],
              newPassword: result[1],
              token: sessionStorage.getItem('token'),
              username: sessionStorage.getItem('username'),
              userrole: sessionStorage.getItem('session')
            }
        
            this.userManagementService.post_changePassword(body)
            .subscribe(
              (response)=>{
                if(response.errorCode != undefined && response.errorCode == 2) {
                  sessionStorage.clear();
                  localStorage.clear();
                  this.router.navigateByUrl('/');
                }
                else {
                  if(response.errorCode){
                    console.log(response.message)
                  }
                  else{
                    this.getAll(null);
                    // window.alert(`User's password changed!`);
                    this._snackbar.open(
                      `Password for user ${body.thisUsername} has been changed successfully`, 'X', {
                        duration: 3000,
                    });
                  }
                }
              },
              error => {
                console.log(error);
              }
            );
            break;


          case 'delete': //dialog after confirmed DELETING user
            var body: any = {
              thisUsername: result,
              token: sessionStorage.getItem('token'),
              username: sessionStorage.getItem('username'),
              userrole: sessionStorage.getItem('session')
            }
        
            this.userManagementService.post_deleteUser(body)
            .subscribe(
              (response)=>{
                if(response.errorCode != undefined && response.errorCode == 2) {
                  sessionStorage.clear();
                  localStorage.clear();
                  this.router.navigateByUrl('/');
                }
                else {
                  if(response.errorCode){
                    console.log(response.message)
                  }
                  else{
                    this.getAll(null)
                    // window.alert(`User deleted!`);
                    this._snackbar.open(`User ${body.thisUsername} has been deleted.`, 'X', {
                      duration: 3000,
                    });
                  }
                }
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
  selector: 'dialog-confirm',
  templateUrl: './dialog-confirm.component.html',
})
export class DialogConfirm {
  roles: any = [
    { value: 'admin', viewValue: 'admin' },
    { value: 'default', viewValue: 'default' },
  ]
  passwordType: any = 'password';
  constructor(
    public dialogRef: MatDialogRef<DialogConfirm>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

}
