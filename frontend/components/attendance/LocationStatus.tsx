'use client';

import React from 'react';
import { MapPin, Navigation, CheckCircle2, ShieldAlert } from 'lucide-react';

interface LocationStatusProps {
  lat: number | null;
  lon: number | null;
  distance: number | null; // distance to class in meters
  spoofingDetected?: boolean;
}

export default function LocationStatus({ lat, lon, distance, spoofingDetected }: LocationStatusProps) {
  const GEOFENCE_LIMIT = 100;
  
  const hasLocation = lat !== null && lon !== null;
  const isWithinGeofence = distance !== null && distance <= GEOFENCE_LIMIT;

  return (
    <div className="w-full bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      
      {/* Current Coordinates */}
      <div className="flex items-start">
        <div className={`p-3 rounded-xl mr-4 ${
          hasLocation 
            ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/40' 
            : 'text-gray-400 bg-gray-50 dark:bg-gray-850'
        }`}>
          <MapPin className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold">GPS Coordinates</h4>
          <p className="text-xs text-gray-550 dark:text-gray-400 mt-0.5">
            {hasLocation 
              ? `${lat.toFixed(6)}, ${lon.toFixed(6)}` 
              : 'Acquiring GPS location...'}
          </p>
        </div>
      </div>

      {/* Geofence Status Badge */}
      {hasLocation && (
        <div className="flex flex-col items-start md:items-end">
          <p className="text-xxs font-bold text-gray-405 uppercase tracking-wider mb-1.5">Geofence Status</p>
          
          {spoofingDetected ? (
            <div className="flex items-center text-xs font-extrabold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3.5 py-1.5 rounded-xl border border-red-200/50 dark:border-red-900/40">
              <ShieldAlert className="h-4 w-4 mr-1.5" />
              <span>GPS Spoofing Flagged</span>
            </div>
          ) : isWithinGeofence ? (
            <div className="flex items-center text-xs font-extrabold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-3.5 py-1.5 rounded-xl border border-green-200/50 dark:border-green-900/40">
              <CheckCircle2 className="h-4 w-4 mr-1.5 animate-pulse" />
              <span>Verified In Class ({distance ? Math.round(distance) : 0}m away)</span>
            </div>
          ) : (
            <div className="flex items-center text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-3.5 py-1.5 rounded-xl border border-amber-250/50 dark:border-amber-900/40">
              <Navigation className="h-4 w-4 mr-1.5" />
              <span>Outside Classroom ({distance ? Math.round(distance) : 0}m away)</span>
            </div>
          )}

          {distance !== null && !spoofingDetected && (
            <p className="text-xxs text-gray-450 dark:text-gray-500 mt-1">
              Geofence range limits: {GEOFENCE_LIMIT}m
            </p>
          )}
        </div>
      )}

    </div>
  );
}
