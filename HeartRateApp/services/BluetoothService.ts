import { BleManager, Device } from 'react-native-ble-plx';
import { PermissionsAndroid } from 'react-native';

export default class BluetoothService {
  private manager: BleManager;
  private device: Device | null;
  private isConnected: boolean;
  private devices: Map<string, Device>;
  private isScanning: boolean;

  constructor() {
    this.manager = new BleManager();
    this.device = null;
    this.isConnected = false;
    this.devices = new Map();
    this.isScanning = false;
  }

  async requestBluetoothPermission(): Promise<boolean> {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  async scanDevices(onDevicesUpdate: (devices: Device[]) => void): Promise<void> {
    if (this.isScanning) {
      console.log('Already scanning, stopping previous scan');
      this.stopScan();
    }

    const permissionGranted = await this.requestBluetoothPermission();
    if (!permissionGranted) {
      console.error('Bluetooth permissions not granted');
      return;
    }

    this.devices.clear();
    this.isScanning = true;
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Error scanning:', error);
        this.isScanning = false;
        return;
      }
      if (device && device.name) {
        this.devices.set(device.id, device);
        onDevicesUpdate(Array.from(this.devices.values()));
      }
    });
  }

  stopScan(): void {
    if (this.isScanning) {
      this.manager.stopDeviceScan();
      this.isScanning = false;
      console.log('Stopped scanning');
    }
  }

  async connectToDevice(deviceId: string): Promise<boolean> {
    try {
      this.device = await this.manager.connectToDevice(deviceId);
      await this.device.discoverAllServicesAndCharacteristics();
      this.isConnected = await this.device.isConnected();
      console.log('Connected to device:', deviceId);
      return true;
    } catch (error) {
      console.error('Connection error:', error);
      this.isConnected = false;
      this.device = null;
      return false;
    }
  }

  async readData(serviceUUID: string, characteristicUUID: string): Promise<string | null> {
    try {
      if (!this.device || !this.isConnected) {
        console.error('No device connected');
        return null;
      }
      const characteristic = await this.device.readCharacteristicForService(
        serviceUUID,
        characteristicUUID
      );
      const value = characteristic.value;
      const decodedValue = value ? atob(value) : null;
      return decodedValue;
    } catch (error) {
      console.error('Read error:', error);
      return null;
    }
  }

  monitorData(
    serviceUUID: string,
    characteristicUUID: string,
    onDataReceived: (data: string) => void
  ): any {
    if (!this.device || !this.isConnected) {
      console.error('No device connected');
      return null;
    }

    console.log('Starting to monitor characteristic:', serviceUUID, characteristicUUID);
    const subscription = this.device.monitorCharacteristicForService(
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          if (error.message.includes('Operation was cancelled')) {
            console.log('Monitoring stopped due to disconnection');
          } else {
            console.error('Monitor error:', error);
          }
          return;
        }
        if (characteristic?.value) {
          const value = atob(characteristic.value);
          console.log('Received data:', value);
          onDataReceived(value);
        }
      }
    );
    return subscription;
  }

  async disconnect(): Promise<void> {
    try {
      if (this.device && this.isConnected) {
        const isDeviceConnected = await this.device.isConnected();
        if (isDeviceConnected) {
          console.log('Attempting to disconnect from device:', this.device.id);
          await this.manager.cancelDeviceConnection(this.device.id);
          console.log('Disconnected from device');
        } else {
          console.log('Device already disconnected');
        }
      }
    } catch (error) {
      console.error('Disconnect error:', error);
      // Thử ngắt kết nối lại nếu thất bại
      if (this.device) {
        await this.manager.cancelDeviceConnection(this.device.id).catch((err) => {
          console.error('Retry disconnect error:', err);
        });
      }
    } finally {
      this.isConnected = false;
      this.device = null;
      console.log('Disconnect completed, device state reset');
    }
  }
}