import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.beautystudio.app',
  appName: 'Beauty Studio Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
