import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nhanphan1159.personalos',
  appName: 'Personal OS',
  webDir: 'dist',
  ios: {
    contentInset: 'never',
    backgroundColor: '#f8fafc',
  },
};

export default config;
