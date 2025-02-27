import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  interval,
  map,
  switchMap,
  take,
  tap,
  timer,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { initializeVehicles, updateVehicle } from '../state/vehicle.actions';
import { Vehicle, CarStatusType } from '../models/vehicle.model';
import { AppState } from '../state/app.state';
import { selectVehiclesMap } from '../state/vehicle.selectors';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private readonly SIMULATION_INTERVAL = 2000; //simulate data every 2sec
  private readonly MAX_BATTERY = 100;
  private readonly CHARGING_STATION = { lat: 48.857, lng: 2.351 }; //fixed location as a charging station

  private futuristicVehicleNames = [
    'ElyX1',
    'CyberN',
    'ZenAero',
    'QFlux',
    'Hyp-V',
    'NebulaP',
    'LumiX',
    'Astra',
    'VoltX',
    'SpecZ',
  ];

  private vehiclePositions: Record<string, { lat: number; lng: number }> = {};
  private chargingVehicles$ = new BehaviorSubject<Set<string>>(new Set());
  private idleVehicles$ = new BehaviorSubject<Set<string>>(new Set());

  constructor(private store: Store<AppState>) {
    this.initializeVehicles();
    this.startSimulatingData();
  }

  //Generates 10 vehicles with random data using defined IDs and dispatch to store
  private initializeVehicles() {
    const vehicles: Vehicle[] = this.futuristicVehicleNames.map((name) => {
      this.vehiclePositions[name] = this.getRandomPosition();
      return this.generateVehicle(name);
    });
    this.store.dispatch(initializeVehicles({ vehicles }));
  }

  //Simulate new data based on the latest vehicules state 
  private startSimulatingData() {
    interval(this.SIMULATION_INTERVAL)
      .pipe(
        switchMap(() => this.store.select(selectVehiclesMap).pipe(take(1))),
        map((vehicleMap) =>
          Object.values(vehicleMap).map((vehicle) => this.updateVehicleState(vehicle)),
        ),
        tap((updatedVehicles) =>
          updatedVehicles.forEach((vehicle) => this.store.dispatch(updateVehicle({ vehicle }))),
        ),
      )
      .subscribe();
    this.randomizeIdleVehicles();
  }

  private updateVehicleState(vehicle: Vehicle): Vehicle {
    const chargingVehicles = this.chargingVehicles$.value;
    const idleVehicles = this.idleVehicles$.value;

    let position = { ...this.vehiclePositions[vehicle.id] };
    let newBattery = vehicle.battery;
    let newSpeed = vehicle.speed;
    let carStatus = vehicle.carStatus;


    //vehicle is not moving
    if (idleVehicles.has(vehicle.id)) {
      const probabilityToFixCar = 0.3; // 30% chance to repair vehicle
      if (Math.random() < probabilityToFixCar) {
        idleVehicles.delete(vehicle.id);
        return this.generateVehicle(vehicle.id, newSpeed, newBattery, position, carStatus);
      }
      return vehicle;
    }

    //vehicle is charging 
    if (chargingVehicles.has(vehicle.id)) return this.chargeVehicle(vehicle);

    //vehicles's battery is dead
    if (newBattery <= 0) return this.handleBatteryDepleted(vehicle);

    position = this.updatePosition(position);
    newBattery = this.drainBattery(newBattery);
    newSpeed = this.getRandomSpeed();
    carStatus = 'Moving';
    return this.generateVehicle(vehicle.id, newSpeed, newBattery, position, carStatus);
  }

  private handleBatteryDepleted(vehicle: Vehicle): Vehicle {
    const chargingSet = this.chargingVehicles$.value;
    chargingSet.add(vehicle.id);
    this.chargingVehicles$.next(chargingSet);

    return this.generateVehicle(vehicle.id, 0, 0, this.getLineupPosition(vehicle.id), 'Charging');
  }

  private chargeVehicle(vehicle: Vehicle): Vehicle {
    const newBattery = Math.min(this.MAX_BATTERY, vehicle.battery + 20);
    //teleport charging car to charging station
    let position = this.getLineupPosition(vehicle.id);
    let carStatus: CarStatusType = 'Charging';

    if (newBattery === this.MAX_BATTERY) {
      const chargingSet = this.chargingVehicles$.value;
      chargingSet.delete(vehicle.id);
      this.chargingVehicles$.next(chargingSet);
      position = this.getRandomPosition();
    }

    return this.generateVehicle(vehicle.id, 0, newBattery, position, carStatus);
  }

  private randomizeIdleVehicles() {
    //every 5-7 sec try to randomize IDLE vehicules
    timer(0, Math.floor(Math.random() * 2000) + 5000)
      .pipe(
        switchMap(() => this.store.select(selectVehiclesMap).pipe(take(1))),
        map((vehicleMap) => {
          const probabilityForBreakdown = 0.4;
          if (Math.random() >= probabilityForBreakdown) return null;
          //check if there is IDLE vehicules
          const vehicles = Object.values(vehicleMap).filter((v) => v.carStatus !== 'Idle');
          if (vehicles.length === 0) return null;

          const randomVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
          const updatedVehicle: Vehicle = {
            ...randomVehicle,
            carStatus: 'Idle',
            battery: 0,
            speed: 0,
          };

          const idleSet = this.idleVehicles$.value;
          idleSet.add(randomVehicle.id);
          this.idleVehicles$.next(idleSet);

          return updatedVehicle;
        }),
        tap((updatedVehicle) => {
          if (updatedVehicle) {
            this.store.dispatch(updateVehicle({ vehicle: updatedVehicle }));
          }
        }),
      )
      .subscribe();
  }

  private updatePosition(position: { lat: number; lng: number }): {
    lat: number;
    lng: number;
  } {
    return {
      lat: position.lat + (Math.random() - 0.5) * 0.0005,
      lng: position.lng + (Math.random() - 0.5) * 0.0005,
    };
  }

  private drainBattery(currentBattery: number): number {
    return Math.max(0, currentBattery - (Math.floor(Math.random() * 20) + 1));
  }

  private getRandomSpeed(): number {
    return Math.floor(Math.random() * 100);
  }

  private getLineupPosition(vehicleId: string): { lat: number; lng: number } {
    const vehicleIndex = this.futuristicVehicleNames.indexOf(vehicleId);
    return {
      lat: this.CHARGING_STATION.lat + 0.00005 * vehicleIndex,
      lng: this.CHARGING_STATION.lng,
    };
  }

  private getRandomPosition(): { lat: number; lng: number } {
    return {
      lat: 48.8566 + Math.random() * 0.01,
      lng: 2.3522 + Math.random() * 0.01,
    };
  }

  private generateVehicle(
    id: string,
    newSpeed?: number,
    newBattery?: number,
    position?: { lat: number; lng: number },
    carStatus?: CarStatusType,
  ): Vehicle {
    return {
      id: id,
      speed: newSpeed ?? this.getRandomSpeed(),
      battery: newBattery ?? this.MAX_BATTERY,
      temperature: Math.floor(Math.random() * 70) + 20,
      tirePressure: Math.floor(Math.random() * 10) + 30,
      motorEfficiency: Math.floor(Math.random() * 31) + 70,
      regenBraking: Math.random() > 0.5,
      brakeWear: Math.floor(Math.random() * 100),
      energyConsumption: Math.floor(Math.random() * 90) + 10,
      mileage: Math.floor(Math.random() * 100000),
      lidarStatus: Math.random() > 0.1,
      radarStatus: Math.random() > 0.1,
      cameraStatus: Math.random() > 0.1,
      autopilotMode: Math.random() > 0.5,
      location: position ?? this.getRandomPosition(),
      carStatus: carStatus ?? 'Moving',
    };
  }
}
