import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private httpClient: HttpClient) { }

  public addSubscription = (subscription: PushSubscription) =>
    this.httpClient.post(`${environment.serverUrl}/subscriptions`, subscription)
}
