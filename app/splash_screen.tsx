import React from 'react';
import { View, Text, Image, StyleSheet, Animated, Alert, SafeAreaView, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export default function CustomSplashScreen() {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Check internet connectivity and store status
    const checkInternetConnection = async () => {
      try {
        const state = await NetInfo.fetch();
        const isConnected = state.isConnected;
        await AsyncStorage.setItem('internet_status', isConnected ? 'connected' : 'disconnected');

        if (!isConnected) {
          Alert.alert('No Internet', 'Please check your internet connection.');
        }
      } catch (error) {
        console.error('Error checking internet:', error);
        await AsyncStorage.setItem('internet_status', 'disconnected');
      }
    };

    // Remove ipv4_address from AsyncStorage
    const clearIpAddress = async () => {
      try {
        await AsyncStorage.removeItem('ipv4_address');
      } catch (error) {
        console.error('Error removing IP address:', error);
      }
    };

    checkInternetConnection();
    clearIpAddress();

    // Start fade animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Image
          source={require('../assets/images/logo_1.png')}
          style={styles.logo}
        />
        <Text style={styles.text}>Ứng dụng thủ ngữ</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  text: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 30,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
});