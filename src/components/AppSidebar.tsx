import { FileText, Users, Building2, Database, Settings, User, Edit, Key, LogOut, Zap } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import { supabase } from '@/integrations/supabase/client';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

const navigationItems = [
  { title: 'Dashboard', url: '/', icon: Database },
  { title: 'Proposals', url: '/proposals', icon: FileText },
  { title: 'PIs', url: '/pis', icon: Users },
  { title: 'Sponsors', url: '/sponsors', icon: Building2 },
  { title: 'DB Distiller', url: '/distiller', icon: Zap },
  { title: 'Settings', url: '/settings', icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut, resetPassword } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const { toast } = useToast();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const isActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50';

  const isCollapsed = state === 'collapsed';

  const handleEditProfile = async () => {
    if (!user) return;
    
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { display_name: displayName }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
      setIsEditProfileOpen(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user?.email) return;
    
    setIsSendingReset(true);
    try {
      const { error } = await resetPassword(user.email);

      if (error) throw error;

      toast({
        title: "Password Reset Sent",
        description: "Check your email for password reset instructions.",
      });
      setIsChangePasswordOpen(false);
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: "Error", 
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center justify-between">
            <SidebarGroupLabel className="text-sm font-semibold">
              {!isCollapsed && 'Proposal Tracker'}
            </SidebarGroupLabel>
            <SidebarTrigger className="h-6 w-6" />
          </div>
          
          {/* User Section */}
          <div className="px-2 py-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start h-8 px-2"
                >
                  <User className="h-4 w-4 mr-2" />
                  {!isCollapsed && (
                    <div className="flex flex-col items-start text-xs">
                      <span className="font-medium">Account</span>
                      <span className="text-muted-foreground truncate max-w-[140px]">
                        {user?.email}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                      <DialogDescription>
                        Update your profile information.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="display-name">Display Name</Label>
                        <Input
                          id="display-name"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Enter your display name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user?.email || ''} disabled />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditProfileOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleEditProfile}
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
                  <DialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </DropdownMenuItem>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        We'll send you a password reset link to your email address.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user?.email || ''} disabled />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsChangePasswordOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleChangePassword}
                        disabled={isSendingReset}
                      >
                        {isSendingReset ? 'Sending...' : 'Send Reset Link'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === '/'}
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}