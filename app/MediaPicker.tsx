import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';

interface MediaPickerProps {
  onVideoPicked: (uri: string) => void;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ onVideoPicked }) => {
  const openImagePicker = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (granted) {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 1,
        allowsEditing: false,
      });

      if (!result.canceled) {
        const uri = result.assets[0]?.uri;
        if (uri) {
          onVideoPicked(uri);
        }
      }
    } else {
      console.log('Permission to access media library not granted');
    }
  };

  return (
    <TouchableOpacity style={styles.iconButton} onPress={openImagePicker}>
      <Ionicons
        name="images"
        size={24}
        color="#fff"
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    backgroundColor: '#000', // Changed to black
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default MediaPicker;