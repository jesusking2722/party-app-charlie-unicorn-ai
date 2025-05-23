import { useToast } from "@/contexts/ToastContext";
import { setAuthToken } from "@/lib/axiosInstance";
import { RootState } from "@/redux/store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, usePathname } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const useAuth = () => {
  const pathname = usePathname();
  const hasInitialized = useRef(false);

  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  const { showToast } = useToast();

  useEffect(() => {
    const checkAuthentication = async () => {
      if (!hasInitialized.current) {
        hasInitialized.current = true;

        // On first app load, redirect to /start
        if (!pathname.includes("/start")) {
          router.replace("/start");
        }
        return;
      }

      const token = await AsyncStorage.getItem("Authorization");

      if (!token) {
        if (
          (!pathname.includes("/auth/login") &&
            !pathname.includes("/auth/register") &&
            !pathname.includes("/auth/verify") &&
            !pathname.includes("/auth/resetPassword") &&
            !pathname.includes("/home") &&
            !pathname.includes("/parties") &&
            !pathname.startsWith("/parties/") &&
            !pathname.includes("/start")) ||
          pathname.includes("/parties/create")
        ) {
          router.replace("/auth/login");
        }
      } else {
        const decoded = jwtDecode(token) as any;
        const now = Math.floor(Date.now() / 1000);

        if (decoded.exp < now) {
          setAuthToken(null);
          router.replace("/auth/login");
          showToast("Your session is expired", "error");
        } else {
          if (
            user &&
            !user.kycVerified &&
            user.membership === "free" &&
            pathname === "/parties/create"
          ) {
            router.replace("/onboarding/kycSetup");
            showToast(
              "You must verify your identity, or you can buy Premium Membership",
              "info"
            );
          }
        }
      }
    };

    checkAuthentication();
  }, [pathname]);

  return { isAuthenticated, user };
};

export default useAuth;
