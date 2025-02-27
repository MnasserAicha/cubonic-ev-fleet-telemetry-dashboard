export interface Vehicle {
  id: string;
  speed: number;
  battery: number;
  temperature: number;
  tirePressure: number;
  motorEfficiency: number;
  regenBraking: boolean;
  brakeWear: number;
  energyConsumption: number;
  mileage: number;
  lidarStatus: boolean;
  radarStatus: boolean;
  cameraStatus: boolean;
  autopilotMode: boolean;
  location: { lat: number; lng: number };
  carStatus: CarStatusType;
}

export interface VehicleSummary {
  totalVehicles: number;
  lowBatteryVehicles: number;
  chargingVehicles: number;
  idleVehicles: number;
}

export type CarStatusType = 'Charging' | 'Idle' | 'Moving';
