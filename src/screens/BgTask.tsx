import React, { useEffect, useState } from 'react';
import { StyleSheet, DeviceEventEmitter, Platform } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import { PermissionsAndroid } from 'react-native';
import Beacons from '@hkpuits/react-native-beacons-manager';
import { db } from '../../config/firebaseConfig';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import * as Location from 'expo-location';
import { getAllUsers } from "../../api/users";
import { Block, Button, Text } from "../components/";
import { useTheme } from "../hooks/";
import { ScrollView } from 'react-native';

const REGION = {
  identifier: 'event_attendance',
  major: 1,
  minor: 6,
};

interface User {
  id: string;
  name: string;
  type: string;
  uuid: string;
  coords?: {
    lat: number;
    long: number;
    updatedAt: Date;
  };
}

const BgTask = () => {
  const { colors, gradients, sizes } = useTheme();
  const [isScanning, setIsScanning] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>();
  const [scannedUsers, setScannedUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        setAllUsers(fetchedUsers);
        console.log('✅ Users fetched successfully');
      } catch (error) {
        console.error("❌ Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  const requestPermissions = async () => {
    try {
      console.log('🔄 Starting permissions request...');
      
      if (Platform.OS === 'android') {
        const locationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        console.log('📍 Location permission:', locationPermission);

        const bluetoothPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        );
        console.log('🔵 Bluetooth permission:', bluetoothPermission);

        if (locationPermission !== 'granted' || bluetoothPermission !== 'granted') {
          throw new Error('Required permissions not granted');
        }
      }

      // Initialize beacons differently for Android
      if (Platform.OS === 'android') {
        console.log('🔄 Initializing Android beacons...');
        await Beacons.detectIBeacons();
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
        await Beacons.init();
      } else {
        console.log('🔄 Initializing iOS beacons...');
        await Beacons.init();
        await Beacons.detectIBeacons();
      }

      console.log('✅ Beacon initialization complete');
      return true;
    } catch (error) {
      console.log('❌ Error in requestPermissions:', error);
      return false;
    }
  };

  const updateUserLocation = async (userId: string) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      
      // Update user document
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        coords: {
          lat: location.coords.latitude,
          long: location.coords.longitude,
          updatedAt: Timestamp.now(),
        },
      });
      console.log("Updated location for user:", userId);
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  useEffect(() => {
    if (isScanning) {
      let lastCall = 0;
      console.log('🟢 Starting beacon scanning service...');
      
      const startBeaconScanning = async () => {
        try {
          const permissionsGranted = await requestPermissions();
          if (!permissionsGranted) {
            console.log('❌ Failed to get permissions');
            return;
          }

          console.log('🔄 Starting beacon monitoring...');
          await Beacons.startMonitoringForRegion(REGION);
          console.log('🔄 Starting beacon ranging...');
          await Beacons.startRangingBeaconsInRegion(REGION);
          console.log('✅ Beacon monitoring and ranging started successfully');
        } catch (err) {
          console.log('❌ Beacon scanning error:', err);
        }
      };

      console.log('📡 Setting up beacon scanner listener...');
      const beaconScanner = DeviceEventEmitter.addListener(
        'beaconsDidRange',
        async (data) => {
          const now = Date.now();
          if (now - lastCall > 10000) {
            lastCall = now;
            if (data.beacons?.length > 0 && allUsers) {
              for (const beacon of data.beacons) {
                try {
                  const beaconId = beacon.uuid;
                  const matchedUser = allUsers.find(user => user.uuid === beaconId);
                  if (matchedUser) {
                    await updateUserLocation(matchedUser.id);
                    setScannedUsers(prev => new Set([...prev, matchedUser.name]));
                  }
                } catch (error) {
                  console.error("Error processing beacon:", error);
                }
              }
            }
          }
        }
      );

      startBeaconScanning().catch(error => {
        console.log('❌ Error in startBeaconScanning:', error);
      });

      return () => {
        console.log('🔴 Stopping beacon scanning service...');
        try {
          beaconScanner.remove();
          Beacons.stopMonitoringForRegion(REGION);
          Beacons.stopRangingBeaconsInRegion(REGION);
          console.log('⏹️ Beacon scanning service stopped successfully');
        } catch (error) {
          console.log('❌ Error stopping beacon service:', error);
        }
      };
    } else {
      console.log('⏸️ Scanning is disabled');
    }
  }, [isScanning]);

  return (
    <Block safe>
      <ScrollView>
        <Block paddingHorizontal={sizes.padding}>
          <Text h4 marginBottom={sizes.sm}>
            Background Beacon Scanner
          </Text>
          
          <Block card marginBottom={sizes.sm}>
            <Text p semibold marginBottom={sizes.s}>
              Scanner Status: {isScanning ? 'Active' : 'Inactive'}
            </Text>
            <Button
              gradient={isScanning ? gradients.danger : gradients.success}
              marginBottom={sizes.base}
              onPress={() => setIsScanning(!isScanning)}
            >
              <Text bold white transform="uppercase">
                {isScanning ? 'Stop Scanning' : 'Start Scanning'}
              </Text>
            </Button>
          </Block>

          <Block card marginBottom={sizes.sm}>
            <Text h5 marginBottom={sizes.s}>
              Detected Users ({scannedUsers.size})
            </Text>
            {Array.from(scannedUsers).map((userName, index) => (
              <Text key={index} marginBottom={sizes.xs}>
                {userName}
              </Text>
            ))}
            {scannedUsers.size === 0 && (
              <Text italic color={colors.gray}>
                No users detected yet
              </Text>
            )}
          </Block>
        </Block>
      </ScrollView>
    </Block>
  );
};

export default BgTask;
