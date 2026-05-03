import { useState, useEffect } from 'react';
import { PushNotifications, Token, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { useToast } from '@/hooks/use-toast';
import { logger } from "@/utils/logger";

export const usePushNotifications = () => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializePushNotifications();
    }
  }, []);

  const initializePushNotifications = async () => {
    try {
      // Request permission
      const result = await PushNotifications.requestPermissions();
      
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        await PushNotifications.register();
        setIsRegistered(true);
      }

      // On success, we should be able to receive notifications
      PushNotifications.addListener('registration', (token: Token) => {
        setToken(token.value);
        toast({
          title: 'Push notifications enabled',
          description: 'You will receive outfit reminders',
        });
      });

      // Some issue with our setup and push will not work
      PushNotifications.addListener('registrationError', (error: any) => {
        logger.error('Error on registration: ', error);
        toast({
          title: 'Push notification error',
          description: 'Failed to enable notifications',
          variant: 'destructive',
        });
      });

      // Show us the notification payload if the app is open on our device
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        toast({
          title: notification.title || 'Notification',
          description: notification.body || '',
        });
      });

      // Method called when tapping on a notification
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        // Handle notification tap
        if (notification.notification.data?.route) {
          window.location.href = notification.notification.data.route;
        }
      });

    } catch (error) {
      logger.error('Push notification setup failed:', error);
    }
  };

  const scheduleOutfitReminder = async (title: string, body: string, date: Date) => {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Date.now(),
          schedule: { at: date },
          sound: 'default',
          attachments: undefined,
          actionTypeId: '',
          extra: { route: '/outfits' }
        }]
      });

      toast({
        title: 'Reminder set',
        description: 'You will be notified about your outfit',
      });
    } catch (error) {
      logger.error('Failed to schedule notification:', error);
      toast({
        title: 'Failed to set reminder',
        description: 'Could not schedule notification',
        variant: 'destructive',
      });
    }
  };

  const scheduleDailyOutfitReminder = async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0); // 8 AM

    await scheduleOutfitReminder(
      'Plan Your Outfit',
      'Time to choose your outfit for today!',
      tomorrow
    );
  };

  return {
    isRegistered,
    token,
    scheduleOutfitReminder,
    scheduleDailyOutfitReminder,
  };
};