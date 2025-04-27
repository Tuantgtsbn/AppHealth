import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Switch, 
  TextInput, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const SettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [heartRateMin, setHeartRateMin] = useState('60');
  const [heartRateMax, setHeartRateMax] = useState('100');
  const [spo2Min, setSpo2Min] = useState('95');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const userId = auth.currentUser.uid;
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        setEmailNotifications(userData.emailNotifications !== undefined ? userData.emailNotifications : true);
        setSoundAlerts(userData.soundAlerts !== undefined ? userData.soundAlerts : true);
        setEmergencyContact(userData.emergencyContact || '');
        
        if (userData.heartRateThreshold) {
          setHeartRateMin(userData.heartRateThreshold.min.toString());
          setHeartRateMax(userData.heartRateThreshold.max.toString());
        }
        
        if (userData.spo2Threshold) {
          setSpo2Min(userData.spo2Threshold.min.toString());
        }
      }
    } catch (error) {
      console.error('Lỗi khi tải cài đặt người dùng:', error);
      Alert.alert('Lỗi', 'Không thể tải cài đặt người dùng');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      
      // Kiểm tra giá trị hợp lệ
      const hrMin = parseInt(heartRateMin);
      const hrMax = parseInt(heartRateMax);
      const spo2MinVal = parseInt(spo2Min);
      
      if (isNaN(hrMin) || isNaN(hrMax) || isNaN(spo2MinVal)) {
        Alert.alert('Lỗi', 'Vui lòng nhập số hợp lệ cho các ngưỡng cảnh báo');
        return;
      }
      
      if (hrMin >= hrMax) {
        Alert.alert('Lỗi', 'Ngưỡng nhịp tim tối thiểu phải nhỏ hơn ngưỡng tối đa');
        return;
      }
      
      if (spo2MinVal < 85 || spo2MinVal > 100) {
        Alert.alert('Lỗi', 'Ngưỡng SpO2 phải nằm trong khoảng 85-100%');
        return;
      }
      
      const userId = auth.currentUser.uid;
      
      await updateDoc(doc(db, 'users', userId), {
        emailNotifications: emailNotifications,
        soundAlerts: soundAlerts,
        emergencyContact: emergencyContact,
        heartRateThreshold: {
          min: hrMin,
          max: hrMax
        },
        spo2Threshold: {
          min: spo2MinVal,
          max: 100  // SpO2 luôn có ngưỡng tối đa là 100%
        },
        updatedAt: new Date()
      });
      
      Alert.alert('Thành công', 'Đã lưu cài đặt của bạn');
    } catch (error) {
      console.error('Lỗi khi lưu cài đặt:', error);
      Alert.alert('Lỗi', 'Không thể lưu cài đặt');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }]
      });
    } catch (error) {
      console.error('Lỗi khi đăng xuất:', error);
      Alert.alert('Lỗi', 'Không thể đăng xuất');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4757" />
        <Text style={styles.loadingText}>Đang tải cài đặt...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Cài đặt</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông báo</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Thông báo qua email</Text>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: "#767577", true: "#FF4757" }}
              thumbColor={emailNotifications ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Âm thanh cảnh báo</Text>
            <Switch
              value={soundAlerts}
              onValueChange={setSoundAlerts}
              trackColor={{ false: "#767577", true: "#FF4757" }}
              thumbColor={soundAlerts ? "#f4f3f4" : "#f4f3f4"}
            />
          </View>
          
          <View style={styles.settingFieldContainer}>
            <Text style={styles.settingLabel}>Email liên hệ khẩn cấp</Text>
            <TextInput
              style={styles.input}
              value={emergencyContact}
              onChangeText={setEmergencyContact}
              placeholder="Nhập email liên hệ khẩn cấp"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ngưỡng cảnh báo</Text>
          
          <Text style={styles.settingGroupLabel}>Nhịp tim (bpm)</Text>
          <View style={styles.rangeContainer}>
            <View style={styles.rangeInputContainer}>
              <Text style={styles.rangeLabel}>Tối thiểu</Text>
              <TextInput
                style={styles.rangeInput}
                value={heartRateMin}
                onChangeText={setHeartRateMin}
                keyboardType="number-pad"
              />
            </View>
            
            <View style={styles.rangeSeparator} />
            
            <View style={styles.rangeInputContainer}>
              <Text style={styles.rangeLabel}>Tối đa</Text>
              <TextInput
                style={styles.rangeInput}
                value={heartRateMax}
                onChangeText={setHeartRateMax}
                keyboardType="number-pad"
              />
            </View>
          </View>
          
          <Text style={styles.settingGroupLabel}>SpO2 (%)</Text>
          <View style={styles.settingFieldContainer}>
            <Text style={styles.rangeLabel}>Tối thiểu</Text>
            <TextInput
              style={styles.input}
              value={spo2Min}
              onChangeText={setSpo2Min}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveSettings}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Đăng xuất</Text>
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
  section: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingFieldContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    fontSize: 16,
  },
  settingGroupLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  rangeContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  rangeInputContainer: {
    flex: 1,
  },
  rangeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  rangeInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  rangeSeparator: {
    width: 20,
  },
  saveButton: {
    backgroundColor: '#FF4757',
    borderRadius: 10,
    padding: 15,
    margin: 20,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#FF4757',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;