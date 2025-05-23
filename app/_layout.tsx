import { ThemeProvider } from "@/contexts/ThemeContext";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import * as Font from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, Linking, StyleSheet, View } from "react-native";

import { GOOGLE_API_KEY } from "@/constant";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { ToastProvider } from "@/contexts/ToastContext";
import Translator from "@/contexts/TranslatorContext";
import { Header, Navbar } from "@/layouts";
import { fetchStripePublishableKey } from "@/lib/scripts/stripe.scripts";
import socket from "@/lib/socketInstance";
import { store } from "@/redux/store";
import cacheProvider from "@/utils/cacheProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { Provider } from "react-redux";
import AppStateListener from "./AppStateListener";

import { GoogleSignin } from "@react-native-google-signin/google-signin";

export const configGoogleSignIn = () => {
  GoogleSignin.configure({
    webClientId:
      "996856391179-4dfdrkcluv31jtcqefn3gc9adppqjqm0.apps.googleusercontent.com",
    iosClientId:
      "996856391179-39prl3561vq266fcf8ttua2kh9lhbl3q.apps.googleusercontent.com",
    offlineAccess: true,
  });
};

import "@walletconnect/react-native-compat";

import {
  AppKit,
  createAppKit,
  defaultConfig,
} from "@reown/appkit-ethers-react-native";

const projectId = "496a6d2135269fb305efd97d87c9d969";

const metadata = {
  name: "PARTY APP",
  description: "PARTY APP POWERED BY CHARLIE UNICORN AI",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "partyappcharlieunicornai://",
  },
};

const config = defaultConfig({ metadata });

const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};

const chains = [mainnet];

createAppKit({
  projectId,
  chains,
  config,
  enableAnalytics: true,
});

SplashScreen.preventAutoHideAsync();

const NAVIGATION_HIDDEN_ROUTES = [
  "/auth",
  "/start",
  "/onboarding",
  "/login",
  "/signup",
  "/reset-password",
];

export default function RootLayout() {
  const [publishableKey, setPublishableKey] = useState<string>("");

  const pathname = usePathname();

  // Determine if navigation components should be shown based on current route
  const showNavigation = !NAVIGATION_HIDDEN_ROUTES.some((route) =>
    pathname?.startsWith(route)
  );

  const userData = {
    avatar: undefined,
    notificationCount: 5,
    chatCount: 3,
  };

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts
        await Font.loadAsync({
          "Montserrat-Regular": require("@/assets/fonts/Montserrat/static/Montserrat-Regular.ttf"),
          "Montserrat-Medium": require("@/assets/fonts/Montserrat/static/Montserrat-Medium.ttf"),
          "Montserrat-SemiBold": require("@/assets/fonts/Montserrat/static/Montserrat-SemiBold.ttf"),
          "Montserrat-Bold": require("@/assets/fonts/Montserrat/static/Montserrat-Bold.ttf"),
        });
      } catch (e) {
        console.warn(e);
      } finally {
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    configGoogleSignIn();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        return true;
      }
    );

    // remove
    subscription.remove();
  }, []);

  const handleRealtimeSocket = useCallback(async () => {
    const token = await AsyncStorage.getItem("Authorization");
    if (token) {
      const decoded = jwtDecode(token) as any;
      socket.emit("login", decoded.id);
    }
  }, [pathname]);

  useEffect(() => {
    handleRealtimeSocket();
  }, [handleRealtimeSocket]);

  // Stripe initialize
  const stripe = useStripe();

  const handleDeepLink = useCallback(async (url: string | null) => {
    if (!url) return;

    if (stripe) {
      const stripeHandled = await stripe.handleURLCallback(url);
      if (stripeHandled) {
      }
    }
  }, []);

  useEffect(() => {
    // Get the initial URL that opened the app
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getInitialURL();

    // Listen for new deep links to the app
    const linkingSubscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      linkingSubscription.remove();
    };
  }, [handleDeepLink]);

  const fetchPublishableKey = async () => {
    const response = await fetchStripePublishableKey();
    setPublishableKey(response.data);
  };

  useEffect(() => {
    fetchPublishableKey();
  }, []);
  /////////////////////////////////////////////////////////

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  const { language } = useLanguage();

  return (
    <Provider store={store}>
      <StripeProvider
        publishableKey={publishableKey}
        merchantIdentifier="merchant.com.yourapp"
        urlScheme="your-url-scheme"
        threeDSecureParams={{ backgroundColor: "#FFF" }}
      >
        <LanguageProvider>
          <Translator
            from="en"
            to={language}
            googleApiKey={GOOGLE_API_KEY}
            cacheProvider={cacheProvider}
          >
            <ThemeProvider>
              <ToastProvider>
                <AppStateListener />

                <View style={styles.container} onLayout={onLayoutRootView}>
                  {/* Header component */}
                  {showNavigation && <Header />}

                  {/* Main content */}
                  <View
                    style={[
                      styles.content,
                      showNavigation && styles.contentWithNavigation,
                    ]}
                  >
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="index" />
                      <Stack.Screen name="start" />
                      <Stack.Screen name="auth" />
                      <Stack.Screen name="onboarding" />
                      <Stack.Screen name="home/index" />
                      <Stack.Screen name="parties" />
                      <Stack.Screen name="subscription/index" />
                      <Stack.Screen name="tickets/index" />
                      <Stack.Screen name="review/index" />
                      <Stack.Screen name="exchange" />
                      <Stack.Screen name="profile/index" />
                      <Stack.Screen name="chat/index" />
                    </Stack>
                  </View>

                  {showNavigation && (
                    <Navbar unreadChats={userData.chatCount} />
                  )}
                </View>

                <AppKit />
              </ToastProvider>
            </ThemeProvider>
          </Translator>
        </LanguageProvider>
      </StripeProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#4338ca",
  },
  content: {
    flex: 1,
  },
  contentWithNavigation: {
    paddingBottom: 80,
  },
});
