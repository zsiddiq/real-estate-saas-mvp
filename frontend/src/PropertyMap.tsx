// frontend/src/PropertyMap.tsx

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MapCenterSetter from './MapCenterSetter'; 

// --- Fix for Default Leaflet Marker Icons (Required for Vite) ---
// This prevents missing marker image icons
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'leaflet/dist/images/marker-icon-2x.png',
    iconUrl: 'leaflet/dist/images/marker-icon.png',
    shadowUrl: 'leaflet/dist/images/marker-shadow.png',
});
// ---------------------------------------------------------------

interface Property {
  apn: string;
  address_full: string;
  total_score: number;
  confidence_score: number;
  lat?: number; // Must be present for marker
  lng?: number; // Must be present for marker
}

interface PropertyMapProps {
  properties: Property[];
}

const PropertyMap: React.FC<PropertyMapProps> = ({ properties }) => {
  const defaultPosition: [number, number] = [34.0522, -118.2437]; 

  return (
    <div className="h-96 w-full mt-6 rounded-lg shadow-lg">
      <MapContainer 
        center={defaultPosition} 
        zoom={5} 
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* This component centers the map automatically */}
        <MapCenterSetter properties={properties} />

        {properties.map((property) => (
          // Only render the marker if coordinates are present
          property.lat && property.lng ? (
            <Marker 
              key={property.apn} 
              position={[property.lat, property.lng]}
            >
              <Popup>
                <div className="font-bold">{property.address_full}</div>
                <div>Confidence: {property.confidence_score}%</div>
                <div>Score: {property.total_score}</div>
              </Popup>
            </Marker>
          ) : null
        ))}
      </MapContainer>
    </div>
  );
};

export default PropertyMap;