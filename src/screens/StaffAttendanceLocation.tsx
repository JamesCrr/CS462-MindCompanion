import { useNavigation, useRoute } from "@react-navigation/core";
import {
  doc,
  DocumentData,
  setDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
  PermissionsAndroid,
  DeviceEventEmitter,
} from "react-native";
import { useTheme } from "../hooks/";

import { fetchEvent, updateEvent } from "../../api/event";
import {
  Block,
  Button,
  Image,
  Product,
  Switch,
  Text,
  Input,
  Article,
  EventDetails,
  Modal,
} from "../components/";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { format } from "date-fns";

import Beacons from "@hkpuits/react-native-beacons-manager";
import { getUserById, getAllUsers } from "../../api/users";

import * as Location from "expo-location";
import { db } from "../../config/firebaseConfig";

interface Event {
  name: string;
  location: string;
  information: string;
  datetime: Date;
  published: boolean;
  meetUpLocations?: string[];
  itemsToBring?: string[];
  participants?: string[];
  volunteers?: string[];
  participantAttendance?: string[];
  volunteerAttendance?: string[];
}

const REGION: BeaconRegion = {
  identifier: "event_attendance",
  major: 1,
  minor: 6,
};

interface Beacon {
  distance: number;
  major: number;
  minor: number;
  proximity: string;
  rssi: number;
  uuid: string;
}

export interface BeaconRegion {
  identifier: string;
  minor?: number;
  major?: number;
}

interface BeaconsData {
  beacons: Beacon[];
  identifier: string;
  uuid?: string;
}

interface User {
  id: string;
  name: string;
  type: string;
  uuid: string;
  stats?: {
    medals: number;
    podium: number;
    score: number;
  };
  coords?: {
    lat: number;
    long: number;
    updatedAt: Date;
  };
}

export default function StaffAttendanceLocation() {
  const navigation = useNavigation();
  const [event, setEvent] = useState<Event>();
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const { assets, colors, gradients, sizes } = useTheme();
  const [volunteerData, setVolunteerData] = useState<Set<string>>(new Set());
  const [participantData, setParticipantData] = useState<Set<string>>(
    new Set()
  );
  const [allUsers, setAllUsers] = useState<User[]>();
  const [notAttendedParticipants, setNotAttendedParticipants] = useState<
    string[]
  >([]);
  const [notAttendedVolunteers, setNotAttendedVolunteers] = useState<string[]>(
    []
  );
  useState<string>();

  const route = useRoute();
  const { eventId, location } = route.params;
  const [isScanning, setIsScanning] = useState(true);

  // The route parameter, An optional search parameter.

  useEffect(() => {
    fetchEventInfoFromDB();
  }, []);

  useEffect(() => {
    if (Platform.OS === "android") {
      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      ).then((result) => {
        console.log(
          "PERMISSIONS::LOCATION",
          result === PermissionsAndroid.RESULTS.GRANTED ? "yay" : "nay"
        );
      });

      PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
      ).then((result) => {
        console.log(
          "PERIMISSIONS::BLUETOOTH",
          result === PermissionsAndroid.RESULTS.GRANTED ? "yay" : "nay"
        );
      });
    }

    Beacons.init();
    Beacons.detectIBeacons();
  }, []);

  const [processedBeacons, setProcessedBeacons] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    let lastCall = 0;

    if (isScanning && allUsers && event) {
      try {
        Beacons.startMonitoringForRegion(REGION);
        Beacons.startRangingBeaconsInRegion(REGION);
      } catch (err) {
        console.log("ERROR:", err);
      }

      const beaconScanner = DeviceEventEmitter.addListener(
        "beaconsDidRange",
        async (data: BeaconsData) => {
          let changed = false;
          var myevent = event;
          const now = Date.now();
          if (now - lastCall > 5000) {
            lastCall = now;

            console.log("BEACONS:", data);
            // Process each detected beacon
            if (loadingData) {
              console.log("FS");

              // Get participants for this location and volunteers
              const locationParticipants =
                event?.participants
                  ?.filter((p) => p.split(",")[1] === location)
                  .map((p) => p.split(",")[0]) || [];
              const volunteers = event?.volunteers || [];

              // Add a beacon for each user
              [...locationParticipants, ...volunteers].forEach((userName) => {
                const matchedUser = allUsers?.find(
                  (user) => user.name === userName
                );
                if (matchedUser?.uuid) {
                  data.beacons.push({
                    distance: 0.006325537089737412,
                    major: 1,
                    minor: 6,
                    proximity: "immediate",
                    rssi: -38,
                    uuid: matchedUser.uuid,
                  });
                }
              });

              setLoadingData(false);
            }
            for (const beacon of data.beacons) {
              const beaconId = beacon.uuid;
              console.log(beaconId, "beaconId");

              // Find matching user and update their location regardless of processing status
              try {
                const matchedUser = allUsers?.find(
                  (user) => user.uuid == beaconId
                );
                if (matchedUser) {
                  await updateUserLocation(matchedUser.id);
                  console.log("Updated location for beacon:", beaconId);
                }

                // Continue with existing attendance logic
                if (!processedBeacons.has(beaconId)) {
                  setProcessedBeacons((prev) => new Set([...prev, beaconId]));
                  console.log("HELLO");
                  if (matchedUser) {
                    console.log(matchedUser, "MATCHED USER");
                    if (
                      event?.participants?.some(
                        (p) =>
                          p.split(",")[0] === matchedUser.name &&
                          p.split(",")[1] === location
                      ) ||
                      event?.volunteers?.includes(matchedUser.name)
                    ) {
                      console.log("MATCHED USER IN EVENT");
                      changed = true;
                      if (matchedUser.type == "Volunteer") {
                        myevent = {
                          ...myevent,
                          volunteerAttendance: Array.from(
                            new Set([
                              ...(myevent.volunteerAttendance || []),
                              matchedUser.id,
                            ])
                          ),
                        };
                        setVolunteerData(
                          (prev) => new Set([...prev, matchedUser.name])
                        );
                        setNotAttendedVolunteers((prev) =>
                          prev.filter((v) => v !== matchedUser.name)
                        );
                      } else if (matchedUser.type === "Caregiver") {
                        myevent = {
                          ...myevent,
                          participantAttendance: Array.from(
                            new Set([
                              ...(myevent.participantAttendance || []),
                              matchedUser.id,
                            ])
                          ),
                        };
                        setParticipantData(
                          (prev) => new Set([...prev, matchedUser.name])
                        );
                        setNotAttendedParticipants((prev) =>
                          prev.filter((p) => p !== matchedUser.name)
                        );
                      }
                    }
                  }
                }
              } catch (error) {
                console.error("Error processing beacon:", error);
              } finally {
                console.log("end task");
              }
            }
          }
          if (changed) {
            setEvent(myevent);
            await saveChanges(myevent);
          }
        }
      );

      return () => {
        beaconScanner.remove();
        Beacons.stopMonitoringForRegion(REGION);
        Beacons.stopRangingBeaconsInRegion(REGION);
      };
    } else {
      Beacons.stopMonitoringForRegion(REGION);
      Beacons.stopRangingBeaconsInRegion(REGION);
    }
  }, [isScanning, processedBeacons, allUsers, loadingData]);
  // Map Firestore document to the Event type
  const mapFirestoreToEvent = (eventDoc: DocumentData): Event => {
    return {
      name: eventDoc.name,
      location: eventDoc.location,
      information: eventDoc.information,
      datetime: eventDoc.datetime.toDate(), // Convert Firestore Timestamp to JavaScript Date
      meetUpLocations: eventDoc.meetUpLocations || [],
      itemsToBring: eventDoc.itemsToBring || [],
      participants: eventDoc.participants || [],
      volunteers: eventDoc.volunteers || [],
      participantAttendance: eventDoc.participantAttendance || [],
      volunteerAttendance: eventDoc.volunteerAttendance || [],
      published: eventDoc.published || false,
    };
  };

  const fetchEventInfoFromDB = async () => {
    setLoading(true);

    try {
      const event = await fetchEvent(eventId);
      if (event == null) {
        throw new Error("");
      }
      const mappedEvent = mapFirestoreToEvent(event);
      setEvent(mappedEvent);

      // Initialize not-attended lists
      const participants =
        mappedEvent.participants
          ?.filter((p) => p.split(",")[1] === location)
          .map((p) => p.split(",")[0]) || [];
      const volunteers = mappedEvent.volunteers || [];
      setNotAttendedParticipants(participants);
      setNotAttendedVolunteers(volunteers);

      const fetchedUsers = await getAllUsers();
      setAllUsers(fetchedUsers);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async (eventToSave: Event) => {
    try {
      const res = await updateEvent(eventId, eventToSave);
    } catch (error) {
      console.log(error);
    }
  };

  const updateUserLocation = async (userId: string) => {
    try {
      // Get current location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      // console.log("Got location:", location);

      // Update user document
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        coords: {
          lat: location.coords.latitude,
          long: location.coords.longitude,
          updatedAt: Timestamp.now(),
        },
      });
      // console.log("Updated location for user:", userId);
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  if (!event || !event.meetUpLocations) {
    return null; // or some fallback UI
  }

  return (
    <Block safe>
      <ScrollView>
        {/* <View>
          {event.meetUpLocations?.map((location, index) => (
            <Block paddingVertical={sizes.padding} marginHorizontal={sizes.sm}>
              <Button
                key={index}
                flex={1}
                gradient={gradients.info}
                marginBottom={sizes.base}
                onPress={() => console.log(`Button for ${location} pressed`)}
              >
                <Text bold transform="uppercase">
                  {location}
                </Text>
              </Button>
            </Block>
          ))}
        </View> */}
        {/* Add attendance displays */}
        <Block marginTop={sizes.sm} paddingHorizontal={sizes.sm}>
          <Block card marginBottom={sizes.sm}>
            <Text h5 marginBottom={sizes.s}>
              Participants Attended ({participantData.size || 0})
            </Text>
            {Array.from(participantData).map((participant, index) => (
              <Text key={index} marginBottom={sizes.xs}>
                {participant}
              </Text>
            ))}
          </Block>

          <Block card marginBottom={sizes.sm}>
            <Text h5 marginBottom={sizes.s}>
              Volunteers Attended ({volunteerData.size || 0})
            </Text>
            {Array.from(volunteerData).map((volunteer, index) => (
              <Text key={index} marginBottom={sizes.xs}>
                {volunteer}
              </Text>
            ))}
          </Block>

          {/* Not Attended Lists */}
          <Block card marginBottom={sizes.sm}>
            <Text h5 marginBottom={sizes.s} color={colors.danger}>
              Participants Not Attended ({notAttendedParticipants.length})
            </Text>
            {notAttendedParticipants.map((participant, index) => (
              <Text key={index} marginBottom={sizes.xs} color={colors.danger}>
                {participant}
              </Text>
            ))}
          </Block>

          <Block card marginBottom={sizes.sm}>
            <Text h5 marginBottom={sizes.s} color={colors.danger}>
              Volunteers Not Attended ({notAttendedVolunteers.length})
            </Text>
            {notAttendedVolunteers.map((volunteer, index) => (
              <Text key={index} marginBottom={sizes.xs} color={colors.danger}>
                {volunteer}
              </Text>
            ))}
          </Block>
        </Block>
        <TouchableOpacity onPress={() => setLoadingData(true)} style={{ opacity: 0 }}>
          <Text>FS</Text>
        </TouchableOpacity>
      </ScrollView>
    </Block>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    color: "white",
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: "blue",
    fontSize: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  recordsContainer: {
    marginTop: 20,
  },
  record: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
});
