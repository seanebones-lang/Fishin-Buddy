import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
const LOCATION_TASK = 'location-task';
TaskManager.defineTask(LOCATION_TASK, ({ data, error }) => { /* ML pred → notif */ });
export const startGeofencing = () => Location.startLocationUpdatesAsync(LOCATION_TASK, { /* config */ });