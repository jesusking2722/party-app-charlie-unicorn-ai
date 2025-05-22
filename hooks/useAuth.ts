import { RootState } from "@/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePathname, router } from "expo-router";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";

const useAuth = () => {
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const pathname = usePathname();

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = await AsyncStorage.getItem("Authorization");

      // If no token (not authenticated)
      if (!token) {
        // If trying to access protected routes, redirect to login
        if (
          !pathname.includes("/auth/login") &&
          !pathname.includes("/auth/register") &&
          !pathname.includes("/auth/verify") &&
          !pathname.includes("/auth/reset-password")
        ) {
          router.replace("/auth/login");
        }
      } else {
        // Check if token is expired
        try {
          const decoded = jwtDecode(token) as any;
          const now = Math.floor(Date.now() / 1000);

          if (decoded.exp < now) {
            // Token expired, clear it and redirect to login
            await AsyncStorage.removeItem("Authorization");
            router.replace("/auth/login");
            return;
          }

          if (user) {
            if (!user.emailVerified) {
              router.replace("/auth/verify");
            } else if (!user.name) {
              router.replace("/onboarding/profileSetup");
            } else if (!user.title) {
              router.replace("/onboarding/professionSetup");
            }
          }
        } catch (error) {
          // Invalid token format, clear it and redirect to login
          await AsyncStorage.removeItem("Authorization");
          router.replace("/auth/login");
        }
      }
    };

    checkAuthentication();
  }, [pathname, isAuthenticated, user]);

  return { isAuthenticated, user };
};

export default useAuth;
