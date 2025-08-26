import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your Proposal Tracker preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>
            Manage your application preferences and configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Settings panel coming soon. This will include options for data export, 
            notification preferences, and system configuration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;