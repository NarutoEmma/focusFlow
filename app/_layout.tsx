
import { Stack } from "expo-router";
import React from "react";
import { ThemeProvider, useTheme } from "../utils/theme";

//themed stack navigator with app colors
function ThemedStack() {
  const { colors } = useTheme();
  return (
      <ThemeProvider>
          <Stack>
              <Stack.Screen name="index" options={{headerShown: false, gestureEnabled:false}}/>
              <Stack.Screen name="home" options={{headerShown: false, gestureEnabled:false}}/>
              <Stack.Screen name="modules" options={{title: "Modules"}}/>
          </Stack>
      </ThemeProvider>
  );
}

export default function RootLayout() {

  return (
    <ThemeProvider>
      <ThemedStack />
    </ThemeProvider>
  );
}
