import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Prediction {
  gloss: string;
  score: string;
}

interface BaseAPIResponse {
  message?: string;
}

interface UploadAPIResponse extends BaseAPIResponse {
  message: string;
}

interface NormalAPIResponse extends BaseAPIResponse {
  results_merged: Array<{
    start_time: number;
    end_time: number;
    inference_time: number;
    predictions: Array<{
      gloss: string;
      score: number;
    }>;
  }>;
}

interface RealtimeAPIResponse extends BaseAPIResponse {
  predictions?: Array<{
    gloss: string;
    score: number;
  }>;
  buffer_size?: number;
  inference_time?: number;
}

export class TranslationAPI {
  private apiUrl: string | undefined;
  private angleThreshold: string;
  private topK: string;

  constructor() {
    this.angleThreshold = '110';
    this.topK = '3';
    // Initialize apiUrl asynchronously
    this.initializeApiUrl();
  }

  private async initializeApiUrl() {
    try {
      const storedUrl = await AsyncStorage.getItem('api_url');
      this.apiUrl = storedUrl || process.env.EXPO_PUBLIC_API_URL;
      if (!this.apiUrl) {
        console.warn('API URL is not set in AsyncStorage or environment variables');
      }
    } catch (error) {
      console.error('Error loading API URL from AsyncStorage:', error);
      this.apiUrl = process.env.EXPO_PUBLIC_API_URL;
    }
  }

  async callNormalTranslationApi(videoUri: string, rotate: boolean = true): Promise<Prediction[]> {
    if (!this.apiUrl) {
      console.error('API URL is not set');
      return [];
    }

    const url = `${this.apiUrl}/spoter`;

    const formData = new FormData();
    formData.append('video_file', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'video.mp4',
    } as any);
    formData.append('return_type', 'json');
    formData.append('angle_threshold', this.angleThreshold);
    formData.append('top_k', this.topK);
    formData.append('rotate', rotate.toString());

    try {
      const response = await axios.post<NormalAPIResponse>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data.results_merged && response.data.results_merged.length > 0) {
        return response.data.results_merged.map((block) => {
          const topPred = block.predictions[0];
          return {
            gloss: topPred.gloss,
            score: topPred.score.toFixed(2),
          };
        });
      }
      return [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Lỗi API normal (Axios):', error.response?.data || error.message);
      } else {
        console.error('Lỗi không xác định trong API normal:', error);
      }
      throw error;
    }
  }

  async callRealtimeTranslationApi(videoUri: string, clientId: string, rotate: boolean = true): Promise<Prediction | null> {
    if (!this.apiUrl) {
      console.error('API URL is not set');
      return null;
    }

    const url = `${this.apiUrl}/spoter_segmented`;
    console.log(`[Realtime API] Calling API at URL: ${url} with ClientID: ${clientId}`);

    const formData = new FormData();
    formData.append('video_file', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'video.mp4',
    } as any);
    formData.append('clientId', clientId);
    formData.append('angle_threshold', this.angleThreshold);
    formData.append('rotate', rotate.toString());

    try {
      const response = await axios.post<RealtimeAPIResponse>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log(`[Realtime API] ClientID: ${clientId} - Response received:`, JSON.stringify(response.data, null, 2));
      if (response.data.predictions && response.data.predictions.length > 0) {
        const topPred = response.data.predictions[0];
        console.log(`[Realtime API] ClientID: ${clientId} - Prediction found: ${topPred.gloss}`);
        return {
          gloss: topPred.gloss,
          score: topPred.score.toFixed(2),
        };
      }
      console.log(`[Realtime API] ClientID: ${clientId} - No prediction returned from API (Message: ${response.data.message || 'N/A'})`);
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`[Realtime API Error] ClientID: ${clientId} - Axios Error:`, error.response?.data || error.message);
      } else {
        console.error(`[Realtime API Error] ClientID: ${clientId} - Unknown Error:`, error);
      }
      throw error;
    }
  }

  async callUploadApi(videoUri: string, label: string): Promise<string> {
    if (!this.apiUrl) {
      console.error('API URL is not set');
      throw new Error('API URL is not configured');
    }

    const url = `${this.apiUrl}/upload`;
    console.log(`[Upload API] Calling API at URL: ${url} with Label: ${label}`);

    const formData = new FormData();
    formData.append('video_file', {
      uri: videoUri,
      type: 'video/mp4',
      name: 'video.mp4',
    } as any);
    formData.append('label', label);

    try {
      const response = await axios.post<UploadAPIResponse>(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log(`[Upload API] Response received: ${response.data.message}`);
      return response.data.message;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('[Upload API Error] Axios Error:', error.response?.data || error.message);
      } else {
        console.error('[Upload API Error] Unknown Error:', error);
      }
      throw error;
    }
  }
}