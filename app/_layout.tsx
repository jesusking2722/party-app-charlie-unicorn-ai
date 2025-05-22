import { ThemeProvider } from "@/contexts/ThemeContext";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import * as Font from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { BackHandler, Linking, StyleSheet, View } from "react-native";

import { ToastProvider } from "@/contexts/ToastContext";
import { Header, Navbar } from "@/layouts";
import { fetchStripePublishableKey } from "@/lib/scripts/stripe.scripts";
import { store } from "@/redux/store";
import { Provider } from "react-redux";
import socket from "@/lib/socketInstance";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppStateListener from "./AppStateListener";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import Translator from "@/contexts/TranslatorContext";
import { GOOGLE_API_KEY } from "@/constant";
import cacheProvider from "@/utils/cacheProvider";

import "@walletconnect/react-native-compat";

import {
  createAppKit,
  defaultConfig,
  AppKit,
} from "@reown/appkit-ethers-react-native";

// 1. Get projectId from https://cloud.reown.com
const projectId = "496a6d2135269fb305efd97d87c9d969";

// 2. Create config
const metadata = {
  name: "AppKit RN",
  description: "AppKit RN Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "charliehousepartymobilefrontend://",
  },
};

const config = defaultConfig({ metadata });

// 3. Define your chains
const mainnet = {
  chainId: 1,
  name: "Ethereum",
  currency: "ETH",
  explorerUrl: "https://etherscan.io",
  rpcUrl: "https://cloudflare-eth.com",
};

const polygon = {
  chainId: 137,
  name: "Polygon",
  currency: "MATIC",
  explorerUrl: "https://polygonscan.com",
  rpcUrl: "https://polygon-rpc.com",
};

const chains = [mainnet, polygon];

// 4. Create modal
createAppKit({
  projectId,
  chains,
  config,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
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
