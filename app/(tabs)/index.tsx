import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, SafeAreaView, View } from 'react-native';
import { styles } from '../../styles/HomeStyles';

export default function HomeScreen() {
  const router = useRouter();
  const [internetStatus, setInternetStatus] = useState('Checking...');

  useEffect(() => {
    const getInternetStatus = async () => {
      try {
        const status = await AsyncStorage.getItem('internet_status');
        setInternetStatus(status === 'connected' ? 'Có mạng' : 'Không có mạng');
      } catch (error) {
        console.error('Error retrieving internet status:', error);
        setInternetStatus('Không có mạng');
      }
    };
    getInternetStatus();
  }, []);

  const hour = new Date().getHours();
  let greeting: string;
  if (hour >= 5 && hour < 11) {
    greeting = 'Xin chào buổi sáng!';
  } else if (hour >= 11 && hour < 14) {
    greeting = 'Xin chào buổi trưa!';
  } else if (hour >= 14 && hour < 18) {
    greeting = 'Xin chào buổi chiều!';
  } else {
    greeting = 'Xin chào buổi tối!';
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Thủ ngữ (Ngôn ngữ kí hiệu)
          </ThemedText>
          <ThemedText style={styles.greetingText}>{greeting}</ThemedText>
          <ThemedText style={styles.internetStatus}>
            Trạng thái mạng: {internetStatus}
          </ThemedText>
          <ThemedView style={styles.imageContainer}>
            <Image
              source={require('../../assets/images/picture_1.png')}
              style={styles.image}
              resizeMode="contain"
            />
          </ThemedView>
        </ThemedView>
        <ThemedView style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.push('/dictionary')}
            accessible
            accessibilityLabel="Mở từ điển ngôn ngữ ký hiệu"
            hitSlop={10}
          >
            <Ionicons name="book-outline" size={24} color="#FFD700" style={styles.icon} />
            <ThemedText style={styles.buttonText}>TỪ ĐIỂN</ThemedText>
          </Pressable>
          {internetStatus === 'Có mạng' && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push('/translate')}
              accessible
              accessibilityLabel="Dịch ngôn ngữ ký hiệu bằng camera"
              hitSlop={10}
            >
              <Ionicons name="camera-outline" size={24} color="#FFD700" style={styles.icon} />
              <ThemedText style={styles.buttonText}>DỊCH CAMERA</ThemedText>
            </Pressable>
          )}
          {internetStatus === 'Không có mạng' && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => router.push('/offline_translate')}
              accessible
              accessibilityLabel="Dịch ngôn ngữ ký hiệu offline"
              hitSlop={10}
            >
              <Ionicons name="cloud-offline-outline" size={24} color="#FFD700" style={styles.icon} />
              <ThemedText style={styles.buttonText}>DỊCH OFFLINE</ThemedText>
            </Pressable>
          )}
        </ThemedView>
        {/* Thay biểu tượng tải lên thành settings */}
        <Pressable
          style={({ pressed }) => [
            styles.uploadIconContainer,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/settings')} // Chuyển hướng tới settings
          accessible
          accessibilityLabel="Mở cài đặt ứng dụng"
          hitSlop={10}
        >
          <Ionicons name="settings-outline" size={30} color="#FFD700" />
        </Pressable>
        <View style={styles.versionContainer}>
          <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}