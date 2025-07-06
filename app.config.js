
export default ({ config }) => {
  return {

    ...config,
    extra: {
      ...config.extra,
      API_URL: process.env.EXPO_PUBLIC_API_URL,
    },
    android: {
      ...config.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-service.json',
      config: {
        ...config.android.config,
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY,
        },
      },
    },


  };
};