#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include <Wire.h>
#include "MAX30105.h"
#include "spo2_algorithm.h" // Thêm thư viện thuật toán SpO2

// UUID của dịch vụ và characteristic
#define SERVICE_UUID "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// Đối tượng BLE
BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;

// Đối tượng cảm biến MAX30102
MAX30105 particleSensor;

// Bộ đệm cho dữ liệu
uint32_t irBuffer[100]; // Dữ liệu IR
uint32_t redBuffer[100]; // Dữ liệu Red
int32_t bufferLength = 100; // Độ dài bộ đệm
int32_t spo2; // Giá trị SpO2
int8_t validSPO2; // Cờ xác nhận SpO2 hợp lệ
int32_t heartRate; // Giá trị nhịp tim
int8_t validHeartRate; // Cờ xác nhận nhịp tim hợp lệ

// Callback cho BLE
class MyServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* pServer) {
    deviceConnected = true;
    Serial.println("Device connected");
  }

  void onDisconnect(BLEServer* pServer) {
    deviceConnected = false;
    Serial.println("Device disconnected");
    BLEDevice::startAdvertising();
  }
};

void setup() {
  Serial.begin(115200);
  
  // Khởi tạo cảm biến MAX30102
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 not found. Please check wiring!");
    while (1);
  }

  // Cấu hình cảm biến 
  byte ledBrightness = 60; 
  byte sampleAverage = 4; 
  byte ledMode = 2; // 2 = Red + IR
  byte sampleRate = 100; 
  int pulseWidth = 411; 
  int adcRange = 4096; 

  particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
  Serial.println("MAX30102 initialized");

  // Khởi tạo BLE
  BLEDevice::init("ESP32_HeartRate");
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());
  BLEService* pService = pServer->createService(SERVICE_UUID);
  pCharacteristic = pService->createCharacteristic(
    CHARACTERISTIC_UUID,
    BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_NOTIFY
  );
  pCharacteristic->addDescriptor(new BLE2902());
  pService->start();

  // Bắt đầu quảng bá
  BLEAdvertising* pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(true);
  pAdvertising->setMinPreferred(0x06);
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("BLE advertising started");
}

void loop() {
  // Đọc 100 mẫu đầu tiên để xác định phạm vi tín hiệu
  for (byte i = 0; i < bufferLength; i++) {
    while (particleSensor.available() == false)
      particleSensor.check();

    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample();
  }

  // Tính nhịp tim và SpO2
  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);

 
  while (1) {
    // Di chuyển 75 mẫu cuối lên đầu bộ đệm
    for (byte i = 25; i < 100; i++) {
      redBuffer[i - 25] = redBuffer[i];
      irBuffer[i - 25] = irBuffer[i];
    }

    // Lấy 25 mẫu mới
    for (byte i = 75; i < 100; i++) {
      while (particleSensor.available() == false)
        particleSensor.check();

      redBuffer[i] = particleSensor.getRed();
      irBuffer[i] = particleSensor.getIR();
      particleSensor.nextSample();
    }

    // Tính lại nhịp tim và SpO2
    maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);

    // Kiểm tra và hiển thị dữ liệu
    if (validHeartRate && validSPO2 && heartRate > 30 && heartRate < 200 && spo2 > 50 && spo2 <= 100) {
      Serial.print("Heart Rate: ");
      Serial.print(heartRate);
      Serial.print(" bpm, SpO2: ");
      Serial.print(spo2);
      Serial.println("%");

      // Gửi dữ liệu qua BLE nếu kết nối
      if (deviceConnected) {
        String data = "SpO2:" + String(spo2) + ",HR:" + String(heartRate);
        pCharacteristic->setValue(data.c_str());
        pCharacteristic->notify();
        Serial.println("Sent: " + data);
      }
    } else {
      Serial.println("Invalid data, please place your finger on the sensor.");
    }

    
    delay(1000);
  }
}