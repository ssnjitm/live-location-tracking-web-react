import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center: [number, number];
  zoom: number;
  markers: Array<{
    id: string;
    position: [number, number];
    label: string;
    activity?: string;
  }>;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

const renderCustomIcon = (activity?: string) => {
  const colors: Record<string, string> = {
    driving: '#3b82f6',
    walking: '#22c55e',
    running: '#eab308',
    cycling: '#a855f7',
    stationary: '#ef4444',
  };
  const color = colors[activity || 'stationary'] || '#64748b';
  return L.divIcon({
    html: `<div class="relative flex items-center justify-center">
      <div class="absolute w-4 h-4 rounded-full animate-ping opacity-20" style="background-color: ${color}"></div>
      <div class="w-3.5 h-3.5 rounded-full border-2 border-white shadow-md" style="background-color: ${color}"></div>
    </div>`,
    className: 'custom-map-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

export const UserMap: React.FC<MapProps> = ({ center, zoom, markers }) => {
  return (
    <div className="w-full h-full rounded-xl overflow-hidden shadow-inner border border-gray-200">
      <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={zoom} />
        {markers.map((marker) => (
          <Marker key={marker.id} position={marker.position} icon={renderCustomIcon(marker.activity)}>
            <Popup>
              <div className="p-1">
                <p className="text-xs font-bold text-gray-900">{marker.label}</p>
                <p className="text-[11px] text-gray-500 mt-0.5 capitalize">Status: {marker.activity || 'unknown'}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};