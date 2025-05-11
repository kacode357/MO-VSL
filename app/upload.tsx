import React, { useState } from 'react';
import {
    TextInput,
    Pressable,
    SafeAreaView,
    ActivityIndicator,
    StyleSheet,
    useColorScheme,
    TouchableWithoutFeedback,
    Keyboard,
    Modal,
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import * as ImagePicker from 'expo-image-picker';
import CameraPermissionHandler from './camera_permission_handler';
import { TranslationAPI } from '../services/TranslationAPI';

const Upload = () => {
    const colorScheme = useColorScheme();
    const [label, setLabel] = useState('');
    const [videoUri, setVideoUri] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [mediaLibraryGranted, setMediaLibraryGranted] = useState(false);
    const [modalType, setModalType] = useState<'error' | 'success' | null>(null);
    const translationApi = new TranslationAPI();

    // Function to pick a video from media library
    const pickVideo = async () => {
        try {
            if (!mediaLibraryGranted) {
                setModalMessage('Cần cấp quyền truy cập thư viện để chọn video.');
                setModalVisible(true);
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setVideoUri(result.assets[0].uri);
            }
        } catch (error) {
            setModalMessage('Không thể chọn video. Vui lòng thử lại.');
            setModalVisible(true);
            console.error('Error picking video:', error);
        }
    };

    // Function to record a video using camera
    const recordVideo = async () => {
        try {
            if (!mediaLibraryGranted) {
                setModalMessage('Cần cấp quyền truy cập camera và micro để quay video.');
                setModalVisible(true);
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: false,
                quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setVideoUri(result.assets[0].uri);
            }
        } catch (error) {
            setModalMessage('Không thể quay video. Vui lòng thử lại.');
            setModalVisible(true);
            console.error('Error recording video:', error);
        }
    };

    // Function to handle video upload
    const handleUpload = async () => {
        if (!videoUri) {
            setModalMessage('Vui lòng chọn hoặc quay một video trước khi tải lên.');
            setModalType('error');
            setModalVisible(true);
            return;
        }
        if (!label.trim()) {
            setModalMessage('Vui lòng nhập nhãn cho video.');
            setModalType('error');
            setModalVisible(true);
            return;
        }

        setIsUploading(true);
        try {
            const responseMessage = await translationApi.callUploadApi(videoUri, label.trim());
            setLabel('');
            setVideoUri(null);
            setModalMessage('Tải lên thành công!');
            setModalType('success');
            setModalVisible(true);
        } catch (error) {
            setModalMessage('Tải video lên thất bại. Vui lòng thử lại.');
            setModalType('error');
            setModalVisible(true);
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    // Dynamic styles based on color scheme
    const dynamicStyles = StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: colorScheme === 'dark' ? '#121212' : '#f5f5f5',
        },
        container: {
            flex: 1,
            padding: 20,
            alignItems: 'center',
            backgroundColor: 'transparent',
        },
        title: {
            fontSize: 28,
            fontWeight: 'bold',
            color: colorScheme === 'dark' ? '#fff' : '#333',
            marginBottom: 20,
            textAlign: 'center',
        },
        formContainer: {
            width: '100%',
            maxWidth: 400,
            alignItems: 'center',
        },
        input: {
            width: '100%',
            borderWidth: 1,
            borderColor: colorScheme === 'dark' ? '#444' : '#ccc',
            borderRadius: 8,
            padding: 12,
            marginBottom: 20,
            backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#fff',
            fontSize: 16,
            color: colorScheme === 'dark' ? '#fff' : '#333',
        },
        inputPlaceholder: {
            color: colorScheme === 'dark' ? '#888' : '#888',
        },
        buttonContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: 15,
        },
        button: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colorScheme === 'dark' ? '#388E3C' : '#4CAF50',
            paddingVertical: 12,
            paddingHorizontal: 10,
            borderRadius: 8,
            justifyContent: 'center',
        },
        buttonPressed: {
            backgroundColor: colorScheme === 'dark' ? '#2E7D32' : '#388E3C',
        },
        buttonSelected: {
            backgroundColor: colorScheme === 'dark' ? '#424242' : '#e0e0e0',
        },
        buttonDisabled: {
            opacity: 0.6,
        },
        buttonText: {
            color: colorScheme === 'dark' ? '#fff' : '#fff',
            fontSize: 16,
            fontWeight: '600',
            textAlign: 'center',
        },
        orContainer: {
            marginHorizontal: 10,
        },
        orText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: colorScheme === 'dark' ? '#fff' : '#333',
        },
        uploadButton: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: colorScheme === 'dark' ? '#388E3C' : '#4CAF50',
            paddingVertical: 12,
            paddingHorizontal: 20,
            borderRadius: 8,
            marginBottom: 15,
            width: '100%',
            justifyContent: 'center',
        },
    });

    // Modal styles
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
            color: 'black',
        },
        customButton: {
            backgroundColor: '#4CAF50',
            borderColor: '#4CAF50',
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

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={dynamicStyles.safeArea}>
                <CameraPermissionHandler
                    onPermissionsGranted={(mediaGranted) => setMediaLibraryGranted(mediaGranted)}
                />
                <ThemedView style={dynamicStyles.container}>
                    <ThemedText type="title" style={dynamicStyles.title}>
                        Tải Video Lên
                    </ThemedText>
                    <ThemedView style={dynamicStyles.formContainer}>
                        <TextInput
                            style={dynamicStyles.input}
                            placeholder="Nhập nhãn video (VD: Đi bộ)"
                            placeholderTextColor={dynamicStyles.inputPlaceholder.color}
                            value={label}
                            onChangeText={setLabel}
                            editable={!isUploading}
                        />
                        <View style={dynamicStyles.buttonContainer}>
                            <Pressable
                                style={({ pressed }) => [
                                    dynamicStyles.button,
                                    pressed && dynamicStyles.buttonPressed,
                                    videoUri && dynamicStyles.buttonSelected,
                                ]}
                                onPress={pickVideo}
                                disabled={isUploading}
                                accessible
                                accessibilityLabel="Chọn video từ thư viện"
                            >
                                <ThemedText style={dynamicStyles.buttonText}>
                                    {videoUri ? 'Video đã chọn' : 'CHỌN VIDEO'}
                                </ThemedText>
                            </Pressable>
                            <View style={dynamicStyles.orContainer}>
                                <ThemedText style={dynamicStyles.orText}>HOẶC</ThemedText>
                            </View>
                            <Pressable
                                style={({ pressed }) => [
                                    dynamicStyles.button,
                                    pressed && dynamicStyles.buttonPressed,
                                    videoUri && dynamicStyles.buttonSelected,
                                ]}
                                onPress={recordVideo}
                                disabled={isUploading}
                                accessible
                                accessibilityLabel="Quay video trực tiếp"
                            >
                                <ThemedText style={dynamicStyles.buttonText}>
                                    {videoUri ? 'Video đã quay' : 'QUAY VIDEO'}
                                </ThemedText>
                            </Pressable>
                        </View>
                        <Pressable
                            style={({ pressed }) => [
                                dynamicStyles.uploadButton,
                                pressed && dynamicStyles.buttonPressed,
                                isUploading && dynamicStyles.buttonDisabled,
                            ]}
                            onPress={handleUpload}
                            disabled={isUploading}
                            accessible
                            accessibilityLabel="Tải video lên"
                        >
                            {isUploading ? (
                                <ActivityIndicator size="small" color={colorScheme === 'dark' ? '#FFD700' : '#FFD700'} />
                            ) : (
                                <ThemedText style={dynamicStyles.buttonText}>TẢI LÊN</ThemedText>
                            )}
                        </Pressable>
                    </ThemedView>
                </ThemedView>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(false);
                        setModalType(null);
                    }}
                >
                    <View style={modalStyles.centeredView}>
                        <View style={modalStyles.modalView}>
                            <TouchableOpacity
                                style={modalStyles.closeButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    setModalType(null);
                                }}
                            >
                                <Text style={{ fontSize: 24, color: modalType === 'success' ? 'white' : '#333' }}>×</Text>
                            </TouchableOpacity>
                            <Text style={modalStyles.modalText}>{modalMessage}</Text>
                            <TouchableOpacity
                                style={modalStyles.customButton}
                                onPress={() => {
                                    setModalVisible(false);
                                    setModalType(null);
                                }}
                            >
                                <Text style={modalStyles.buttonText}>Đóng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

export default Upload;