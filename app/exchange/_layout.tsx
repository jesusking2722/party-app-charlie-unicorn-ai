import { Stack } from "expo-router";

export default function ExchangeRootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="cardExchange" />
      <Stack.Screen name="cryptoExchange" />
    </Stack>
  );
}
