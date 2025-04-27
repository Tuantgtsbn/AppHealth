import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const ProfileScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy thông tin người dùng');
      }
    } catch (error) {
      console.error('Lỗi khi tải hồ sơ người dùng:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4757" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hồ sơ cá nhân</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userData?.name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={styles.userName}>{userData?.name || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{userData?.email || ''}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="heart" size={24} color="#FF4757" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngưỡng nhịp tim</Text>
              <Text style={styles.infoValue}>
                {userData?.heartRateThreshold ? 
                  `${userData.heartRateThreshold.min} - ${userData.heartRateThreshold.max} bpm` : 
                  '60 - 100 bpm'}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Ionicons name="water" size={24} color="#2E86DE" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngưỡng SpO2</Text>
              <Text style={styles.infoValue}>
                {userData?.spo2Threshold ? 
                  `Tối thiểu ${userData.spo2Threshold.min}%` : 
                  'Tối thiểu 95%'}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.infoRow}>
            <Ionicons name="mail" size={24} color="#FF9800" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Liên hệ khẩn cấp</Text>
              <Text style={styles.infoValue}>
                {userData?.emergencyContact || 'Chưa thiết lập'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.notificationCard}>
          <Text style={styles.cardTitle}>Cài đặt thông báo</Text>

          <View style={styles.notificationRow}>
            <Ionicons name="mail-outline" size={20} color="#333" style={styles.notificationIcon} />
            <Text style={styles.notificationText}>Thông báo qua email</Text>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: userData?.emailNotifications ? '#4CD964' : '#FF3B30' }
            ]} />
          </View>

          <View style={styles.notificationRow}>
            <Ionicons name="volume-high-outline" size={20} color="#333" style={styles.notificationIcon} />
            <Text style={styles.notificationText}>Âm thanh cảnh báo</Text>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: userData?.soundAlerts ? '#4CD964' : '#FF3B30' }
            ]} />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsButtonText}>Chỉnh sửa cài đặt</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FF4757',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIcon: {
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 5,
  },
  notificationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  notificationIcon: {
    marginRight: 15,
  },
  notificationText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  settingsButton: {
    backgroundColor: '#FF4757',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    alignItems: 'center',
  },
  settingsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;