import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useCameraIntegration } from "@/hooks/useCameraIntegration";
import { useOfflineFirst } from "@/hooks/useOfflineFirst";
import { useWalletIntegration } from "@/hooks/useWalletIntegration";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Camera, 
  Bell, 
  Wifi, 
  WifiOff, 
  Wallet,
  Smartphone,
  Download,
  Upload
} from "lucide-react";

const MobileFeatures = () => {
  const { user } = useAuth();
  const [cameraImage, setCameraImage] = useState<string | null>(null);
  const { scheduleOutfitReminder, scheduleDailyOutfitReminder, isRegistered } = usePushNotifications();
  const { takePicture, selectFromGallery, isCapturing } = useCameraIntegration();
  const { isOnline, pendingActions, syncPendingActions, clearOfflineData } = useOfflineFirst();
  const { generateOutfitPass, generateLoyaltyPass, generateSubscriptionPass, isGenerating } = useWalletIntegration();

  const handleTakePicture = async () => {
    const imageData = await takePicture();
    if (imageData) {
      setCameraImage(imageData);
    }
  };

  const handleSelectFromGallery = async () => {
    const imageData = await selectFromGallery();
    if (imageData) {
      setCameraImage(imageData);
    }
  };

  const handleScheduleReminder = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    await scheduleOutfitReminder(
      "Choose Your Outfit",
      "Time to plan your perfect look for today!",
      tomorrow
    );
  };

  const handleGeneratePasses = async () => {
    if (!user) return;

    // Generate sample outfit pass
    const sampleOutfit = {
      id: '1',
      name: 'Professional Meeting',
      occasion: 'Business',
      weather: 'Cool',
      created_at: new Date().toISOString()
    };

    await generateOutfitPass(sampleOutfit);
    await generateLoyaltyPass(user);
    
    const sampleSubscription = {
      id: '1',
      tier: 'Premium',
      status: 'Active',
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    await generateSubscriptionPass(sampleSubscription);
  };

  return (
    <div className="space-y-6">
      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Get reminders for outfit planning and style tips
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Notification Status</p>
              <p className="text-xs text-muted-foreground">
                {isRegistered ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <Badge variant={isRegistered ? "default" : "secondary"}>
              {isRegistered ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleScheduleReminder}
              disabled={!isRegistered}
              size="sm"
              variant="outline"
            >
              Schedule Daily Reminder
            </Button>
            <Button 
              onClick={scheduleDailyOutfitReminder}
              disabled={!isRegistered}
              size="sm"
              variant="outline"
            >
              Enable Auto-Reminders
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Camera Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Integration
          </CardTitle>
          <CardDescription>
            Quickly add wardrobe items using your camera
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={handleTakePicture}
              disabled={isCapturing}
              size="sm"
              variant="outline"
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
            <Button 
              onClick={handleSelectFromGallery}
              disabled={isCapturing}
              size="sm"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose from Gallery
            </Button>
          </div>
          
          {cameraImage && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Captured Image:</p>
              <img 
                src={cameraImage} 
                alt="Captured wardrobe item" 
                className="w-32 h-32 object-cover rounded-md border"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Capabilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-5 w-5" /> : <WifiOff className="h-5 w-5" />}
            Offline Support
          </CardTitle>
          <CardDescription>
            Your data is automatically synced when connection is restored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Connection Status</p>
              <p className="text-xs text-muted-foreground">
                {isOnline ? 'Online' : 'Offline - Changes saved locally'}
              </p>
            </div>
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "Connected" : "Offline"}
            </Badge>
          </div>

          {pendingActions > 0 && (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Pending Sync</p>
                <p className="text-xs text-muted-foreground">
                  {pendingActions} changes waiting to sync
                </p>
              </div>
              <Button
                onClick={syncPendingActions}
                disabled={!isOnline}
                size="sm"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Sync Now
              </Button>
            </div>
          )}

          <Button
            onClick={clearOfflineData}
            size="sm"
            variant="destructive"
          >
            Clear Offline Data
          </Button>
        </CardContent>
      </Card>

      {/* Wallet Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Digital Wallet
          </CardTitle>
          <CardDescription>
            Generate wallet passes for outfits, loyalty, and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={handleGeneratePasses}
              disabled={isGenerating}
              size="sm"
              variant="outline"
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Generate Sample Passes
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            <p>• Outfit passes for quick access to saved looks</p>
            <p>• Loyalty cards with style points</p>
            <p>• Subscription passes for premium features</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileFeatures;