import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bizlogicsolutions.bsmart.crdb',
  appName: 'bsmartacademia',
  webDir: 'www/browser',
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
    server: {
      cleartext: true,
      androidScheme: 'http',
    },
  },
};

export default config;
