import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface Dates{
  from: string | undefined,
  to: string | undefined,
}

export interface Body{
  dates: Dates,
  text: any,
  value: any,
  type: string,
  token: any,
  username: any,
  userrole: any
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  private url = 'http://localhost:70/search';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  post_getAll(body: Body): Observable<any> {
    return this.http.post(this.url, body, this.httpOptions);
  }
}
