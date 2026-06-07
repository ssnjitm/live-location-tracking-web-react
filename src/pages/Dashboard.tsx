import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserMap } from '../components/UserMap';
import { ShieldCheck, ShieldAlert, ArrowUpRight, Activity, Users, Radio } from 'lucide-react';

interface TelemetryUser {
  id: string;
  email: string;
  isTracking: boolean;
  isSpoofed: boolean;
  currentActivity: string;
  lastSeen: any;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

export const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<TelemetryUser[]>([]);
  const [focusedLocation, setFocusedLocation] = useState<[number, number]>([27.7237358, 85.3308061]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const liveData: TelemetryUser[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<TelemetryUser, 'id'>),
      }));
      setUsers(liveData);

      // Default focal lock to first available live tracking coordinates if found
      const activeTracker = liveData.find((u) => u.isTracking && u.currentLocation);
      if (activeTracker?.currentLocation) {
        setFocusedLocation([activeTracker.currentLocation.latitude, activeTracker.currentLocation.longitude]);
      }
    });

    return () => unsubscribe();
  }, []);

  const mapMarkers = users
    .filter((u) => u.currentLocation)
    .map((u) => ({
      id: u.id,
      position: [u.currentLocation!.latitude, u.currentLocation!.longitude] as [number, number],
      label: u.email,
      activity: u.currentActivity,
    }));

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Monitored Accounts</p>
            <h3 className="text-2xl font-black mt-1">{users.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={20} /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Signals</p>
            <h3 className="text-2xl font-black mt-1 text-green-600">{users.filter(u => u.isTracking).length}</h3>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><Radio size={20} className="animate-pulse" /></div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Spoof Flags Detected</p>
            <h3 className="text-2xl font-black mt-1 text-red-600">{users.filter(u => u.isSpoofed).length}</h3>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl"><Activity size={20} /></div>
        </div>
      </div>

      {/* Core Split Interface Container */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Users Tracking Control Cards */}
        <div className="space-y-3 xl:col-span-1 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Registered Terminals</h2>
          {users.map((u) => (
            <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:border-gray-300 transition">
              <div className="flex items-start justify-between gap-2">
                <div className="truncate">
                  <h4 className="font-bold text-gray-900 truncate text-sm">{u.email}</h4>
                  <p className="text-[11px] text-gray-400 font-mono mt-0.5 truncate">UID: {u.id}</p>
                </div>
                <button 
                  onClick={() => window.location.hash = `#/user?id=${u.id}`}
                  className="p-1.5 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  <ArrowUpRight size={15} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-1.5">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${u.isTracking ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {u.isTracking ? 'Streaming' : 'Offline'}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 rounded text-slate-700 capitalize">
                    {u.currentActivity || 'Stationary'}
                  </span>
                </div>
                {u.isSpoofed ? (
                  <div className="flex items-center gap-1 text-red-600 text-xs font-bold"><ShieldAlert size={14} /> Spoofed</div>
                ) : (
                  <div className="flex items-center gap-1 text-green-600 text-xs font-medium"><ShieldCheck size={14} /> Secured</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Global Overview Map Block */}
        <div className="xl:col-span-2 h-[calc(100vh-300px)]">
          <UserMap center={focusedLocation} zoom={11} markers={mapMarkers} />
        </div>
      </div>
    </div>
  );
};