import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bizlogicsolutions.bsmart.crdb',
  appName: 'bsmart_crdb_mobile_app',
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
