import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and application settings
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Name</label>
                <p className="text-sm text-muted-foreground">Jérôme Laval</p>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">jerome@jaap.fr</p>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>Manage your subscription plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Current Plan</label>
                <p className="text-sm text-muted-foreground">Growth - €299/month + €25/lead</p>
              </div>
              <Button>Upgrade Plan</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email updates about your campaigns
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Enabled
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
