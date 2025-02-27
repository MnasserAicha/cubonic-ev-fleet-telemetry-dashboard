import { createReducer, on } from '@ngrx/store';
import { initializeVehicles, updateVehicle, updateVehicleSummary } from './vehicle.actions';
import { Vehicle } from '../models/vehicle.model';

export interface VehicleState {
  vehicles: { [id: string]: Vehicle };
  summary: {
    totalVehicles: number;
    lowBatteryVehicles: number;
    chargingVehicles: number;
    idleVehicles: number;
  };
}

export const initialState: VehicleState = {
  vehicles: {},
  summary: { totalVehicles: 0, lowBatteryVehicles: 0, chargingVehicles: 0, idleVehicles: 0 },
};

export const vehicleReducer = createReducer(
  initialState,

  on(initializeVehicles, (state, { vehicles }) => {
    const vehicleMap = vehicles.reduce(
      (map, vehicle) => {
        map[vehicle.id] = vehicle;
        return map;
      },
      {} as { [id: string]: Vehicle },
    );

    return {
      ...state,
      vehicles: vehicleMap,
      summary: calculateSummary(vehicles),
    };
  }),

  on(updateVehicle, (state, { vehicle }) => {
    const updatedVehicles = {
      ...state.vehicles,
      [vehicle.id]: { ...state.vehicles[vehicle.id], ...vehicle },
    };

    return {
      ...state,
      vehicles: updatedVehicles,
      summary: calculateSummary(Object.values(updatedVehicles)),
    };
  }),

  on(updateVehicleSummary, (state, { summary }) => ({
    ...state,
    summary,
  })),
);

function calculateSummary(vehicles: Vehicle[]) {
  return {
    totalVehicles: vehicles.length,
    lowBatteryVehicles: vehicles.filter((v) => v.battery < 20).length,
    chargingVehicles: vehicles.filter((v) => v.carStatus === 'Charging').length,
    idleVehicles: vehicles.filter((v) => v.carStatus === 'Idle').length,
  };
}
