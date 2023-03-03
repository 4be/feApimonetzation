import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';
import { DataSource } from './most-frequent/most-frequent.component';

export interface Dates{
  from: string | undefined,
  to: string | undefined,
}

export interface Body{
  dates: Dates,
  type: string,
  token: any,
  username: any,
  userrole: any
}


@Injectable({
  providedIn: 'root'
})
export class MostFrequentService {

  apiData: MatTableDataSource<DataSource> | undefined;
  applicationData: MatTableDataSource<DataSource> | undefined;

  setApiData(apiData: MatTableDataSource<DataSource>) {
    this.apiData = apiData;
  }

  setApplicationData(applicationData: MatTableDataSource<DataSource>) {
    this.applicationData = applicationData;
  }

  getApiData(): Observable<any> {
    return of(this.apiData);
  }

  getApplicationData(): Observable<any> {
    return of(this.applicationData);
  }

  private url = 'http://localhost:70/top10';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  post_getAll(body: Body): Observable<any> {
    return this.http.post(this.url, body, this.httpOptions);
  }
}
