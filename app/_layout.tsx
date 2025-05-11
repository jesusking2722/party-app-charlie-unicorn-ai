import { ThemeProvider } from "@/contexts/ThemeContext";
import * as Font from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import "./global.css";

import { Header, Navbar } from "@/layouts";

SplashScreen.preventAutoHideAsync();

const NAVIGATION_HIDDEN_ROUTES = [
  "/",
  "/auth",
  "/onboarding",
  "/login",
  "/signup",
  "/reset-password",
];

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
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
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Handle create button press in navbar
  const handleCreatePress = () => {
    console.log("Create button pressed");
  };

  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <View style={styles.container} onLayout={onLayoutRootView}>
        {/* Header component */}
        {showNavigation && (
          <Header
            userAvatar={userData.avatar}
            notificationCount={userData.notificationCount}
            chatCount={userData.chatCount}
            showBackButton={pathname !== "/main" && pathname !== "/"}
          />
        )}

        {/* Main content */}
        <View
          style={[
            styles.content,
            showNavigation && styles.contentWithNavigation,
          ]}
        >
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="main" />
          </Stack>
        </View>

        {/* Navbar component */}
        {showNavigation && (
          <Navbar
            unreadChats={userData.chatCount}
            onCreatePress={handleCreatePress}
          />
        )}
      </View>
    </ThemeProvider>
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
