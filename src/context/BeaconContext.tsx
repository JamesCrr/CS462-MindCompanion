import React, { createContext, useContext, useState, useEffect } from 'react';
import { DeviceEventEmitter, Platform } from 'react-native';
import Beacons from '@hkpuits/react-native-beacons-manager';
import { getAllUsers } from "../../api/users";
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import * as Location from 'expo-location';
import { PermissionsAndroid } from 'react-native';
import * as TaskManager from 'expo-task-manager';

const REGION = {
  identifier: 'event_attendance',
  major: 1,
  minor: 6,
};

interface BeaconContextType {
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  scannedUsers: Set<string>;
}

const BeaconContext = createContext<BeaconContextType | undefined>(undefined);

// Define a background task name
const LOCATION_TASK_NAME = 'background-location-task';

// Register background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('❌ Background location task error:', error);
    return;
  }
  if (data) {
    const { locations } = data as { locations: Location.LocationObject[] };
    console.log('📍 Got background location:', locations);
  }
});

export function BeaconProvider({ children }: { children: React.ReactNode }) {
  const [isScanning, setIsScanning] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>();
  const [scannedUsers, setScannedUsers] = useState<Set<string>>(new Set());

  // Move all your existing helper functions here
  const requestPermissions = async () => {
    try {
      console.log('🔄 Starting permissions request...');
      
      // Request location permissions first
      const locationPermissionsGranted = await requestLocationPermissions();
      if (!locationPermissionsGranted) {
        throw new Error('Location permissions not granted');
      }

      if (Platform.OS === 'android') {
        const locationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        console.log('📍 Location permission:', locationPermission);

        const bluetoothScanPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
        );
        console.log('🔵 Bluetooth scan permission:', bluetoothScanPermission);

        const bluetoothConnectPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        );
        console.log('🔵 Bluetooth connect permission:', bluetoothConnectPermission);

        if (
          locationPermission !== 'granted' || 
          bluetoothScanPermission !== 'granted' ||
          bluetoothConnectPermission !== 'granted'
        ) {
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

  const requestLocationPermissions = async () => {
    try {
      const { status: foregroundStatus } = 
        await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.log('❌ Foreground location permission denied');
        return false;
      }

      const { status: backgroundStatus } = 
        await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.log('❌ Background location permission denied');
        return false;
      }

      // Start background location updates
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 10000, // Update every 10 seconds
        distanceInterval: 10, // or after 10 meters
        foregroundService: {
          notificationTitle: "Background Location",
          notificationBody: "Tracking location in background",
        },
      });

      return true;
    } catch (error) {
      console.error('❌ Error requesting location permissions:', error);
      return false;
    }
  };

  const updateUserLocation = async (userId: string) => {
    try {
      let location;
      
      if (Platform.OS === 'android') {
        // Use last known location for immediate updates
        location = await Location.getLastKnownPositionAsync({});
      } else {
        location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      if (!location) {
        console.log("❌ No location available");
        return;
      }
      
      // Update user document
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        coords: {
          lat: location.coords.latitude,
          long: location.coords.longitude,
          updatedAt: Timestamp.now(),
        },
      });
      console.log("✅ Updated location for user:", userId);
    } catch (error) {
      console.error("❌ Error updating location:", error);
    }
  };

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

  useEffect(() => {
    if (isScanning) {
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

      // Start initial scan
      startBeaconScanning();

      // Set up periodic scanning
      const scanInterval = setInterval(() => {
        console.log('🔄 Running periodic beacon scan...');
        startBeaconScanning();
      }, 10000);

      const beaconScanner = DeviceEventEmitter.addListener(
        'beaconsDidRange',
        async (data) => {
          console.log('📍 Beacon scan cycle:', {
            timestamp: new Date().toISOString(),
            beaconCount: data.beacons?.length || 0,
          });

          if (data.beacons?.length > 0 && allUsers) {
            for (const beacon of data.beacons) {
              try {
                const beaconId = beacon.uuid;
                const matchedUser = allUsers.find(user => user.uuid === beaconId);
                if (matchedUser) {
                  await updateUserLocation(matchedUser.id);
                  setScannedUsers(prev => new Set([...prev, matchedUser.name]));
                  console.log('✅ Detected user:', matchedUser.name);
                }
              } catch (error) {
                console.error("Error processing beacon:", error);
              }
            }
          }
        }
      );

      return () => {
        console.log('🔴 Stopping beacon scanning service...');
        try {
          clearInterval(scanInterval);
          beaconScanner.remove();
          Beacons.stopMonitoringForRegion(REGION);
          Beacons.stopRangingBeaconsInRegion(REGION);
          console.log('⏹️ Beacon scanning service stopped successfully');
        } catch (error) {
          console.log('❌ Error stopping beacon service:', error);
        }
      };
    }
  }, [isScanning, allUsers]);

  // Add cleanup for location updates when scanning stops
  useEffect(() => {
    if (!isScanning) {
      (async () => {
        try {
          const hasStarted = await Location.hasStartedLocationUpdatesAsync(
            LOCATION_TASK_NAME
          );
          if (hasStarted) {
            await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
            console.log('✅ Stopped background location updates');
          }
        } catch (error) {
          console.error('❌ Error stopping location updates:', error);
        }
      })();
    }
  }, [isScanning]);

  return (
    <BeaconContext.Provider value={{ isScanning, setIsScanning, scannedUsers }}>
      {children}
    </BeaconContext.Provider>
  );
}

export const useBeacon = () => {
  const context = useContext(BeaconContext);
  if (context === undefined) {
    throw new Error('useBeacon must be used within a BeaconProvider');
  }
  return context;
}; 