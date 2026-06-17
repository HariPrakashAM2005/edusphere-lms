"use strict";
/**
 * GPS and Geographical Utility Functions
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatCoordinates = exports.isValidCoordinate = exports.calculateDistance = void 0;
/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula. Returns distance in meters.
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // in meters
};
exports.calculateDistance = calculateDistance;
/**
 * Validates if the given coordinates represent a valid location on Earth.
 */
const isValidCoordinate = (lat, lon) => {
    if (isNaN(lat) || isNaN(lon))
        return false;
    if (lat < -90 || lat > 90)
        return false;
    if (lon < -180 || lon > 180)
        return false;
    return true;
};
exports.isValidCoordinate = isValidCoordinate;
/**
 * Formats coordinates into standard "lat, lon" string representation.
 */
const formatCoordinates = (lat, lon) => {
    return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
};
exports.formatCoordinates = formatCoordinates;
