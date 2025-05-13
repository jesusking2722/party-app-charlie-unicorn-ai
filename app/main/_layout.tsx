import { Stack } from "expo-router";

export default function MainRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="events" />
      <Stack.Screen name="notification" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
