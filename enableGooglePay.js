const { AndroidConfig, withAndroidManifest } = require("@expo/config-plugins");
const { addMetaDataItemToMainApplication, getMainApplicationOrThrow } =
  AndroidConfig.Manifest;

function setGooglePayMetaData(modResults) {
  const GOOGLE_PAY_META_NAME = "com.google.android.gms.wallet.api.enabled";
  const mainApplication = getMainApplicationOrThrow(modResults);
  addMetaDataItemToMainApplication(
    mainApplication,
    GOOGLE_PAY_META_NAME,
    "true"
  );
  return modResults;
}

function withGooglePayAndroid(expoConfig) {
  return withAndroidManifest(expoConfig, (config) => {
    config.modResults = setGooglePayMetaData(config.modResults);
    return config;
  });
}

module.exports = function withGooglePay(config, props) {
  config = withGooglePayAndroid(config, props);
  return config;
};
