import React, { useState, useRef, useEffect } from 'react';
import { Text, TouchableOpacity, View, Platform } from 'react-native';
import { CameraView } from 'expo-camera';
import * as Speech from 'expo-speech';
import * as MediaLibrary from 'expo-media-library';
import Ionicons from '@expo/vector-icons/Ionicons';
import uuid from 'react-native-uuid';
import { TranslationAPI, Prediction } from '../services/TranslationAPI';
import MediaPicker from './MediaPicker';
import CameraPermissionHandler from './camera_permission_handler';
import { CameraProps } from '../types/CameraProps';
import { styles } from '../styles/DictionaryStyles';

const DictionaryScreen = () => {
  const [cameraProps, setCameraProps] = useState<CameraProps>({
    facing: 'back',
    flash: 'off',
    enableTorch: false,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [mediaLibraryPermission, setMediaLibraryPermission] = useState(false);
  const [mode, setMode] = useState<'normal' | 'realtime'>('normal');
  const [prediction, setPrediction] = useState<Prediction[] | null>(null);
  const [currentPredictionIndex, setCurrentPredictionIndex] = useState(0);
  const [supportedResolutions, setSupportedResolutions] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false); // New state for loading

  const cameraRef = useRef<CameraView | null>(null);
  const isRealtimeActive = useRef(false);
  const videoQueue = useRef<string[]>([]);
  const isProcessingQueue = useRef(false);
  const clientId = uuid.v4();
  const translationAPI = useRef(new TranslationAPI()).current;

  // Check supported resolutions on mount
  useEffect(() => {
    const checkResolutions = async () => {
      if (cameraRef.current) {
        try {
          const sizes = await cameraRef.current.getAvailablePictureSizesAsync();
          setSupportedResolutions(sizes);
          console.log(`Supported resolutions for ${cameraProps.facing} camera:`, sizes);
        } catch (error) {
          console.error('Error checking resolutions:', error);
        }
      }
    };
    checkResolutions();
  }, [cameraProps.facing]);

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
  const startRecording = () => {
    setPrediction(null);
    void (mode === 'normal' ? startRecordingNormal() : startRecordingRealtime());
  };
  const getBestVideoQuality = (preferredQuality: string) => {
    const supportedQualities = ['480p', '720p', '1080p']; // Known quality options
    if (supportedResolutions.includes(preferredQuality)) {
      return preferredQuality;
    }
    console.warn(
      `${preferredQuality} not supported for ${cameraProps.facing} camera. Falling back to available resolution.`
    );
    // Fallback to 720p if available, otherwise use 480p or 1080p
    if (supportedResolutions.includes('1280x720')) return '720p';
    if (supportedResolutions.includes('640x480')) return '480p';
    return '1080p'; // Default fallback
  };
  const startRecordingNormal = async () => {
    console.log(`Starting normal recording with ${cameraProps.facing} camera`);
    setIsRecording(true);
    try {
      const selectedQuality = getBestVideoQuality('720p');
      console.log(`Selected video quality: ${selectedQuality}`);
      const video = await cameraRef.current?.recordAsync();
      if (video) {
        await saveVideoToMediaLibrary(video.uri);
        setIsTranslating(true);
        const predictions = await translationAPI.callNormalTranslationApi(video.uri);
        setPrediction(predictions);
        setIsTranslating(false);
        displayPrediction(predictions);
      }
    } catch (error) {
      console.error('Normal recording error:', error);
      setIsTranslating(false);
    }
    setIsRecording(false);
  };
  const startRecordingRealtime = () => {
    isRealtimeActive.current = true;
    setIsRecording(true);
    recordAndSend();
  };

  const recordAndSend = async () => {
    if (!isRealtimeActive.current) return;

    try {
      const recordPromise = cameraRef.current?.recordAsync();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!isRealtimeActive.current) return;

      cameraRef.current?.stopRecording();
      const video = await recordPromise;
      if (video) {
        videoQueue.current.push(video.uri);
        processQueue();
      }
    } catch (error) {
      console.error('Recording error:', error);
    }

    if (isRealtimeActive.current) recordAndSend();
  };

  const processQueue = async () => {
    if (isProcessingQueue.current) return;
    isProcessingQueue.current = true;

    while (videoQueue.current.length > 0) {
      const uri = videoQueue.current.shift();
      if (!uri) continue;

      try {
        const pred = await translationAPI.callRealtimeTranslationApi(uri, clientId);
        if (pred) {
          setPrediction([pred]);
          setCurrentPredictionIndex(0);
          readPredictionAloud([pred]);
        }
      } catch (error) {
        console.error('Video processing error:', error);
      }
    }
    isProcessingQueue.current = false;
  };

  const stopRecording = () => {
    cameraRef.current?.stopRecording();
    setIsRecording(false);
    if (mode === 'realtime') {
      isRealtimeActive.current = false;
      videoQueue.current = [];
    }
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
    try {
      setIsTranslating(true); // Set translating state
      const predictions = await translationAPI.callNormalTranslationApi(uri);
      setPrediction(predictions);
      setIsTranslating(false); // Clear translating state
      displayPrediction(predictions);
    } catch (error) {
      console.error('API error:', error);
      setIsTranslating(false); // Clear translating state on error
    }
  };

  // Handle predictions
  const displayPrediction = (predictions: Prediction[]) => {
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

  const readPredictionAloud = (predictions: Prediction[]) => {
    console.log('Reading predictions:', predictions);
    const speakNext = (index: number) => {
      if (index >= predictions.length) return;
      const item = predictions[index];
      Speech.speak(`${item.gloss}`, {
        language: 'vi',
        onDone: () => speakNext(index + 1),
      });
    };
    speakNext(0);
  };

  // Toggle mode
  const toggleMode = () => {
    const newMode = mode === 'normal' ? 'realtime' : 'normal';
    setMode(newMode);
    console.log(`Switched to ${newMode} mode`);
  };

  // Determine video quality
  const videoQuality = supportedResolutions.includes('640x480') ? '480p' : '720p';

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
          {/* Loading overlay for normal mode */}
          {isTranslating && mode === 'normal' && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Đang dịch ... </Text>
            </View>
          )}
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
        <TouchableOpacity style={styles.modeButton} onPress={toggleMode}>
          <Text style={styles.modeText}>
            {mode === 'normal' ? 'Switch to Realtime' : 'Switch to Normal'}
          </Text>
        </TouchableOpacity>
        {prediction && prediction.length > 0 && !isTranslating && (
          <View style={styles.predictionContainer}>
            <Text style={styles.predictionText}>
              {prediction[currentPredictionIndex].gloss}: {prediction[currentPredictionIndex].score}
            </Text>
          </View>
        )}
      </View>
    </>
  );
};

export default DictionaryScreen;