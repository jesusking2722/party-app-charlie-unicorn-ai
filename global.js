import { Buffer } from "buffer";
import "react-native-get-random-values";

// This ensures the global scope has Buffer defined
global.Buffer = Buffer;

// Fix for ethers.js dependency issues
global.btoa =
  global.btoa ||
  function (str) {
    return Buffer.from(str, "binary").toString("base64");
  };
global.atob =
  global.atob ||
  function (b64Encoded) {
    return Buffer.from(b64Encoded, "base64").toString("binary");
  };

// Required by some web3 libraries
global.process = global.process || { env: {} };
global.process.env = global.process.env || {};
global.process.version = ""; // Node.js version
global.process.env.NODE_ENV = process.env.NODE_ENV || "development";

// React Native does not have a browser's window object
global.window = global.window || global;

if (typeof global.self === "undefined") {
  global.self = global;
}

// Fix for localStorage
if (typeof localStorage === "undefined") {
  global.localStorage = {
    getItem: () => null,
    setItem: () => null,
    removeItem: () => null,
  };
}

// Fix for sessionStorage
if (typeof sessionStorage === "undefined") {
  global.sessionStorage = {
    getItem: () => null,
    setItem: () => null,
    removeItem: () => null,
  };
}

// Web3 libraries often use these
global.URL = global.URL || require("url").URL;
global.XMLHttpRequest =
  global.XMLHttpRequest || require("xmlhttprequest").XMLHttpRequest;
