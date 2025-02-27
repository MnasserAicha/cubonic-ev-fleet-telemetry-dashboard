import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { WebSocketService } from './websocket.service';
import { AppState } from '../state/app.state';
import { selectVehiclesMap } from '../state/vehicle.selectors';
import { Vehicle } from '../models/vehicle.model';

describe('WebSocketService', () => {
  let service: WebSocketService;
  let store: MockStore<AppState>;

  const mockVehicles: Record<string, Vehicle> = {
    ElyX1: {
      id: 'ElyX1',
      speed: 50,
      battery: 100,
      temperature: Math.floor(Math.random() * 70) + 20,
      tirePressure: Math.floor(Math.random() * 10) + 30,
      motorEfficiency: Math.floor(Math.random() * 31) + 70,
      regenBraking: Math.random() > 0.5,
      brakeWear: Math.floor(Math.random() * 100),
      energyConsumption: Math.floor(Math.random() * 16) + 5,
      mileage: Math.floor(Math.random() * 100000),
      lidarStatus: Math.random() > 0.1,
      radarStatus: Math.random() > 0.1,
      cameraStatus: Math.random() > 0.1,
      autopilotMode: Math.random() > 0.5,
      location: { lat: 48.8566, lng: 2.3522 },
      carStatus: 'Moving',
    },
    CyberN: {
      id: 'CyberN',
      speed: 30,
      battery: 0, // Test Charging when Battery is dead
      temperature: Math.floor(Math.random() * 70) + 20,
      tirePressure: Math.floor(Math.random() * 10) + 30,
      motorEfficiency: Math.floor(Math.random() * 31) + 70,
      regenBraking: Math.random() > 0.5,
      brakeWear: Math.floor(Math.random() * 100),
      energyConsumption: Math.floor(Math.random() * 16) + 5,
      mileage: Math.floor(Math.random() * 100000),
      lidarStatus: Math.random() > 0.1,
      radarStatus: Math.random() > 0.1,
      cameraStatus: Math.random() > 0.1,
      autopilotMode: Math.random() > 0.5,
      location: { lat: 48.857, lng: 2.353 },
      carStatus: 'Moving',
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WebSocketService,
        provideMockStore({
          initialState: {} as AppState,
          selectors: [{ selector: selectVehiclesMap, value: mockVehicles }],
        }),
      ],
    });

    service = TestBed.inject(WebSocketService);
    store = TestBed.inject(MockStore);
  });

  it('should decrease battery when vehicle is moving', () => {
    const vehicle = mockVehicles['ElyX1'];

    const updatedVehicle = service['updateVehicleState'](vehicle);

    expect(updatedVehicle.battery).toBeLessThan(vehicle.battery);
  });

  it('should change vehicle to "Charging" when battery depletes', () => {
    const vehicle = mockVehicles['CyberN'];

    const updatedVehicle = service['updateVehicleState'](vehicle);

    expect(updatedVehicle.carStatus).toBe('Charging');
    expect(updatedVehicle.battery).toBe(0);
    expect(service['chargingVehicles$'].value.has(vehicle.id)).toBe(true);
  });
});
