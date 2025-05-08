import { Stack } from "expo-router";

export default function OnboardingRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="profileSetup" />
      <Stack.Screen name="professionSetup" />
      <Stack.Screen name="kycSetup" />
      <Stack.Screen name="membershipSetup" />
      <Stack.Screen name="congratulationsSetup" />
    </Stack>
  );
}
