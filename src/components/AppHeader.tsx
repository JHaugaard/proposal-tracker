import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/components/AuthContext';

export function AppHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-foreground">Proposal Tracker</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{user?.email}</span>
        <Button variant="outline" size="sm" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}