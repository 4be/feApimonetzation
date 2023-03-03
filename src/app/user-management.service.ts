import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';

export interface BodyGet{
  token: any,
  username: any,
  userrole: any
}

export interface BodyAddUser{
  newUsername: string,
  newPassword: string,
  token: any,
  username: any,
  userrole: any
}

export interface BodyChangePassword{
  thisUsername: string,
  newPassword: string,
  token: any,
  username: any,
  userrole: any
}

export interface BodyChangeRole{
  searchUsername: string,
  newUserrole: string,
  token: any,
  username: any,
  userrole: any
}

export interface BodyDeleteUser{
  thisUsername: string,
  token: any,
  username: any,
  userrole: any
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {

  private url = 'http://localhost:70';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  post_getAll(body: BodyGet): Observable<any> {
    return this.http.post(this.url + '/showUsers', body, this.httpOptions);
  }

  post_addUser(body: BodyAddUser): Observable<any> {
    return this.http.post(this.url + '/register', body, this.httpOptions);
  }
  
  post_changeRole(body: BodyChangeRole): Observable<any> {
    return this.http.post(this.url + '/changeRole', body, this.httpOptions);
  }

  post_changePassword(body: BodyChangePassword): Observable<any> {
    return this.http.post(this.url + '/changePassword', body, this.httpOptions);
  }

  post_deleteUser(body: BodyDeleteUser): Observable<any> {
    return this.http.post(this.url + '/deleteUser', body, this.httpOptions);
  }

}
