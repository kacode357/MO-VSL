import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useColorScheme } from '@/hooks/useColorScheme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, TextInput } from 'react-native';

const Settings = () => {
  const [apiUrl, setApiUrl] = useState<string>('');
  const [resolution, setResolution] = useState<'480p' | '720p'>('720p');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  // Embedded theme colors
  const themeColors = {
    light: {
      background: '#fff',
      text: '#000',
      border: '#ccc',
      inputBackground: '#f5f5f5',
      placeholder: '#999',
      primary: '#007AFF', // Blue for buttons
      secondary: '#28A745', // Green for contribute button
      buttonBackground: '#f5f5f5', // Default button background
      disabled: '#ccc',
    },
    dark: {
      background: '#000',
      text: '#fff',
      border: '#444',
      inputBackground: '#222',
      placeholder: '#888',
      primary: '#0A84FF', // Lighter blue for dark mode
      secondary: '#34C759', // Lighter green for dark mode
      buttonBackground: '#333',
      disabled: '#555',
    },
  };

  // Select colors based on theme
  const colors = themeColors[colorScheme ?? 'light'];

  // Load API URL and resolution from AsyncStorage on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedUrl = await AsyncStorage.getItem('api_url');
        setApiUrl(storedUrl || process.env.EXPO_PUBLIC_API_URL || 'Not set');

        const storedResolution = await AsyncStorage.getItem('video_resolution');
        if (storedResolution === '480p' || storedResolution === '720p') {
          setResolution(storedResolution);
        } else {
          await AsyncStorage.setItem('video_resolution', '720p');
          setResolution('720p');
        }
      } catch (error) {
        console.error('Error loading settings:', error);
        Alert.alert('Error', 'Không thể tải cài đặt. Vui lòng thử lại.');
      }
    };
    loadSettings();
  }, []);

  // Save API URL to AsyncStorage
  const saveApiUrl = async () => {
    if (isSaving) return;
    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
      Alert.alert('Error', 'API URL phải bắt đầu bằng http:// hoặc https://');
      return;
    }
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('api_url', apiUrl);
      Alert.alert('Success', 'API URL đã được lưu thành công');
    } catch (error) {
      console.error('Error saving API URL:', error);
      Alert.alert('Error', 'Không thể lưu API URL');
    } finally {
      setIsSaving(false);
    }
  };

  // Save resolution to AsyncStorage
  const saveResolution = async (newResolution: '480p' | '720p') => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await AsyncStorage.setItem('video_resolution', newResolution);
      setResolution(newResolution);
      Alert.alert('Success', `Đã chọn độ phân giải ${newResolution}`);
    } catch (error) {
      console.error('Error saving resolution:', error);
      Alert.alert('Error', 'Không thể lưu độ phân giải');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Cài đặt</ThemedText>

        {/* API URL Section */}
        <ThemedText style={styles.label}>API URL (IP hiện tại):</ThemedText>
        <TextInput
          style={[styles.input, { borderColor: colors.border, backgroundColor: colors.inputBackground, color: colors.text }]}
          value={apiUrl}
          onChangeText={setApiUrl}
          placeholder="Nhập API URL (e.g., http://192.168.1.100:8000)"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="none"
          keyboardType="url"
          editable={!isSaving}
        />
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: isSaving ? colors.disabled : colors.primary },
            pressed && styles.buttonPressed,
          ]}
          onPress={saveApiUrl}
          accessible
          accessibilityLabel="Lưu API URL"
          disabled={isSaving}
        >
          <ThemedText style={styles.buttonText}>
            {isSaving ? 'Đang lưu...' : 'Lưu'}
          </ThemedText>
        </Pressable>

        {/* Resolution Selection Section */}
        <ThemedText style={styles.label}>Độ phân giải video:</ThemedText>
        <ThemedView style={styles.resolutionContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.resolutionButton,
              {
                backgroundColor: resolution === '480p' ? colors.primary : colors.buttonBackground,
                borderColor: colors.border,
              },
              pressed && styles.buttonPressed,
              isSaving && { backgroundColor: colors.disabled },
            ]}
            onPress={() => saveResolution('480p')}
            accessible
            accessibilityLabel="Chọn độ phân giải 480p"
            disabled={isSaving}
          >
            <ThemedText
              style={[
                styles.resolutionButtonText,
                { color: resolution === '480p' ? '#fff' : colors.text },
                resolution === '480p' && styles.resolutionButtonTextSelected,
              ]}
            >
              480p
            </ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.resolutionButton,
              {
                backgroundColor: resolution === '720p' ? colors.primary : colors.buttonBackground,
                borderColor: colors.border,
              },
              pressed && styles.buttonPressed,
              isSaving && { backgroundColor: colors.disabled },
            ]}
            onPress={() => saveResolution('720p')}
            accessible
            accessibilityLabel="Chọn độ phân giải 720p"
            disabled={isSaving}
          >
            <ThemedText
              style={[
                styles.resolutionButtonText,
                { color: resolution === '720p' ? '#fff' : colors.text },
                resolution === '720p' && styles.resolutionButtonTextSelected,
              ]}
            >
              720p
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Contribute Button */}
        <Pressable
          style={({ pressed }) => [
            styles.contributeButton,
            { backgroundColor: isSaving ? colors.disabled : colors.secondary },
            pressed && styles.buttonPressed,
          ]}
          onPress={() => router.push('/upload')}
          accessible
          accessibilityLabel="Đóng góp dữ liệu"
          disabled={isSaving}
        >
          <ThemedText style={styles.buttonText}>Đóng góp dữ liệu</ThemedText>
        </Pressable>
      </ThemedView>
    </SafeAreaView>
  );
};

// Embedded styles
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  resolutionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resolutionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  resolutionButtonText: {
    fontSize: 16,
  },
  resolutionButtonTextSelected: {
    fontWeight: 'bold',
  },
  contributeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Settings;