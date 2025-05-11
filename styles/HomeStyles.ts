import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  header: {
    alignItems: 'center',
    gap: 16,
    marginTop: -50,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: '#42815a',
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    gap: 12,
  },
  image: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A3C2F',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  buttonContainer: {
    gap: 16,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#42815a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    width: width * 0.8,
    justifyContent: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: 8,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#666',
  },
  internetStatus: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FF4500',
  },
  // Cập nhật style cho biểu tượng tải lên
  uploadIconContainer: {
    position: 'absolute',
    bottom: 50, // Đặt ở góc dưới
    right: 20,  // Giữ góc phải
    backgroundColor: '#42815a',
    borderRadius: 50,
    padding: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});