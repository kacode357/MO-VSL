import { useColorScheme } from '@/hooks/useColorScheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
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
const statusBarStyle = colorScheme === 'dark' ? 'light' : 'dark';
  const statusBarBackgroundColor = colorScheme === 'dark' ? '#000' : '#fff';
  const safeAreaBackgroundColor = colorScheme === 'dark' ? '#000' : '#fff';

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SafeAreaView style={{ flex: 1, backgroundColor: safeAreaBackgroundColor }}>
        <StatusBar
          style={statusBarStyle}
          backgroundColor={statusBarBackgroundColor}
        />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'Home' }} />
          <Stack.Screen name="dictionary" options={{ title: 'Từ Điển', headerShown: true, headerTitleAlign: 'center' }} />
          <Stack.Screen name="translate" options={{ title: 'Camera', headerShown: true, headerTitleAlign: 'center' }} />
          <Stack.Screen name="settings" options={{ title: 'Cài Đặt', headerShown: true, headerTitleAlign: 'center' }} />
          <Stack.Screen name="ipv4_address" options={{ title: 'IPv4 Address', headerShown: true, headerTitleAlign: 'center' }} />
          <Stack.Screen name="upload" options={{ title: 'Đóng góp dữ liệu', headerShown: true, headerTitleAlign: 'center' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </SafeAreaView>
    </ThemeProvider>
  );
}