import React from 'react';
import { useAuthStore } from '../store/authStore';
import { auth } from '../firebase/config';
import { LayoutDashboard, LogOut, MapPin, ShieldCheck } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await auth.signOut();
    logout();
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between">
        <div>
          <div className="p-5 bg-slate-950 flex items-center gap-3 border-b border-slate-800">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wide">TRACKER PANEL</h1>
              <p className="text-xs text-blue-400 font-medium">System Administration</p>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <button
              onClick={() => (window.location.hash = '')}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition bg-slate-800 text-blue-400 hover:bg-slate-800"
            >
              <LayoutDashboard size={18} />
              Overview Console
            </button>
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="mb-3 px-2">
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            <span className="text-[10px] uppercase font-bold tracking-wider text-green-400">Admin Active</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-950/40 text-red-400 border border-red-900/50 rounded-lg text-sm font-medium transition hover:bg-red-900/30"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Primary Display Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <MapPin size={16} className="text-blue-600" />
            <span>Operational Region: Nepal (Live updates)</span>
          </div>
          
        </header>
        <div className="flex-1 overflow-y-auto p-8">{children}</div>
      </main>
    </div>
  );
};