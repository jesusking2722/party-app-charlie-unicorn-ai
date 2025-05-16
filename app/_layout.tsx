import { ThemeProvider } from "@/contexts/ThemeContext";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import * as Font from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useCallback, useEffect, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import "./global.css";

import { ToastProvider } from "@/contexts/ToastContext";
import { Header, Navbar } from "@/layouts";
import { fetchStripePublishableKey } from "@/lib/scripts/stripe.scripts";
import { store } from "@/redux/store";
import { Provider } from "react-redux";

import "@walletconnect/react-native-compat";

import {
  AppKit,
  createAppKit,
  defaultConfig,
} from "@reown/appkit-ethers-react-native";

const projectId = "985f93ef94b75e99a064d6d6ff61071c";

const metadata = {
  name: "AppKit RN",
  description: "AppKit RN Example",
  url: "https://reown.com/appkit",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
  redirect: {
    native: "YOUR_APP_SCHEME://",
  },
};

const config = defaultConfig({ metadata });

const bscMainnet = {
  chainId: 56,
  name: "Binance Smart Chain",
  currency: "BNB",
  explorerUrl: "https://bscscan.com",
  rpcUrl: "https://bsc-dataseed.binance.org",
};

createAppKit({
  projectId,
  chains: [bscMainnet],
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

  const onLayoutRootView = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  // Stripe initialize
  const stripe = useStripe();

  const handleDeepLink = useCallback(async (url: string | null) => {
    if (!url) return;

    if (stripe) {
      const stripeHandled = await stripe.handleURLCallback(url);
      if (stripeHandled) {
        // This was a Stripe URL - you've handled it
        console.log("Handled Stripe URL:", url);
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

  return (
    <Provider store={store}>
      <StripeProvider
        publishableKey={publishableKey}
        // You can add these if needed
        // merchantIdentifier="merchant.com.yourapp" // Only needed for Apple Pay
        // urlScheme="your-app-scheme" // Required for 3D Secure
      >
        <ThemeProvider>
          <ToastProvider>
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
                  <Stack.Screen name="main" />
                </Stack>
              </View>

              {showNavigation && <Navbar unreadChats={userData.chatCount} />}
            </View>
            <AppKit />
          </ToastProvider>
        </ThemeProvider>
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
