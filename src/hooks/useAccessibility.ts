import { useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { logger } from "@/utils/logger";

interface AccessibilitySettings {
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  voiceControl: boolean;
  screenReaderOptimized: boolean;
}

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    voiceControl: false,
    screenReaderOptimized: false,
  });

  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    loadAccessibilitySettings();
    detectSystemPreferences();
  }, []);

  useEffect(() => {
    applyAccessibilitySettings();
  }, [settings]);

  const loadAccessibilitySettings = async () => {
    try {
      const { value } = await Preferences.get({ key: 'accessibilitySettings' });
      if (value) {
        setSettings(JSON.parse(value));
      }
    } catch (error) {
      logger.error('Failed to load accessibility settings:', error);
    }
  };

  const saveAccessibilitySettings = async (newSettings: AccessibilitySettings) => {
    try {
      await Preferences.set({ 
        key: 'accessibilitySettings', 
        value: JSON.stringify(newSettings) 
      });
      setSettings(newSettings);
    } catch (error) {
      logger.error('Failed to save accessibility settings:', error);
    }
  };

  const detectSystemPreferences = () => {
    // Detect system preferences
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      setSettings(prev => ({ ...prev, highContrast: true }));
    }
  };

  const applyAccessibilitySettings = () => {
    const root = document.documentElement;
    
    // High contrast mode
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    root.classList.add(`font-${settings.fontSize}`);

    // Screen reader optimization
    if (settings.screenReaderOptimized) {
      root.classList.add('screen-reader-optimized');
    } else {
      root.classList.remove('screen-reader-optimized');
    }
  };

  const toggleHighContrast = () => {
    const newSettings = { ...settings, highContrast: !settings.highContrast };
    saveAccessibilitySettings(newSettings);
  };

  const toggleReducedMotion = () => {
    const newSettings = { ...settings, reducedMotion: !settings.reducedMotion };
    saveAccessibilitySettings(newSettings);
  };

  const setFontSize = (size: AccessibilitySettings['fontSize']) => {
    const newSettings = { ...settings, fontSize: size };
    saveAccessibilitySettings(newSettings);
  };

  const toggleScreenReaderOptimization = () => {
    const newSettings = { ...settings, screenReaderOptimized: !settings.screenReaderOptimized };
    saveAccessibilitySettings(newSettings);
  };

  // Voice control functionality
  const startVoiceControl = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      logger.error('Speech recognition not supported');
      return;
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
      handleVoiceCommand(command);
    };

    recognition.start();
  }, []);

  const handleVoiceCommand = (command: string) => {
    // Basic voice commands
    if (command.includes('go to wardrobe') || command.includes('open wardrobe')) {
      window.location.href = '/wardrobe';
    } else if (command.includes('go to outfits') || command.includes('open outfits')) {
      window.location.href = '/outfits';
    } else if (command.includes('go to analytics')) {
      window.location.href = '/analytics';
    } else if (command.includes('go home')) {
      window.location.href = '/';
    } else if (command.includes('high contrast on')) {
      if (!settings.highContrast) toggleHighContrast();
    } else if (command.includes('high contrast off')) {
      if (settings.highContrast) toggleHighContrast();
    } else if (command.includes('larger text') || command.includes('bigger font')) {
      const sizes: AccessibilitySettings['fontSize'][] = ['small', 'medium', 'large', 'extra-large'];
      const currentIndex = sizes.indexOf(settings.fontSize);
      if (currentIndex < sizes.length - 1) {
        setFontSize(sizes[currentIndex + 1]);
      }
    } else if (command.includes('smaller text') || command.includes('smaller font')) {
      const sizes: AccessibilitySettings['fontSize'][] = ['small', 'medium', 'large', 'extra-large'];
      const currentIndex = sizes.indexOf(settings.fontSize);
      if (currentIndex > 0) {
        setFontSize(sizes[currentIndex - 1]);
      }
    }
  };

  // Keyboard navigation helpers
  const handleKeyboardNavigation = useCallback((event: KeyboardEvent) => {
    // Add custom keyboard shortcuts
    if (event.altKey) {
      switch (event.key) {
        case '1':
          event.preventDefault();
          window.location.href = '/';
          break;
        case '2':
          event.preventDefault();
          window.location.href = '/wardrobe';
          break;
        case '3':
          event.preventDefault();
          window.location.href = '/outfits';
          break;
        case '4':
          event.preventDefault();
          window.location.href = '/analytics';
          break;
        case 'h':
          event.preventDefault();
          toggleHighContrast();
          break;
      }
    }
  }, [settings.highContrast]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardNavigation);
    return () => document.removeEventListener('keydown', handleKeyboardNavigation);
  }, [handleKeyboardNavigation]);

  return {
    settings,
    toggleHighContrast,
    toggleReducedMotion,
    setFontSize,
    toggleScreenReaderOptimization,
    startVoiceControl,
    isListening,
    saveAccessibilitySettings,
  };
};