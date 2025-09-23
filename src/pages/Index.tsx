import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { AppLayout } from '@/components/AppLayout';
import Dashboard from './Dashboard';

const Index = () => {
  // TEMPORARY: Authentication checks bypassed for development
  // Uncomment the lines below when re-enabling authentication:
  /*
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }
  */

  return (
    <Dashboard />
  );
};

export default Index;
