import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
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
    backgroundColor: "#090c12",
  },
  android: {
    backgroundColor: "#090c12",
    allowMixedContent: false,
  },
};

export default config;
