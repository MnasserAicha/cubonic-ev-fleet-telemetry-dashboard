import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { selectVehicleSummary } from '../../state/vehicle.selectors';
import { Vehicle, VehicleSummary } from '../../models/vehicle.model';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let store: MockStore;

  const mockVehicleSummary: VehicleSummary = {
    totalVehicles: 10,
    lowBatteryVehicles: 3,
    chargingVehicles: 2,
    idleVehicles: 1,
  };

  const mockVehicles: { [id: string]: Vehicle } = {
    'V-01': {
      id: 'V-01',
      speed: 65,
      battery: 45,
      temperature: 75,
      tirePressure: 35,
      motorEfficiency: 85,
      regenBraking: true,
      brakeWear: 20,
      energyConsumption: 50,
      mileage: 15000,
      lidarStatus: true,
      radarStatus: true,
      cameraStatus: true,
      autopilotMode: false,
      location: { lat: 48.8566, lng: 2.3522 },
      carStatus: 'Moving',
    },
    'V-02': {
      id: 'V-02',
      speed: 0,
      battery: 10,
      temperature: 65,
      tirePressure: 32,
      motorEfficiency: 78,
      regenBraking: false,
      brakeWear: 50,
      energyConsumption: 40,
      mileage: 20000,
      lidarStatus: false,
      radarStatus: true,
      cameraStatus: true,
      autopilotMode: true,
      location: { lat: 48.857, lng: 2.353 },
      carStatus: 'Idle',
    },
  };

  beforeEach(async () => {
  

    await TestBed.configureTestingModule({
      declarations: [],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectVehicleSummary, value: mockVehicleSummary }],
        }),
        ChangeDetectorRef,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the dashboard component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize vehicle observable', () => {
    component.vehicles$ = of(mockVehicles);
    component.vehicles$.subscribe((vehicles) => {
      expect(vehicles).toEqual(mockVehicles);
    });
  });

  it('should set the correct zoom level when zooming to a vehicle', () => {
    const location = { lat: 48.8566, lng: 2.3522 };
    component.zoomToVehicle(location);
    expect(component.mapCenter).toEqual(location);
    expect(component.mapZoom).toBe(19);
  });

  it('should order vehicles correctly based on their ID (string sorting)', () => {
    const vehicleA = { key: 'A1' };
    const vehicleB = { key: 'B2' };
    const vehicleC = { key: 'A10' };

    expect(component.vehicleOrder(vehicleA, vehicleB)).toBeLessThan(0); // A1 comes before B2
    expect(component.vehicleOrder(vehicleB, vehicleA)).toBeGreaterThan(0); // B2 comes after A1
    expect(component.vehicleOrder(vehicleA, vehicleC)).toBeLessThan(0); // A1 comes before A10
  });
});
