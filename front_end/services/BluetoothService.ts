import { BleManager, Device } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform, NativeModules } from 'react-native';
let instance: BluetoothService | null = null;
export class BluetoothService {
    private manager: BleManager;
    private device: Device | null;
    private isConnected: boolean;
    private devices: Map<string, Device>;
    private isScanning: boolean;

    constructor() {
        if (instance) {
            return instance;
        }
        this.manager = new BleManager();
        this.device = null;
        this.isConnected = false;
        this.devices = new Map();
        this.isScanning = false;
        instance = this;
    }
    static getInstance(): BluetoothService {
        if (!instance) {
            instance = new BluetoothService();
        }
        return instance;
    }
    getIsScanning() {
        return this.isScanning;
    }
    async requestBluetoothPermission(): Promise<boolean> {
        if (Platform.OS !== 'android') {
            return true;
        }
        try {
            const granted = await PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            ]);
            return (
                granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                granted[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
                    PermissionsAndroid.RESULTS.GRANTED &&
                granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
                    PermissionsAndroid.RESULTS.GRANTED
            );
        } catch (error) {
            console.error('Permission request error:', error);
            return false;
        }
    }

    async scanDevices(
        onDevicesUpdate: (devices: Device[]) => void
    ): Promise<void> {
        if (this.isScanning) {
            console.log('Already scanning, stopping previous scan');
            await this.stopScan();
        }

        const permissionGranted = await this.requestBluetoothPermission();
        if (!permissionGranted) {
            console.error('Bluetooth permissions not granted');
            return;
        }

        this.devices.clear();
        this.isScanning = true;
        await this.manager.startDeviceScan(null, null, (error, device) => {
            if (error) {
                console.error('Error scanning:', error);
                this.isScanning = false;
                return;
            }
            // console.log('Scanning device:', device);
            if (device && device.name) {
                this.devices.set(device.id, device);
                onDevicesUpdate(Array.from(this.devices.values()));
            }
        });
    }

    async stopScan(): Promise<void> {
        if (this.isScanning) {
            await this.manager.stopDeviceScan();
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

    async readData(
        serviceUUID: string,
        characteristicUUID: string
    ): Promise<string | null> {
        try {
            if (!this.device || !this.isConnected) {
                console.error('No device connected');
                return null;
            }
            const characteristic =
                await this.device.readCharacteristicForService(
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

        console.log(
            'Starting to monitor characteristic:',
            serviceUUID,
            characteristicUUID
        );
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
                    console.log(
                        'Attempting to disconnect from device:',
                        this.device.id
                    );
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
                await this.manager
                    .cancelDeviceConnection(this.device.id)
                    .catch((err) => {
                        console.error('Retry disconnect error:', err);
                    });
            }
        } finally {
            this.isConnected = false;
            this.device = null;
            console.log('Disconnect completed, device state reset');
        }
    }

    // Thêm phương thức kiểm tra và bật Bluetooth
    async enableBluetooth(): Promise<boolean> {
        try {
            // Kiểm tra xem Bluetooth có được bật không
            const state = await this.manager.state();

            if (state === 'PoweredOn') {
                console.log('Bluetooth đã được bật');
                return true;
            }

            if (Platform.OS === 'android') {
                console.log('Yêu cầu người dùng bật Bluetooth');
                // Trên Android, yêu cầu người dùng bật Bluetooth
                const { BluetoothAdapter } = NativeModules;
                if (BluetoothAdapter && BluetoothAdapter.enableBluetooth) {
                    const result = await BluetoothAdapter.enableBluetooth();
                    return result;
                } else {
                    console.log(
                        'Không thể bật Bluetooth tự động, yêu cầu người dùng bật thủ công'
                    );
                    return false;
                }
            } else {
                // Trên iOS, không thể bật Bluetooth theo chương trình
                console.log(
                    'Trên iOS, không thể bật Bluetooth tự động, yêu cầu người dùng bật thủ công'
                );
                return false;
            }
        } catch (error) {
            console.error('Lỗi khi bật Bluetooth:', error);
            return false;
        }
    }

    // Phương thức quét và hiển thị tất cả thiết bị Bluetooth (không lọc)
    async scanAllDevices(
        onDevicesUpdate: (devices: Device[]) => void,
        timeoutMs: number = 10000
    ): Promise<void> {
        if (this.isScanning) {
            console.log('Đang quét, dừng quét trước đó');
            await this.stopScan();
        }

        // Kiểm tra quyền và bật Bluetooth
        const permissionGranted = await this.requestBluetoothPermission();
        if (!permissionGranted) {
            console.error('Không được cấp quyền Bluetooth');
            return;
        }

        try {
            const bluetoothState = await this.getBluetoothState();
            if (bluetoothState !== 'PoweredOn') {
                console.log(
                    'Bluetooth không được bật, trạng thái:',
                    bluetoothState
                );
                const bluetoothEnabled = await this.enableBluetooth();
                if (!bluetoothEnabled) {
                    console.error('Bluetooth chưa được bật');
                    return;
                }
            }

            this.devices.clear();
            this.isScanning = true;

            // Bắt đầu quét tất cả thiết bị, không lọc
            // Thêm tùy chọn allowDuplicates: true để nhận được nhiều gói quảng cáo từ cùng một thiết bị
            const scanOptions = {
                allowDuplicates: true
            };
            // Tự động dừng quét sau khoảng thời gian
            setTimeout(() => {
                if (this.isScanning) {
                    this.stopScan();
                    console.log('Đã dừng quét sau', timeoutMs, 'ms');
                }
            }, timeoutMs);
            this.manager.startDeviceScan(null, scanOptions, (error, device) => {
                if (error) {
                    console.error('Lỗi khi quét:', error);
                    this.isScanning = false;
                    return;
                }

                if (device && device.name) {
                    // Log chi tiết về thiết bị để debug
                    // console.log('Thiết bị được tìm thấy:', {
                    //     id: device.id,
                    //     name: device.name,
                    //     localName: device.localName,
                    //     manufacturerData: device.manufacturerData,
                    //     serviceUUIDs: device.serviceUUIDs,
                    //     rssi: device.rssi
                    // });

                    // Lưu thiết bị vào Map
                    this.devices.set(device.id, device);

                    // Gọi callback với danh sách thiết bị hiện tại
                    onDevicesUpdate(Array.from(this.devices.values()));
                }
            });
        } catch (error) {
            console.error('Lỗi trong quá trình quét thiết bị:', error);
            this.isScanning = false;
        }
    }

    // Phương thức lấy thông tin thiết bị
    getDeviceInfo(deviceId: string): Device | null {
        return this.devices.get(deviceId) || null;
    }

    // Phương thức kiểm tra trạng thái Bluetooth
    async getBluetoothState(): Promise<string> {
        try {
            const state = await this.manager.state();
            return state; // 'Unknown', 'Resetting', 'Unsupported', 'Unauthorized', 'PoweredOff', 'PoweredOn'
        } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái Bluetooth:', error);
            return 'Unknown';
        }
    }
}

export default BluetoothService.getInstance();
