import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';

@Injectable({
  providedIn: 'root',
})
export class NotificationSharedService {
  private notifications = new BehaviorSubject<any[]>([]);
  currentNotifications$ = this.notifications.asObservable();

  sendNewNotifications(data: any) {
    this.notifications.next(data);
  }

  clearAllNotifications() {
    this.notifications.next([]);
  }
}
