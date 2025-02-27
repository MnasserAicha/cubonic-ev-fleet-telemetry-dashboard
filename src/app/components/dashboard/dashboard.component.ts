import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Vehicle, VehicleSummary } from '../../models/vehicle.model';
import { VehicleState } from '../../state/vehicle.reducer';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatIconModule } from '@angular/material/icon';
import { VehicleCardComponent } from '../vehicle-card/vehicle-card.component';
import { WebSocketService } from '../../services/websocket.service';
import { selectVehicleSummary } from '../../state/vehicle.selectors';
import { CdkDrag, CdkDragDrop, CdkDropList, transferArrayItem } from '@angular/cdk/drag-drop';
import { NotificationPanelComponent } from './notification/notification.component';
@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatIconModule,
    GoogleMapsModule,
    VehicleCardComponent,
    CdkDropList,
    CdkDrag,
    NotificationPanelComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [WebSocketService],
})
export class DashboardComponent implements OnInit {
  availableIcons: string[] = [
    'totalVehicles',
    'lowBatteryVehicles',
    'chargingVehicles',
    'idleVehicles',
  ];
  isGridView = true;
  mapCenter = { lat: 48.8566, lng: 2.3522 };
  mapZoom = 16;
  private isFirstLoad = true;
  cols = 5;

  droppedIcons: string[] = [];
  iconLabels: { [key: string]: string } = {
    totalVehicles: 'directions_car',
    lowBatteryVehicles: 'battery_alert',
    chargingVehicles: 'battery_charging_full',
    idleVehicles: 'pause_circle',
  };

  vehicles$: Observable<{ [id: number]: Vehicle }>;

  summary$: Observable<VehicleSummary>;

  constructor(
    private store: Store<{ vehicles: VehicleState }>,
    private wsService: WebSocketService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.vehicles$ = store.select((state) => {
      return state.vehicles.vehicles;
    });
    this.summary$ = this.store.pipe(select(selectVehicleSummary));
  }
  trackByFn(index: number, item: string) {
    return item;
  }
  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer !== event.container) {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
    this.changeDetectorRef.detectChanges();
  }

  getSummaryValue(
    summary:
      | {
          totalVehicles: number;
          lowBatteryVehicles: number;
          chargingVehicles: number;
          idleVehicles: number;
        }
      | null
      | undefined,
    key: string,
  ): number {
    return summary?.[key as keyof typeof summary] ?? 0;
  }

  ngOnInit() {
    
    this.vehicles$.subscribe((vehicles) => {
      const vehicleList = Object.values(vehicles);
      if (vehicleList.length > 0 && this.isFirstLoad) {
        this.centerMapOnVehicles(vehicleList);
        this.isFirstLoad = false;
      }
    });
  }

  private centerMapOnVehicles(vehicles: Vehicle[]) {
    let sumLat = 0,
      sumLng = 0;
    vehicles.forEach((vehicle) => {
      sumLat += vehicle.location.lat;
      sumLng += vehicle.location.lng;
    });

    this.mapCenter = {
      lat: sumLat / vehicles.length,
      lng: sumLng / vehicles.length,
    };
  }

  vehicleOrder = (a: any, b: any) => a.key.localeCompare(b.key);
  trackByVehicleId(vehicle: any): number {
    return vehicle.key;
  }

  zoomToVehicle(location: { lat: number; lng: number }) {
    this.mapCenter = location;
    this.mapZoom = 19;
  }

  getVehicleIcon(): google.maps.Icon {
    return {
      url: '/image/cubonic-car.png',
      scaledSize: new google.maps.Size(100, 60),
      origin: new google.maps.Point(0, 0),
    };
  }

}
