import { Component, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, map, tap } from 'rxjs/operators';

import { LoginService } from '../login.service';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
  passwordType: any = 'password';

  constructor(
    private loginService: LoginService, 
    public authenticationService: AuthenticationService,
    private router: Router,
    private _snackbar: MatSnackBar
  ) { }

  tryLogin(username: string, password: string, event: any): void {
    event.preventDefault();
    if (!username || !password) { return; }
    this.loginService.post_login({username,password})
    .subscribe(
      (data)=>{
        // do something with the data
        if(data.status){
          localStorage.setItem('api', JSON.stringify(data.autocompleteApi));
          localStorage.setItem('app', JSON.stringify(data.autocompleteApplication)) ;
          sessionStorage.setItem('username', username);
          sessionStorage.setItem('token', data.token);
          this._snackbar.open('Welcome to Bank Sinarmas API Monetization Dashboard', 'X', {
            duration: 3000,
            panelClass: 'my-snackbar'
          });
          // this.snackbar.text = 'Sukses.'
          // this.snackbar.color = 'green'
          // this.snackbar.isTrue = true
          if(data.role == 'admin'){
            sessionStorage.setItem('session', 'admin');
            sessionStorage.setItem('path', '/most-frequent');
            this.router.navigateByUrl('/admin/most-frequent');
            // this.$router.push("/admin")
          }
          else {
            sessionStorage.setItem('session', 'default');
            sessionStorage.setItem('path', '/most-frequent');
            this.router.navigateByUrl('/default/most-frequent');
            // this.router.navigateByUrl('/staff');
            // this.$router.push("/staff")
          }
          this.authenticationService.auth = {token: data.token, username: username, userrole: data.role};
          // this.authenticationService.post_setAuth({token: data.token, username: username, userrole: data.role});
        }
        else {
          // this.snackbar.color = 'red'
          // this.snackbar.text = 'Username atau Password Salah.'
          // this.snackbar.isTrue = true
          this._snackbar.open('Incorrect username or password.', 'X', {

          });
        }
      },
      error => {
        console.log(error);
      }
    );
  }

  // openSnackbar() {
  //   this._snackbar.openFromComponent(mySnackbarComponent, {
  //     duration: 3000
  //   });
  // }

  // @Component({
  //   selector: 'login-snackbar',
  //   templateUrl: 'login-snackbar.html'
  // })

  // export class mySnackbarComponent {
  //   snackBarRef = inject(MatSnackBarRef);
  // }

}
