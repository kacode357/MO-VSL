import React, { useEffect, useState } from 'react';
import { Text, View, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface OfflineCameraPermissionHandlerProps {
  onPermissionsGranted: (mediaLibraryGranted: boolean) => void;
}

const OfflineCameraPermissionHandler: React.FC<OfflineCameraPermissionHandlerProps> = ({
  onPermissionsGranted,
}) => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const requestPermissions = async () => {
    if (!cameraPermission?.granted) {
      const { status: cameraStatus } = await requestCameraPermission();
      if (cameraStatus !== 'granted') {
        setModalVisible(true);
        onPermissionsGranted(false);
        return;
      }
    }

    if (!microphonePermission?.granted) {
      const { status: audioStatus } = await requestMicrophonePermission();
      if (audioStatus !== 'granted') {
        setModalVisible(true);
        onPermissionsGranted(false);
        return;
      }
    }

    const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
    if (mediaStatus !== 'granted') {
      setModalVisible(true);
    }

    onPermissionsGranted(mediaStatus === 'granted');
  };

  useEffect(() => {
    if (!cameraPermission || !microphonePermission) {
      requestPermissions();
    } else if (cameraPermission.granted && microphonePermission.granted) {
      MediaLibrary.requestPermissionsAsync().then(({ status }) => {
        onPermissionsGranted(status === 'granted');
      });
    } else {
      setModalVisible(true);
    }
  }, [cameraPermission, microphonePermission]);

  if (!cameraPermission || !microphonePermission) {
    return <View />;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => {
        setModalVisible(false);
        router.back();
      }}
    >
      <View style={modalStyles.centeredView}>
        <View style={modalStyles.modalView}>
          <TouchableOpacity
            style={modalStyles.closeButton}
            onPress={() => {
              setModalVisible(false);
              router.back();
            }}
          >
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={modalStyles.modalText}>
            Cần quyền để hiển thị camera và âm thanh
          </Text>
          <TouchableOpacity
            style={modalStyles.customButton}
            onPress={() => {
              setModalVisible(false);
              requestPermissions();
            }}
          >
            <Text style={modalStyles.buttonText}>Cấp quyền</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
    position: 'relative',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  customButton: {
    backgroundColor: '#4CAF50',
    borderColor: 'white',
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    right: 1,
    padding: 2,
  },
});

export default OfflineCameraPermissionHandler;