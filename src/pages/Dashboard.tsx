import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Users, Building2, TrendingUp, Plus } from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { stats, loading } = useDashboard();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of Proposals
        </p>
      </div>

      <div className="grid gap-4 grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : (stats.statusCounts['In'] || 0)}</div>
            <p className="text-xs text-muted-foreground">
              proposals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : (stats.statusCounts['Pending'] || 0)}</div>
            <p className="text-xs text-muted-foreground">
              proposals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Signatures</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : (stats.statusCounts['Pending Signatures'] || 0)}</div>
            <p className="text-xs text-muted-foreground">
              proposals
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Process</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : (stats.statusCounts['Process'] || 0)}</div>
            <p className="text-xs text-muted-foreground">
              proposals
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-6">
        <Button onClick={() => navigate('/proposals')}>
          <Plus className="h-4 w-4 mr-2" />
          Add Proposal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest proposal updates and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity. Start by adding your first proposal.
              </p>
            ) : (
              <div className="space-y-2">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{activity.db_no}</span>
                      <span className="text-muted-foreground"> • {activity.pi_name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.updated_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status Overview</CardTitle>
            <CardDescription>
              Breakdown of proposal statuses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.statusCounts).length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No proposals to display. Add some proposals to see status distribution.
              </p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.statusCounts).map(([status, count]) => (
                  <div key={status} className="flex justify-between items-center text-sm">
                    <span>{status}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;