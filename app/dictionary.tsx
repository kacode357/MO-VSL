import React from "react";
import { WebView } from "react-native-webview";

const Dictionary = () => {
  return (
    <WebView
      source={{ uri: "https://qipedc.moet.gov.vn/dictionary" }}
      style={{ flex: 1 }}
    />
  );
};

export default Dictionary;
