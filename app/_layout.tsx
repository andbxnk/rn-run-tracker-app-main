import {
  Krub_400Regular,
  Krub_700Bold,
  useFonts,
} from "@expo-google-fonts/krub";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Krub_400Regular,
    Krub_700Bold,
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, [fontsLoaded]);
 
  if (!fontsLoaded) {
    return null;
  }
  //------------------------------------
 
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#1619ec",
        },
        headerTitleStyle: {
          fontFamily: "Krub_400Regular",
          fontSize: 20,
          color: "#fff",
        },
        headerTitleAlign: "center",
        headerTintColor: "#fff",
        headerBackButtonDisplayMode: "minimal",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="run" options={{ title: "Run Tracker V.1.1" }} />
      <Stack.Screen name="add" options={{ title: "เพิ่มรายการวิ่ง" }} />
      <Stack.Screen name="[id]" options={{ title: "รายละเอียดการวิ่ง" }} />
    </Stack>
  );
}