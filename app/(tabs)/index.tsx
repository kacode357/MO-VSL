import { Pressable, Image, SafeAreaView, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../styles/HomeStyles';
import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
        {/* Thêm biểu tượng tải lên ở góc phải */}
        <Pressable
          style={({ pressed }) => [
            styles.uploadIconContainer,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/upload')}
          accessible
          accessibilityLabel="Tải video ngôn ngữ ký hiệu lên"
          hitSlop={10}
        >
          <Ionicons name="cloud-upload-outline" size={30} color="#FFD700" />
        </Pressable>
        <View style={styles.versionContainer}>
          <ThemedText style={styles.versionText}>Version 1.0.0</ThemedText>
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}