import { Component, OnInit } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from '../environment';
import { SubscriptionService } from './services/subscription.service';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { scan } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, JsonPipe, AsyncPipe],
  providers: [SubscriptionService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  // Get the current subscription
  subscription$ = this.swPush.subscription;

  // Messages and notification clicks
  messages$ = this.swPush.messages.pipe(scan((acc, value) => [...acc, value], [] as object[]));
  notificationClicks$ = this.swPush.notificationClicks.pipe(scan((acc, value) => [...acc, value], [] as object[]));

  constructor(
    private swPush: SwPush,
    private subscriptionService: SubscriptionService
  ) {

  } 

  async subscribe() {
    // Make the PushSubscription 
    const subscription = await this.swPush.requestSubscription({
      serverPublicKey: environment.vapidKey
    });
    
    // Send the subscription to the server
    this.subscriptionService.addSubscription(subscription).subscribe({
      next: () => console.log('Subscription added'),
      error: err => {
        console.error('Could not add subscription', err);
        this.swPush.unsubscribe(); // Unsubscribe if something fail
      }
    });
  }
  
  ngOnInit(): void {
    
  }
}
