import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import './global.css'
import { I18nextProvider } from "react-i18next";
import i18n from "@/utils/i18n";
import { LocationProvider } from "@/lib/locationContxt";
import { AuthProvider } from "@/lib/authContext";
import { StatusBar } from "react-native";
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
      <>
     <LocationProvider>
     <AuthProvider>
      <I18nextProvider i18n={i18n}>
          <Stack screenOptions={{headerShown : false}}/>
          <StatusBar hidden={true}/>
      </I18nextProvider>
      </AuthProvider>
     </LocationProvider>
      </>
    // <LocationProvider>
    //   <AuthProvider>
  
    //   </AuthProvider>
    // </LocationProvider>
  )
}
