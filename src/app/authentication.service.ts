import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';

export interface auth{
  token: string,
  username: string,
  userrole: string
}

export interface responseAuth{
  message: string,
  errorCode: number
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  public auth: auth;

  private url = 'http://localhost:70';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };


  constructor(private http: HttpClient) { }

  post_getAuth(){
    return this.auth;
  }

  post_setAuth(setAuth: auth){
    this.auth = setAuth;
    return;
  }

  post_checkAuth(){
    return this.http.post<responseAuth>(this.url + '/authenticate', this.auth, this.httpOptions);
  }
}
