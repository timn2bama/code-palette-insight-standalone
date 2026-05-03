import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Trash2, Shield } from 'lucide-react';
import { useDataExport } from '@/hooks/queries/useDataExport';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logger } from "@/utils/logger";

export function PrivacyControls() {
  const { user, signOut } = useAuth();
  const { exportUserData, deleteAllUserData, isExporting } = useDataExport();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDataExport = async () => {
    const success = await exportUserData();
    if (success) {
      // Log the export for audit purposes
      logger.info('User data exported:', { user_id: user?.id, timestamp: new Date().toISOString() });
    }
  };

  const handleAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      const success = await deleteAllUserData();
      if (success) {
        toast.success('Your account and all data have been permanently deleted.');
        await signOut();
      }
    } catch (error) {
      toast.error('Failed to delete account. Please contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Data Controls
          </CardTitle>
          <CardDescription>
            Manage your personal data and privacy settings in accordance with your rights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Data Export */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Your Data</h4>
              <p className="text-sm text-muted-foreground">
                Download a copy of all your personal data stored in SyncStyle.
              </p>
            </div>
            <Button 
              onClick={handleDataExport}
              disabled={isExporting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export Data'}
            </Button>
          </div>

          {/* Account Deletion */}
          <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 dark:border-red-800">
            <div>
              <h4 className="font-medium text-red-600 dark:text-red-400">Delete Account</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive"
                  className="flex items-center gap-2"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers, including:
                    <ul className="mt-2 list-disc list-inside text-sm">
                      <li>All wardrobe items and photos</li>
                      <li>All created outfits</li>
                      <li>Your profile information</li>
                      <li>All personal preferences and settings</li>
                    </ul>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleAccountDeletion}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Privacy Information */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Your Privacy Rights</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Right to access your personal data</li>
              <li>• Right to correct inaccurate data</li>
              <li>• Right to delete your data</li>
              <li>• Right to data portability</li>
              <li>• Right to object to data processing</li>
            </ul>
            <p className="text-xs text-muted-foreground mt-2">
              For questions about your data or privacy, contact us at privacy@syncstyle.app
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}