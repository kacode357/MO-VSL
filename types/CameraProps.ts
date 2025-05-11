import { CameraType } from 'expo-camera';

export interface CameraProps {
  facing: CameraType;
  flash: 'on' | 'off';
  enableTorch: boolean;
}