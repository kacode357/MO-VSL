import Ionicons from '@expo/vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import * as Speech from 'expo-speech';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import uuid from 'react-native-uuid';
import { Prediction, TranslationAPI } from '../services/TranslationAPI';
import { styles } from '../styles/DictionaryStyles';
import { CameraProps } from '../types/CameraProps';
import MediaPicker from './MediaPicker';
import CameraPermissionHandler from './camera_permission_handler';

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
  const [isTranslating, setIsTranslating] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [videoQuality, setVideoQuality] = useState<string>('720p'); // Default to 720p

  const cameraRef = useRef<CameraView | null>(null);
  const isRealtimeActive = useRef(false);
  const videoQueue = useRef<string[]>([]);
  const isProcessingQueue = useRef(false);
  const clientId = useRef(uuid.v4() as string).current;
  const translationAPI = useRef(new TranslationAPI()).current;

  // Load resolution from AsyncStorage
  useEffect(() => {
    const loadResolution = async () => {
      try {
        const savedResolution = await AsyncStorage.getItem('video_resolution');
        if (savedResolution === '480p' || savedResolution === '720p') {
          setVideoQuality(savedResolution);
        } else {
          // Fallback to 720p if no valid resolution is stored
          await AsyncStorage.setItem('video_resolution', '720p');
          setVideoQuality('720p');
        }
      } catch (error) {
        console.error('Error loading resolution from AsyncStorage:', error);
        // Fallback to 720p on error
        setVideoQuality('720p');
      }
    };
    loadResolution();
  }, []);

  // Check supported resolutions
  useEffect(() => {
    const checkResolutions = async () => {
      if (cameraRef.current && isCameraReady) {
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
  }, [cameraProps.facing, isCameraReady]);

  // Optimize toggle properties
  const toggleProperty = useCallback(
    (prop: keyof CameraProps, option1: CameraProps[keyof CameraProps], option2: CameraProps[keyof CameraProps]) => {
      setCameraProps((current) => ({
        ...current,
        [prop]: current[prop] === option1 ? option2 : option1,
      }));
    },
    []
  );

  // Select the best video quality
  const getBestVideoQuality = useCallback(
    (preferredQuality: string) => {
      // Map common resolution names to expo-camera formats
      const resolutionMap: { [key: string]: string } = {
        '480p': '640x480',
        '720p': '1280x720',
      };
      const targetResolution = resolutionMap[preferredQuality] || preferredQuality;

      if (supportedResolutions.includes(targetResolution)) {
        return preferredQuality;
      }
      console.warn(
        `${preferredQuality} (${targetResolution}) not supported for ${cameraProps.facing} camera. Falling back to available resolution.`
      );
      if (supportedResolutions.includes('1280x720')) return '720p';
      if (supportedResolutions.includes('640x480')) return '480p';
      return '720p'; // Default fallback
    },
    [supportedResolutions, cameraProps.facing]
  );

  // Start recording
  const startRecording = useCallback(() => {
    if (!isCameraReady || !cameraRef.current) {
      console.warn('Camera is not ready or not initialized');
      return;
    }
    setPrediction(null);
    mode === 'normal' ? startRecordingNormal() : startRecordingRealtime();
  }, [mode, isCameraReady]);

  const startRecordingNormal = async () => {
    console.log(`Starting normal recording with ${cameraProps.facing} camera`);
    setIsRecording(true);
    try {
      const selectedQuality = getBestVideoQuality(videoQuality);
      console.log(`Selected video quality: ${selectedQuality}`);
      const video = await cameraRef.current?.recordAsync();
      if (video?.uri) {
        if (mediaLibraryPermission) {
          await saveVideoToMediaLibrary(video.uri);
        }
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

  const startRecordingRealtime = useCallback(() => {
    if (!isCameraReady) return;
    isRealtimeActive.current = true;
    setIsRecording(true);
    recordAndSend();
  }, [isCameraReady]);

  const recordAndSend = useCallback(async () => {
    if (!isRealtimeActive.current || !cameraRef.current) return;

    try {
      const recordPromise = cameraRef.current.recordAsync();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!isRealtimeActive.current) return;

      cameraRef.current.stopRecording();
      const video = await recordPromise;
      if (video?.uri) {
        videoQueue.current.push(video.uri);
        processQueue();
      }
    } catch (error) {
      console.error('Realtime recording error:', error);
    }

    if (isRealtimeActive.current) {
      setTimeout(recordAndSend, 100);
    }
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingQueue.current || videoQueue.current.length === 0) return;
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
  }, [clientId]);

  const stopRecording = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stopRecording();
    }
    setIsRecording(false);
    if (mode === 'realtime') {
      isRealtimeActive.current = false;
      videoQueue.current = [];
      isProcessingQueue.current = false;
    }
  }, [mode]);

  // Save video to media library
  const saveVideoToMediaLibrary = async (uri: string) => {
    try {
      const asset = await MediaLibrary.createAssetAsync(uri);
      const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
      console.log('Saved video:', assetInfo);
    } catch (error) {
      console.error('Error saving video:', error);
    }
  };

  // Handle picked video
  const handleVideoPicked = useCallback(async (uri: string) => {
    setCurrentPredictionIndex(0);
    setPrediction(null);
    try {
      setIsTranslating(true);
      const predictions = await translationAPI.callNormalTranslationApi(uri);
      setPrediction(predictions);
      setIsTranslating(false);
      displayPrediction(predictions);
    } catch (error) {
      console.error('API error:', error);
      setIsTranslating(false);
    }
  }, []);

  // Display prediction
  const displayPrediction = useCallback((predictions: Prediction[]) => {
    if (!predictions?.length) return;
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
  }, []);

  // Read prediction aloud
  const readPredictionAloud = useCallback((predictions: Prediction[]) => {
    const speakNext = (index: number) => {
      if (index >= predictions.length) return;
      const item = predictions[index];
      Speech.speak(`${item.gloss}`, {
        language: 'vi',
        onDone: () => speakNext(index + 1),
      });
    };
    speakNext(0);
  }, []);

  // Toggle mode
  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'normal' ? 'realtime' : 'normal'));
    setPrediction(null);
    setCurrentPredictionIndex(0);
    if (isRecording) {
      stopRecording();
    }
  }, [isRecording, stopRecording]);

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
          videoQuality={videoQuality === '720p' ? '720p' : videoQuality === '480p' ? '480p' : undefined}
          autofocus="on"
          enableTorch={cameraProps.enableTorch}
          onCameraReady={() => setIsCameraReady(true)}
        >
          {isTranslating && mode === 'normal' && (
            <View style={styles.loadingOverlay}>
              <Text style={styles.loadingText}>Đang dịch...</Text>
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
            disabled={!isCameraReady}
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