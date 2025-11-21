// Import the Stack navigator from expo-router. This lets us define a stack of screens
// and automatically connect files in the /app folder as screens based on their filenames.
import { Stack } from "expo-router";
import React from "react";
import { ThemeProvider, useTheme } from "./theme";

// This is the root layout component. expo-router will render this first and
// then place your screens inside the <Stack /> according to the current route.
function ThemedStack() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.card },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.text as string,
      }}
    />
  );
}

export default function RootLayout() {
  // Returning <Stack /> tells expo-router to use a native-like stack navigation.
  // Each file in the /app directory (like home.tsx, notification.tsx) becomes a screen.
  return (
    <ThemeProvider>
      <ThemedStack />
    </ThemeProvider>
  );
}
