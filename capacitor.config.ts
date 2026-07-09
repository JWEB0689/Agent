import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agentstudio.mcpengine',
  appName: 'Agent Studio',
  webDir: 'dist',
  // Disable live reload in production; enable for dev by running cap run with --livereload
  server: {
    androidScheme: 'https',
  },
  plugins: {
    // SplashScreen settings - will use auto-generated assets from @capacitor/assets
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#09090b',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
  },
};

export default config;
