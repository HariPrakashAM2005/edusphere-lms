import { calculateDistance, isValidCoordinate } from '../../utils/geo.utils';

// Class standard geofencing threshold: 100 meters
const GEOFENCE_THRESHOLD_METERS = 100;

interface LocationVerificationResult {
  verified: boolean;
  distance: number;
  spoofingDetected: boolean;
  message: string;
}

/**
 * Checks if the student is within 100m of the class location and analyzes for spoofing.
 */
export const verifyLocation = (
  studentLat: number,
  studentLon: number,
  classLat: number,
  classLon: number,
  headers?: any // check headers for potential spoofing clues
): LocationVerificationResult => {
  // 1. Validation
  if (!isValidCoordinate(studentLat, studentLon)) {
    return {
      verified: false,
      distance: -1,
      spoofingDetected: false,
      message: 'Invalid student coordinates provided',
    };
  }

  if (!isValidCoordinate(classLat, classLon)) {
    return {
      verified: false,
      distance: -1,
      spoofingDetected: false,
      message: 'Invalid classroom coordinates configured',
    };
  }

  // 2. Spoofing Detection heuristics
  const spoofingDetected = detectSpoofing(studentLat, studentLon, headers);
  if (spoofingDetected) {
    return {
      verified: false,
      distance: -1,
      spoofingDetected: true,
      message: 'Location verification rejected: GPS Mocking/Spoofing detected',
    };
  }

  // 3. Distance Calculation
  const distance = calculateDistance(studentLat, studentLon, classLat, classLon);

  if (distance > GEOFENCE_THRESHOLD_METERS) {
    return {
      verified: false,
      distance,
      spoofingDetected: false,
      message: `Student is too far from class (${distance.toFixed(1)}m away. Limit: ${GEOFENCE_THRESHOLD_METERS}m)`,
    };
  }

  return {
    verified: true,
    distance,
    spoofingDetected: false,
    message: 'Location verified successfully within geofence range',
  };
};

/**
 * Basic GPS spoofing detection heuristics
 */
export const detectSpoofing = (lat: number, lon: number, headers?: any): boolean => {
  if (!headers) return false;

  const userAgent = headers['user-agent']?.toLowerCase() || '';
  const xMockLocation = headers['x-mock-location'] || '';

  // Heuristic 1: Inspect headers for debugging headers or mock triggers
  if (xMockLocation === 'true') {
    return true;
  }

  // Heuristic 2: Emulator indicators in user-agent
  if (userAgent.includes('sdk gphone') || userAgent.includes('android emulator')) {
    return true;
  }

  // Heuristic 3: Exact null/zero island coordinates or exact coordinate center defaults
  if (lat === 0 && lon === 0) {
    return true;
  }

  return false;
};
