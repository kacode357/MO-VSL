import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const IPv4Address = () => {
  const [ipAddress, setIpAddress] = useState('');
  const [savedIp, setSavedIp] = useState('');
  const colorScheme = useColorScheme(); // Detect light or dark theme

  // Define theme-based colors for high contrast
  const themeStyles = {
    backgroundColor: colorScheme === 'dark' ? '#000000' : '#FFFFFF', // Black in dark mode, white in light mode
    textColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000', // White in dark mode, black in light mode
    placeholderColor: colorScheme === 'dark' ? '#AAAAAA' : '#666666', // Light gray in dark mode, dark gray in light mode
    borderColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000', // White in dark mode, black in light mode
    buttonBackground: colorScheme === 'dark' ? '#4CAF50' : '#4CAF50', // Keep green button for consistency
    buttonTextColor: '#FFFFFF', // White button text for contrast
    noteColor: colorScheme === 'dark' ? '#BBBBBB' : '#666666', // Light gray in dark mode, dark gray in light mode
    trashIconColor: '#FF4444', // Keep red for delete icon for visibility
  };

  // Load saved IP address from AsyncStorage on mount
  useEffect(() => {
    const loadIpAddress = async () => {
      const storedIp = await AsyncStorage.getItem('ipv4_address');
      if (storedIp) {
        setIpAddress(storedIp);
        setSavedIp(storedIp);
      }
    };
    loadIpAddress();
  }, []);

  // Save IP address to AsyncStorage and update displayed IP
  const saveIpAddress = async () => {
    // Replace commas with periods
    const normalizedIp = ipAddress.replace(/,/g, '.');
    await AsyncStorage.setItem('ipv4_address', normalizedIp);
    setIpAddress(normalizedIp); // Update input to reflect saved value
    setSavedIp(normalizedIp);
  };

  // Delete IP address from AsyncStorage and reset states
  const deleteIpAddress = async () => {
    await AsyncStorage.removeItem('ipv4_address');
    setIpAddress('');
    setSavedIp('');
  };

  return (
    <View style={[styles.container, { backgroundColor: themeStyles.backgroundColor }]}>
      <Text style={[styles.label, { color: themeStyles.textColor }]}>IPv4 Address</Text>
      <TextInput
        style={[styles.input, { borderColor: themeStyles.borderColor, color: themeStyles.textColor }]}
        value={ipAddress}
        onChangeText={setIpAddress}
        placeholder="Enter IPv4 Address (e.g., 192.168.1.1)"
        placeholderTextColor={themeStyles.placeholderColor}
        keyboardType="numeric"
        autoCapitalize="none"
      />
      <Text style={[styles.note, { color: themeStyles.noteColor }]}>
        Lưu ý: Nếu nhập dấu phẩy (,) sẽ được chuyển thành dấu chấm (.) khi lưu.
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: themeStyles.buttonBackground }]}
        onPress={saveIpAddress}
      >
        <Text style={[styles.buttonText, { color: themeStyles.buttonTextColor }]}>Lưu</Text>
      </TouchableOpacity>
      {savedIp ? (
        <View style={styles.savedIpContainer}>
          <Text style={[styles.savedIp, { color: themeStyles.textColor }]}>IPv4 Hiện tại: {savedIp}</Text>
          <TouchableOpacity onPress={deleteIpAddress}>
            <Ionicons name="trash-outline" size={24} color={themeStyles.trashIconColor} />
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  note: {
    fontSize: 14,
    marginBottom: 20,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  savedIpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  savedIp: {
    fontSize: 16,
  },
});

export default IPv4Address;