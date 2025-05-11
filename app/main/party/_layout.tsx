import { Stack } from "expo-router";

export default function PartyRootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="create" />
    </Stack>
  );
}
