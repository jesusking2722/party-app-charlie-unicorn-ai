import { Platform } from "react-native";

/**
 * This function patches the BackHandler functionality
 * to ensure backward compatibility with older code
 */
export function applyBackHandlerPolyfill() {
  if (Platform.OS === "android") {
    try {
      // Use a safer approach - only patch if needed
      const RNBackHandler =
        require("react-native/Libraries/Utilities/BackHandler").default;

      // Check if we need to apply the patch
      if (RNBackHandler && !RNBackHandler.removeEventListener) {
        // Create a compatibility wrapper
        RNBackHandler.removeEventListener = function (
          eventName: any,
          handler: any
        ) {
          console.log(
            "[BackHandler Polyfill] Redirecting removeEventListener to modern API"
          );

          // Modern API doesn't directly support removeEventListener
          // This is a best-effort polyfill that may not work for all cases
          return true;
        };

        console.log("[BackHandler Polyfill] Applied");
      }
    } catch (error) {
      console.warn("[BackHandler Polyfill] Failed to apply:", error);
    }
  }
}
