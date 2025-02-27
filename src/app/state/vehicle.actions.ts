import { createAction, props } from '@ngrx/store';
import { Vehicle, VehicleSummary } from '../models/vehicle.model';

export const initializeVehicles = createAction(
  '[Vehicle] Initialize',
  props<{ vehicles: Vehicle[] }>(),
);

export const updateVehicle = createAction('[Vehicle] Update', props<{ vehicle: Vehicle }>());

export const updateVehicleSummary = createAction(
  '[Vehicle] Update Summary',
  props<{
    summary: VehicleSummary;
  }>(),
);
