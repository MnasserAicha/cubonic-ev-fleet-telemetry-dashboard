import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import {  Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Vehicle } from '../../../models/vehicle.model';

interface Notification {
  id: string;
  message: string;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  imports: [
    RouterModule,
    CommonModule,
    MatCardModule,
  ],
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  @Input() vehicles$!: Observable<{ [id: number]: Vehicle }>;

  notifications: Notification[] = [];
  private subscription!: Subscription;

  private previousStatuses = new Map<string, string>();

  ngOnInit() {
    this.subscription = this.vehicles$.subscribe((vehicles) => {
      this.updateNotifications(vehicles);
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  updateNotifications(vehicles: { [id: string]: Vehicle }) {
    Object.values(vehicles).forEach((vehicle) => {
      const previousStatus = this.previousStatuses.get(vehicle.id);

      if (vehicle.carStatus === 'Idle' && previousStatus !== 'Idle') {
        this.addNotification({
          id: `idle-${vehicle.id}`,
          message: `🚗  ${vehicle.id} is idle. Please take action.`,
        });
      } else if (previousStatus === 'Idle' && vehicle.carStatus !== 'Idle') {
        this.removeNotification(`idle-${vehicle.id}`);
        this.addNotification(
          {
            id: `fixed-${vehicle.id}-${Date.now()}`,
            message: `✅  ${vehicle.id} is repaired and now ${vehicle.carStatus}.`,
          },
          5000,
        );
      }

      this.previousStatuses.set(vehicle.id, vehicle.carStatus);
    });
  }

  addNotification(notification: Notification, autoDismissMs?: number) {
    if (!this.notifications.some((n) => n.id === notification.id)) {
      this.notifications.unshift(notification);

      if (autoDismissMs) {
        setTimeout(() => this.removeNotification(notification.id), autoDismissMs);
      }
    }
  }

  removeNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
  }

  clearAllNotifications() {
    this.notifications = [];
  }
}
