import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lifetodo',
  appName: 'Life To Do',
  webDir: 'out',                        // Next.js static export output

  server: {
    androidScheme: 'https'
  },

  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0A0A0F',       // Matches dark theme background
      showSpinner: false,
      launchFadeOutDuration: 300,
    },
    StatusBar: {
      style: 'dark',                    // Will be set dynamically by theme
      backgroundColor: '#0A0A0F',
    },
    Keyboard: {
      resize: 'body',                   // Resize WebView when keyboard appears
      style: 'dark',                    // Match theme
      resizeOnFullScreen: true,
    },
    LocalNotifications: {
      smallIcon: 'ic_notification',
      iconColor: '#6366F1',             // Primary accent color
    },
  },

  ios: {
    scheme: 'Life To Do',
    contentInset: 'automatic',          // Safe area handling
  },

  android: {
    buildOptions: {
      keystorePath: 'release.keystore',
      keystoreAlias: 'lifetodo',
    },
  },
};

export default config;
