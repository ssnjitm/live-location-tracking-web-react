import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow, useLoadScript } from '@react-google-maps/api';
import { collection, onSnapshot, query, where, orderBy, doc } from 'firebase/firestore';
import { db } from '../firebase/config';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 200px)',
};

const center = {
  lat: 39.8283,
  lng: -98.5795,
};

const options = {
  disableDefaultUI: false,
  zoomControl: true,
};

interface UserLocation {
  id: string;
  email: string;
  latitude: number;
  longitude: number;
  activityType: string;
  lastSeen: Date;
  isTracking: boolean;
}

interface RealtimeMapProps {
  selectedUserId?: string | null;
}

export const RealtimeMap: React.FC<RealtimeMapProps> = ({ selectedUserId }) => {
  const [users, setUsers] = useState<UserLocation[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // You need to get this from Google Cloud Console
  });

  useEffect(() => {
    // Listen to real-time user locations
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('isTracking', '==', true), orderBy('lastSeen', 'desc'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const usersData: UserLocation[] = [];
      
      for (const doc of snapshot.docs) {
        const userData = doc.data();
        if (userData.currentLocation) {
          usersData.push({
            id: doc.id,
            email: userData.email || 'Unknown',
            latitude: userData.currentLocation.latitude,
            longitude: userData.currentLocation.longitude,
            activityType: userData.currentActivity || 'unknown',
            lastSeen: userData.lastSeen?.toDate() || new Date(),
            isTracking: userData.isTracking || false,
          });
        }
      }
      
      setUsers(usersData);
      
      // Center map on selected user
      if (selectedUserId && map) {
        const selectedUserData = usersData.find(u => u.id === selectedUserId);
        if (selectedUserData) {
          map.panTo({
            lat: selectedUserData.latitude,
            lng: selectedUserData.longitude,
          });
          map.setZoom(15);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedUserId, map]);

  if (loadError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <p className="text-red-600">Error loading maps. Please check your API key.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  const getMarkerColor = (activityType: string) => {
    switch (activityType) {
      case 'driving': return 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png';
      case 'walking': return 'https://maps.google.com/mapfiles/ms/icons/green-dot.png';
      case 'running': return 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
      case 'cycling': return 'https://maps.google.com/mapfiles/ms/icons/purple-dot.png';
      default: return 'https://maps.google.com/mapfiles/ms/icons/red-dot.png';
    }
  };

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={5}
        center={center}
        options={options}
        onLoad={(map) => setMap(map)}
      >
        {users.map((user) => (
          <Marker
            key={user.id}
            position={{ lat: user.latitude, lng: user.longitude }}
            icon={{
              url: getMarkerColor(user.activityType),
              scaledSize: new google.maps.Size(32, 32),
            }}
            onClick={() => setSelectedUser(user)}
          />
        ))}

        {selectedUser && (
          <InfoWindow
            position={{ lat: selectedUser.latitude, lng: selectedUser.longitude }}
            onCloseClick={() => setSelectedUser(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold text-gray-800">
                User: {selectedUser.id.substring(0, 8)}...
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Email: {selectedUser.email}
              </p>
              <p className="text-sm text-gray-600">
                Activity: {selectedUser.activityType}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Last seen: {selectedUser.lastSeen.toLocaleTimeString()}
              </p>
              <p className="text-xs text-gray-500">
                Location: {selectedUser.latitude.toFixed(6)}, {selectedUser.longitude.toFixed(6)}
              </p>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-semibold mb-2">Activity Types</h4>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-xs">Driving</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs">Walking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs">Running</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-xs">Cycling</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs">Stationary</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t">
          <p className="text-xs text-gray-600">
            Active Users: {users.length}
          </p>
        </div>
      </div>
    </div>
  );
};