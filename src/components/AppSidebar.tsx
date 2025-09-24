import { FileText, Users, Building2, Database, User, Edit, Key, LogOut, Zap } from 'lucide-react';
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
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { user, signOut, resetPassword, updatePassword } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const { toast } = useToast();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  
  // Direct password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showDirectChange, setShowDirectChange] = useState(true);

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

  const handleDirectPasswordChange = async () => {
    console.log('Password change attempt started');
    
    if (!newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsChangingPassword(true);
    
    try {
      // Ensure we have a valid session before attempting password change
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession) {
        console.error('No valid session found');
        toast({
          title: "Session Expired",
          description: "Please sign out and sign back in to change your password.",
          variant: "destructive",
        });
        return;
      }

      console.log('Current session valid, attempting password update...');
      const result = await updatePassword(newPassword);
      const { error } = result;

      if (error) {
        console.error('Password update failed:', error);
        throw error;
      }

      console.log('Password changed successfully');
      toast({
        title: "Success",
        description: "Password changed successfully.",
      });
      handleClosePasswordDialog();
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) return;
    
    setIsSendingReset(true);
    try {
      const { error } = await resetPassword(user.email);

      if (error) throw error;

      setResetEmailSent(true);
      toast({
        title: "Password Reset Sent",
        description: "Check your email for password reset instructions.",
      });
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

  const handleClosePasswordDialog = () => {
    setIsChangePasswordOpen(false);
    setResetEmailSent(false);
    setShowDirectChange(true);
    setNewPassword('');
    setConfirmPassword('');
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
                
                <Dialog open={isChangePasswordOpen} onOpenChange={handleClosePasswordDialog}>
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
                         {resetEmailSent 
                           ? "Password reset email has been sent successfully!"
                           : showDirectChange 
                             ? "Choose a new password for your account."
                             : "We'll send you a password reset link to your email address."
                         }
                       </DialogDescription>
                    </DialogHeader>
                    
                    {resetEmailSent ? (
                      <>
                        <div className="py-4">
                          <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Check your email at <strong>{user?.email}</strong> for password reset instructions.
                            </p>
                            <p className="text-xs text-muted-foreground">
                              If you don't see the email, check your spam folder.
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleClosePasswordDialog}>
                            Close
                          </Button>
                        </DialogFooter>
                      </>
                    ) : showDirectChange ? (
                       <>
                         <div className="py-4 space-y-4">
                           <div className="space-y-2">
                             <Label htmlFor="new-password">New Password</Label>
                             <Input
                               id="new-password"
                               type="password"
                               value={newPassword}
                               onChange={(e) => setNewPassword(e.target.value)}
                               placeholder="Enter your new password"
                             />
                           </div>
                           <div className="space-y-2">
                             <Label htmlFor="confirm-password">Confirm New Password</Label>
                             <Input
                               id="confirm-password"
                               type="password"
                               value={confirmPassword}
                               onChange={(e) => setConfirmPassword(e.target.value)}
                               placeholder="Confirm your new password"
                             />
                           </div>
                         </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowDirectChange(false)}
                          >
                            Use Email Reset
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleClosePasswordDialog}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleDirectPasswordChange}
                            disabled={isChangingPassword}
                          >
                            {isChangingPassword ? 'Changing...' : 'Change Password'}
                          </Button>
                        </DialogFooter>
                      </>
                    ) : (
                      <>
                        <div className="py-4">
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={user?.email || ''} disabled />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setShowDirectChange(true)}
                          >
                            Use Direct Change
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleClosePasswordDialog}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleSendResetEmail}
                            disabled={isSendingReset}
                          >
                            {isSendingReset ? 'Sending...' : 'Send Reset Link'}
                          </Button>
                        </DialogFooter>
                      </>
                    )}
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