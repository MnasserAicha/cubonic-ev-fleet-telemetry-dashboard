import { createFeatureSelector, createSelector } from '@ngrx/store';
import { VehicleState } from './vehicle.reducer';

export const selectVehicleState = createFeatureSelector<VehicleState>('vehicles');

export const selectVehiclesMap = createSelector(
  selectVehicleState,
  (state: VehicleState) => state.vehicles,
);

export const selectVehicleSummary = createSelector(
  selectVehicleState,
  (state: VehicleState) => state.summary,
);
