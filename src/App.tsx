import  { useEffect, useState } from 'react';
import { useAuthStore } from './store/authStore';
import { auth } from './firebase/config';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { UserDetails } from './pages/UserDetails';

function App() {
  const { user, isAdmin, setUser, setIsAdmin } = useAuthStore();
  const [currentHash, setCurrentHash] = useState(window.location.hash);
  const [authResolving, setAuthResolving] = useState(true);

  useEffect(() => {
    const handleHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const adminEmails = ['ssnjitm6@gmail.com', 'ssnjitm@gmail.com', 'admin@locationtracker.com', 'admin@example.com'];
        setIsAdmin(adminEmails.includes(firebaseUser.email || ''));
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setAuthResolving(false);
    });

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      unsubscribe();
    };
  }, [setUser, setIsAdmin]);

  if (authResolving) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-mono text-sm tracking-wider">
        INITIALIZING CORE AUTH SYSTEMS...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Login />;
  }

  // Basic client-side hash routing handler 
  const renderRoute = () => {
    if (currentHash.startsWith('#/user')) {
      return <UserDetails />;
    }
    return <Dashboard />;
  };

  return <Layout>{renderRoute()}</Layout>;
}

export default App;