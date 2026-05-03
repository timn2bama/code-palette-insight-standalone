import { useState } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useToast } from '@/hooks/use-toast';
import { logger } from "@/utils/logger";

export const useCameraIntegration = () => {
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();

  const takePicture = async (): Promise<string | null> => {
    try {
      setIsCapturing(true);

      if (!Capacitor.isNativePlatform()) {
        // Web fallback - use file input
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            } else {
              resolve(null);
            }
          };
          input.click();
        });
      }

      // Request camera permissions
      const permissions = await Camera.requestPermissions();
      
      if (permissions.camera !== 'granted') {
        toast({
          title: 'Camera permission denied',
          description: 'Please enable camera access to add photos',
          variant: 'destructive',
        });
        return null;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt, // Allows user to choose camera or gallery
      });

      return image.dataUrl || null;
    } catch (error) {
      logger.error('Camera error:', error);
      toast({
        title: 'Camera error',
        description: 'Failed to capture image',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  const selectFromGallery = async (): Promise<string | null> => {
    try {
      setIsCapturing(true);

      if (!Capacitor.isNativePlatform()) {
        // Web fallback
        return takePicture();
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      return image.dataUrl || null;
    } catch (error) {
      logger.error('Gallery error:', error);
      toast({
        title: 'Gallery error',
        description: 'Failed to select image',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsCapturing(false);
    }
  };

  return {
    takePicture,
    selectFromGallery,
    isCapturing,
  };
};