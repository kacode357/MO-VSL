import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  message: { textAlign: 'center', padding: 20, color: '#fff', fontSize: 16 },
  camera: { flex: 1, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' }, // Changed to black
  iconButton: {
    backgroundColor: '#000', // Changed to black
    padding: 10,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  topLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  topRight: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 40,
    left: 20,
  },
  centerBottom: {
    position: 'absolute',
    bottom: 40,
    left: '50%',
    transform: [{ translateX: -35 }],
  },
  recordButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingButton: {
    backgroundColor: '#F44336',
  },
  modeButton: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
    backgroundColor: '#000', // Changed to black
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  modeText: { color: '#fff', fontSize: 14, fontWeight: '900' },
  predictionContainer: {
    position: 'absolute',
    bottom: 120,
    left: 20,
    right: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  predictionText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600', 
    textAlign: 'center', 
    lineHeight: 22 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
    textAlign: 'center',
  },
});