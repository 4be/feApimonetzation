import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';


export interface Body{
  date: any,
  value: any,
  token: any,
  username: any,
  userrole: any
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  private url = 'http://localhost:70/getBilling';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  post_getAll(body: Body): Observable<any> {
    return this.http.post(this.url, body, this.httpOptions);
  }
}
