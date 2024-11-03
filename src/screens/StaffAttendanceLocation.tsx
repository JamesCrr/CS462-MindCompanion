import { useNavigation, useRoute } from "@react-navigation/core";
import { doc, DocumentData, setDoc } from "firebase/firestore";
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

interface Event {
  name: string;
  location: string;
  information: string;
  datetime: Date;
  meetUpLocations?: string[];
  itemsToBring?: string[];
  participants?: string[];
  volunteers?: string[];
  participantAttendance?: string[];
  volunteerAttendance?: string[];
}

const REGION: BeaconRegion = {
  identifier: "event_attendance",
  uuid: "",
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
  uuid: string;
  minor?: number;
  major?: number;
}

interface BeaconsData {
  beacons: Beacon[];
  identifier: string;
  uuid: string;
}

export default function StaffAttendanceLocation() {
  const navigation = useNavigation();
  const [event, setEvent] = useState<Event>();
  const [loading, setLoading] = useState<boolean>(false);
  const { assets, colors, gradients, sizes } = useTheme();

  useState<string>();

  const route = useRoute();
  const { eventId, location } = route.params;
  const [isScanning, setIsScanning] = useState(true);

  console.log(eventId, location);

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

  useEffect(() => {
    if (isScanning) {
      try {
        Beacons.startMonitoringForRegion(REGION);
        Beacons.startRangingBeaconsInRegion(REGION);
      } catch (err) {
        console.log("ERROR:", err);
      }

      const beaconScanner = DeviceEventEmitter.addListener(
        "beaconsDidRange",
        (data: BeaconsData) => {
          console.log("BEACONS:", data);
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
  }, [isScanning]);
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
    };
  };

  const fetchEventInfoFromDB = async () => {
    setLoading(true);

    try {
      const event = await fetchEvent(eventId);
      if (event == null) {
        throw new Error("");
      }
      setEvent(mapFirestoreToEvent(event));
      console.log(event, "lololol");
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

  const saveChanges = async () => {
    try {
      const res = await updateEvent(eventId, event);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  };

  // Add new state for tracking intervals
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);

  // Add function to randomly select and add attendees
  const addRandomAttendee = () => {
    if (!event) return;

    const randomParticipant =
      event.participants?.[
        Math.floor(Math.random() * event.participants.length)
      ];
    const randomVolunteer =
      event.volunteers?.[Math.floor(Math.random() * event.volunteers.length)];

    setEvent((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        participantAttendance: [
          ...new Set([
            ...(prev.participantAttendance || []),
            randomParticipant,
          ]),
        ],
        volunteerAttendance: [
          ...new Set([...(prev.volunteerAttendance || []), randomVolunteer]),
        ],
      };
    });
  };

  // Set up interval when component mounts
  useEffect(() => {
    const interval = setInterval(addRandomAttendee, 5000);
    setIntervalId(interval);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [event?.participants, event?.volunteers]);

  if (!event || !event.meetUpLocations) {
    return null; // or some fallback UI
  }

  return (
    <Block safe>
      <ScrollView>
        <View>
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
        </View>

        {/* Add attendance displays */}
        <Block paddingHorizontal={sizes.sm}>
          <Block card marginBottom={sizes.sm}>
            <Text h5 marginBottom={sizes.s}>
              Participants Attended ({event.participantAttendance?.length || 0})
            </Text>
            {event.participantAttendance?.map((participant, index) => (
              <Text key={index} marginBottom={sizes.xs}>
                {participant}
              </Text>
            ))}
          </Block>

          <Block card>
            <Text h5 marginBottom={sizes.s}>
              Volunteers Attended ({event.volunteerAttendance?.length || 0})
            </Text>
            {event.volunteerAttendance?.map((volunteer, index) => (
              <Text key={index} marginBottom={sizes.xs}>
                {volunteer}
              </Text>
            ))}
          </Block>
        </Block>
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
