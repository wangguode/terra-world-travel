const config = {
  appId: "com.wangguo.terraworld",
  appName: "TERRA 跨国生存",
  webDir: "out",
  bundledWebRuntime: false,
  server: {
    androidScheme: "https",
    iosScheme: "capacitor",
  },
  ios: {
    contentInset: "always",
    preferredContentMode: "mobile",
    backgroundColor: "#F2F2F7",
  },
  android: {
    backgroundColor: "#F2F2F7",
    allowMixedContent: false,
  },
};

export default config;
