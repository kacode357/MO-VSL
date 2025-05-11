import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import "../global.css";
import { useColorScheme } from '@/hooks/useColorScheme';
import CustomSplashScreen from './splash_screen';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        setShowSplash(false);
      }, 5000); 
    }
  }, [loaded]);

  if (showSplash || !loaded) {
    return <CustomSplashScreen />;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
        <Stack.Screen name="dictionary" options={{ title: 'Từ Điển', headerShown: true, headerTitleAlign: 'center' }} />
        <Stack.Screen name="translate" options={{ title: 'Camera', headerShown: true, headerTitleAlign: 'center' }} />
        <Stack.Screen name="settings" options={{ title: 'Cài Đặt', headerShown: true, headerTitleAlign: 'center' }} />
        <Stack.Screen name="ipv4_address" options={{ title: 'IPv4 Address', headerShown: true, headerTitleAlign: 'center' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}