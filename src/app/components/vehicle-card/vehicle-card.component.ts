import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Vehicle } from '../../models/vehicle.model';
import { MatIconModule } from '@angular/material/icon';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-vehicle-card',

  imports: [
    RouterModule,
    FontAwesomeModule,
    CommonModule,
    MatIconModule,
    GoogleMapsModule,
    MatCardModule,
    MatGridListModule,
    MatDividerModule,
  ],

  templateUrl: './vehicle-card.component.html',
  styleUrls: ['./vehicle-card.component.css'],
})
export class VehicleCardComponent {
  @Input() vehicle!: Vehicle;
  @Output() cardClicked = new EventEmitter<{ lat: number; lng: number }>();
  isExpanded = false;

  onCardClick() {
    this.cardClicked.emit(this.vehicle.location);
    console.log('clicked');
  }
  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
