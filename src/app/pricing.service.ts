import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable, of } from 'rxjs';

export interface Dates{
  from: string | undefined,
  to: string | undefined,
}

export interface Body{
  name: string,
  token: any,
  username: any,
  userrole: any
}

export interface BodySavePrice{
  APIID: string,
  ResourceName: string,
  ApplicationID: string,
  Price: string,
  token: any,
  username: any,
  userrole: any
}

export interface BodySaveTier{
  tiers: any,
  tierLastPrice: string,
  ApplicationName: string,
  ApplicationID: string,
  token: any,
  username: any,
  userrole: any
}

export interface BodyChangePlan{
  plan: any,
  ApplicationName: string,
  token: any,
  username: any,
  userrole: any
}


@Injectable({
  providedIn: 'root'
})
export class PricingService {

  private url = 'http://localhost:70';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(private http: HttpClient) { }

  post_getAll(body: Body): Observable<any> {
    return this.http.post(this.url + '/pricing', body, this.httpOptions);
  }

  post_savePrice(body: BodySavePrice): Observable<any> {
    return this.http.post(this.url + '/updatePrice', body, this.httpOptions);
  }

  post_saveTier(body: BodySaveTier): Observable<any> {
    return this.http.post(this.url + '/updateTier', body, this.httpOptions);
  }
  
  post_changePlan(body: BodyChangePlan): Observable<any> {
    return this.http.post(this.url + '/updatePlan', body, this.httpOptions);
  }
}
