import React, { useState, useRef, useEffect } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CameraView } from 'expo-camera';
import * as Speech from 'expo-speech';
import * as MediaLibrary from 'expo-media-library';
import Ionicons from '@expo/vector-icons/Ionicons';
import MediaPicker from './MediaPicker';
import CameraPermissionHandler from './camera_permission_handler_offline';
import { CameraProps } from '../types/CameraProps';
import { styles } from '../styles/DictionaryStyles';

const OfflineTranslateScreen = () => {
  const [cameraProps, setCameraProps] = useState<CameraProps>({
    facing: 'back',
    flash: 'off',
    enableTorch: false,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(false);
  const [prediction, setPrediction] = useState<any[] | null>(null);
  const [currentPredictionIndex, setCurrentPredictionIndex] = useState(0);
  const [supportedResolutions, setSupportedResolutions] = useState<string[]>([]);

  const cameraRef = useRef<CameraView | null>(null);

  // Check supported resolutions on mount
  useEffect(() => {
    const checkResolutions = async () => {
      if (cameraRef.current) {
        try {
          const sizes = await cameraRef.current.getAvailablePictureSizesAsync();
          setSupportedResolutions(sizes);
          console.log('Supported resolutions:', sizes);
        } catch (error) {
          console.error('Error checking resolutions:', error);
        }
      }
    };
    checkResolutions();
  }, []);

  // Utility function to toggle camera properties
  const toggleProperty = (
    prop: keyof CameraProps,
    option1: CameraProps[keyof CameraProps],
    option2: CameraProps[keyof CameraProps]
  ) => {
    setCameraProps((current) => ({
      ...current,
      [prop]: current[prop] === option1 ? option2 : option1,
    }));
  };

  // Handle video recording
  const startRecording = async () => {
    console.log('Starting offline recording');
    setPrediction(null);
    setIsRecording(true);
    try {
      const video = await cameraRef.current?.recordAsync();
      if (video) {
        await saveVideoToMediaLibrary(video.uri);
        // Placeholder: Offline translation logic to be implemented
        console.log('Offline translation not implemented');
      }
    } catch (error) {
      console.error('Offline recording error:', error);
    }
    setIsRecording(false);
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
    setIsRecording(false);
  };

  // Handle media
  const saveVideoToMediaLibrary = async (uri: string) => {
    if (!mediaLibraryPermission) return;
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      console.log('Saved video:', assetInfo);
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  const handleVideoPicked = async (uri: string) => {
    setCurrentPredictionIndex(0);
    setPrediction(null);
    // Placeholder: Offline translation logic to be implemented
    console.log('Offline translation not implemented');
  };

  // Handle predictions
  const displayPrediction = (predictions: any[]) => {
    let index = 0;
    const intervalId = setInterval(() => {
      if (index < predictions.length) {
        setCurrentPredictionIndex(index);
        readPredictionAloud([predictions[index]]);
        index++;
      } else {
        clearInterval(intervalId);
      }
    }, 2000);
  };

  const readPredictionAloud = (predictions: any[]) => {
    console.log('Reading predictions:', predictions);
    const speakNext = (index: number) => {
      if (index >= predictions.length) return;
      const item = predictions[index];
      Speech.speak(`${item.gloss || 'No prediction'}`, {
        language: 'vi',
        onDone: () => speakNext(index + 1),
      });
    };
    speakNext(0);
  };

  // Determine video quality
  const videoQuality = supportedResolutions.includes('1280x720') ? '720p' : '1080p';

  return (
    <>
      <CameraPermissionHandler
        onPermissionsGranted={(mediaGranted) => setMediaLibraryPermission(mediaGranted)}
      />
      <View style={styles.container}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraProps.facing}
          mode="video"
          flash={cameraProps.flash}
          videoQuality={videoQuality}
          autofocus="on"
          enableTorch={cameraProps.enableTorch}
        >
          <TouchableOpacity
            style={[styles.iconButton, styles.topLeft]}
            onPress={() => toggleProperty('facing', 'back', 'front')}
          >
            <Ionicons name="camera-reverse" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, styles.topRight]}
            onPress={() => toggleProperty('enableTorch', true, false)}
          >
            <Ionicons name="flash" size={24} color={cameraProps.enableTorch ? '#FFD700' : '#fff'} />
          </TouchableOpacity>
          <View style={styles.bottomLeft}>
            <MediaPicker onVideoPicked={handleVideoPicked} />
          </View>
          <TouchableOpacity
            style={[styles.recordButton, styles.centerBottom, isRecording && styles.recordingButton]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <Ionicons name={isRecording ? 'stop' : 'videocam'} size={30} color="#fff" />
          </TouchableOpacity>
        </CameraView>
        {prediction && prediction.length > 0 && (
          <View style={styles.predictionContainer}>
            <Text style={styles.predictionText}>
              {prediction[currentPredictionIndex].gloss || 'No prediction'}: {prediction[currentPredictionIndex].score || 'N/A'}
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

export default OfflineTranslateScreen;