import React, { useState, useEffect } from 'react';
import { doc, collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { UserMap } from '../components/UserMap';
import { ArrowLeft, Clock, ShieldAlert, ShieldCheck, History, ScrollText } from 'lucide-react';

interface LocationHistory {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: any;
  activityType: string;
  accuracy: number;
}

interface ActivityLog {
  id: string;
  activityType: string;
  date: string;
  status: string;
  metadata?: {
    stopTime?: string;
    durationMinutes?: number;
  };
}

export const UserDetails: React.FC = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [locations, setLocations] = useState<LocationHistory[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([27.7237358, 85.3308061]);

  const params = new URLSearchParams(window.location.hash.split('?')[1]);
  const userId = params.get('id');

  useEffect(() => {
    if (!userId) return;

    // Stream Base Metadata
    const profileUnsub = onSnapshot(doc(db, 'users', userId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        if (data.currentLocation) {
          setMapCenter([data.currentLocation.latitude, data.currentLocation.longitude]);
        }
      }
    });

    // Stream Location Subcollection Records
    const locQuery = query(collection(db, 'users', userId, 'locations'), orderBy('timestamp', 'desc'), limit(50));
    const locUnsub = onSnapshot(locQuery, (snapshot) => {
      setLocations(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as LocationHistory)));
    });

    // Stream Filtered Root Level Logs
    // const logsQuery = query(collection(db, 'activity_logs'), where('userId', '==', userId), orderBy('date', 'desc'), limit(30));
    const logsQuery = query(
     collection(db, 'activity_logs'), 
     where('userId', '==', userId),
     orderBy('date', 'desc'), 
     limit(30)
     );

    const logsUnsub = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ActivityLog)));
    });

    return () => {
      profileUnsub();
      locUnsub();
      logsUnsub();
    };
  }, [userId]);

  if (!userId) return <div className="text-red-500 font-bold p-4">Error: Missing targeting parameters.</div>;
  if (!userProfile) return <div className="text-sm font-medium text-gray-500 animate-pulse p-4">Fetching core profile registers...</div>;

  return (
    <div className="space-y-6">
      {/* Header Management Navigation Toolbar */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => window.location.hash = ''}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft size={16} /> Back to dashboard Overview
        </button>
        <span className="text-[11px] font-mono bg-gray-200 px-3 py-1 rounded-full text-gray-700 font-bold">TARGET WORKSTATION PROFILE</span>
      </div>

      {/* Target Metrics Cards Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h2 className="text-xl font-black text-gray-900 break-words">{userProfile.email}</h2>
          <p className="text-xs text-gray-400 font-mono mt-1">Entity UUID: {userId}</p>
        </div>
        <div className="space-y-1 md:border-l md:pl-6 border-gray-100">
          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Stream Activity Metrics</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${userProfile.isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
            <span className="text-sm font-bold text-gray-800">{userProfile.isTracking ? 'Broadcasting Transmissions' : 'Connection Inactive'}</span>
          </div>
        </div>
        <div className="space-y-1 md:border-l md:pl-6 border-gray-100">
          <p className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Device Perimeter Defense Integrity</p>
          {userProfile.isSpoofed ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 text-xs font-bold mt-1"><ShieldAlert size={14} /> Location Spoof Detected</div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 text-xs font-bold mt-1"><ShieldCheck size={14} /> Core Safe Passing</div>
          )}
        </div>
      </div>

      {/* Map Focus Block */}
      <div className="h-80 w-full">
        <UserMap 
          center={mapCenter} 
          zoom={15} 
          markers={userProfile.currentLocation ? [{
            id: userId,
            position: [userProfile.currentLocation.latitude, userProfile.currentLocation.longitude],
            label: `Current Anchor: ${userProfile.email}`,
            activity: userProfile.currentActivity
          }] : []} 
        />
      </div>

      {/* Dual Split Table Infrastructure Logs & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* History Feed Module */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <History size={16} className="text-blue-500" />
            <h3 className="text-sm font-bold text-gray-800">Historical Tracking Locations ({locations.length})</h3>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Coordinates</th>
                  <th className="p-3">Activity</th>
                  <th className="p-3">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {locations.map((loc) => (
                  <tr key={loc.id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setMapCenter([loc.latitude, loc.longitude])}>
                    <td className="p-3 text-gray-500 whitespace-nowrap">{loc.timestamp?.toDate().toLocaleString() || 'N/A'}</td>
                    <td className="p-3 font-mono font-medium text-blue-600">{loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium capitalize text-[11px]">{loc.activityType}</span></td>
                    <td className="p-3 text-gray-400 font-mono">{loc.accuracy.toFixed(0)}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Logs Feed Module */}
        {/* <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <ScrollText size={16} className="text-purple-500" />
            <h3 className="text-sm font-bold text-gray-800">Core Engine Activity Logs ({logs.length})</h3>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No historical transaction logs flagged under targeting parameters.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-gray-100 flex flex-col gap-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 uppercase text-[11px] tracking-wide font-mono">{log.activityType.replace('_', ' ')}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${log.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
                      {log.status}
                    </span>
                  </div>
                  <div className="text-gray-400 flex items-center gap-1 mt-1 text-[11px]">
                    <Clock size={12} /> {new Date(log.date).toLocaleString()}
                  </div>
                  {log.metadata && (
                    <div className="mt-2 pt-2 border-t border-dashed border-gray-200 text-gray-500 font-mono text-[11px] grid grid-cols-2 gap-1">
                      {log.metadata.durationMinutes !== undefined && <div>Duration: {log.metadata.durationMinutes} min</div>}
                      {log.metadata.stopTime && <div className="truncate">Ended: {new Date(log.metadata.stopTime).toLocaleTimeString()}</div>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div> */}
        {/* Action Logs Feed Module */}
<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
  <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
    <ScrollText size={16} className="text-purple-500" />
    <h3 className="text-sm font-bold text-gray-800">Activity Logs ({logs.length})</h3>
  </div>
  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
    {logs.map((log) => (
      <div key={log.id} className="p-3 rounded-lg bg-slate-50 border border-gray-100 flex flex-col gap-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-800 uppercase text-[11px] tracking-wide font-mono">
            {log.activityType.replace('_', ' ')}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${log.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'}`}>
            {log.status}
          </span>
        </div>
        {/* Render dates, durationMinutes, and stopTime here */}
      </div>
    ))}
  </div>
</div>

      </div>
    </div>
  );
};