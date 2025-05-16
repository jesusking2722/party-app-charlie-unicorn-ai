import {
  GOOGLE_ANDROID_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
} from "@/constant";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

// Register web browser for auth redirects
WebBrowser.maybeCompleteAuthSession();

// Define interface for Google user information
export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export default class GoogleAuthService {
  // Hook for Google authentication - optimized for native builds
  static useGoogleAuth() {
    return Google.useAuthRequest({
      androidClientId: GOOGLE_ANDROID_CLIENT_ID,
      iosClientId: GOOGLE_IOS_CLIENT_ID,
      webClientId: GOOGLE_WEB_CLIENT_ID,
      scopes: ["profile", "email"],
    });
  }

  // Fetch user information from Google
  static async fetchUserInfo(
    accessToken: string
  ): Promise<GoogleUserInfo | null> {
    if (!accessToken) return null;

    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user info from Google");
      }

      return (await response.json()) as GoogleUserInfo;
    } catch (error) {
      console.error("Error fetching Google user info:", error);
      return null;
    }
  }
}
