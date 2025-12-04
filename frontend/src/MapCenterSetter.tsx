// frontend/src/MapCenterSetter.tsx

import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

interface Coordinate {
  lat?: number;
  lng?: number;
}

interface MapCenterSetterProps {
  properties: Coordinate[];
}

const MapCenterSetter: React.FC<MapCenterSetterProps> = ({ properties }) => {
  const map = useMap();

  useEffect(() => {
    // Filter out properties that don't have valid coordinates
    const validCoords = properties
      .filter(p => p.lat && p.lng)
      .map(p => [p.lat!, p.lng!] as L.LatLngTuple);

    if (validCoords.length > 0) {
      // Create a LatLngBounds object and fit the map view to it
      const bounds = L.latLngBounds(validCoords);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, properties]);

  return null;
};

export default MapCenterSetter;