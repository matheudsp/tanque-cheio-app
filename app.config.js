
export default ({ config }) => {
  return {

    ...config,
    name: "Tanque Cheio",
    slug: "tanquecheio",
    android: {
      ...config.android,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
      config: {
        ...config.android.config,
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_ANDROID_KEY ?? './google-service.json',
        },
      },
    },


  };
};