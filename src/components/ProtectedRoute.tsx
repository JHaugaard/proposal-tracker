import { AppLayout } from '@/components/AppLayout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // TEMPORARY: Authentication disabled for emergency access
  return (
    <AppLayout>
      <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950/20">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <strong>⚠️ Authentication Temporarily Disabled</strong> - All security checks are bypassed. 
          Please re-enable authentication by restoring the original ProtectedRoute component once you regain access.
        </AlertDescription>
      </Alert>
      {children}
    </AppLayout>
  );
}