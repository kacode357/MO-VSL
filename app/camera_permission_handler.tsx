import React, { useEffect, useState } from 'react';
import { Text, View, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface CameraPermissionHandlerProps {
  onPermissionsGranted: (allPermissionsGranted: boolean) => void;
}

const CameraPermissionHandler: React.FC<CameraPermissionHandlerProps> = ({
  onPermissionsGranted,
}) => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] = useMicrophonePermissions();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const router = useRouter();

  // Hàm yêu cầu tất cả quyền cần thiết
  const requestAllPermissions = async () => {
    try {
      // Kiểm tra và yêu cầu quyền camera
      if (!cameraPermission?.granted) {
        const { status } = await requestCameraPermission();
        if (status !== 'granted') {
          setModalMessage('Cần quyền camera để tiếp tục.');
          setModalVisible(true);
          onPermissionsGranted(false);
          return false;
        }
      }

      // Kiểm tra và yêu cầu quyền microphone
      if (!microphonePermission?.granted) {
        const { status } = await requestMicrophonePermission();
        if (status !== 'granted') {
          setModalMessage('Cần quyền microphone để tiếp tục.');
          setModalVisible(true);
          onPermissionsGranted(false);
          return false;
        }
      }

      // Kiểm tra và yêu cầu quyền thư viện media
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        setModalMessage('Cần quyền truy cập thư viện media để tiếp tục.');
        setModalVisible(true);
        onPermissionsGranted(false);
        return false;
      }

      // Tất cả quyền được cấp
      setModalVisible(false);
      onPermissionsGranted(true);
      return true;
    } catch (error) {
      console.error('Lỗi khi yêu cầu quyền:', error);
      setModalMessage('Đã xảy ra lỗi khi yêu cầu quyền. Vui lòng thử lại.');
      setModalVisible(true);
      onPermissionsGranted(false);
      return false;
    }
  };

  // Kiểm tra quyền khi component mount
  useEffect(() => {
    if (!cameraPermission || !microphonePermission) {
      // Đợi thông tin quyền được tải
      return;
    }

    if (cameraPermission.granted && microphonePermission.granted) {
      // Kiểm tra quyền media nếu camera và mic đã được cấp
      MediaLibrary.getPermissionsAsync().then(({ status }) => {
        if (status === 'granted') {
          onPermissionsGranted(true);
        } else {
          requestAllPermissions();
        }
      });
    } else {
      requestAllPermissions();
    }
  }, [cameraPermission, microphonePermission]);

  // Hiển thị loading khi đang chờ thông tin quyền
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
          <Text style={modalStyles.modalText}>{modalMessage || 'Cần cấp quyền để sử dụng camera và âm thanh.'}</Text>
          <TouchableOpacity
            style={modalStyles.customButton}
            onPress={requestAllPermissions}
          >
            <Text style={modalStyles.buttonText}>Thử lại</Text>
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
    top: 10,
    right: 10,
    padding: 5,
  },
});

export default CameraPermissionHandler;