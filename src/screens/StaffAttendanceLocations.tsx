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

export default function StaffAttendanceLocations() {
  const navigation = useNavigation();
  const [event, setEvent] = useState<Event>();
  const [loading, setLoading] = useState<boolean>(false);
  const { assets, colors, gradients, sizes } = useTheme();

  useState<string>();

  const route = useRoute();
  const { eventId } = route.params;

  // The route parameter, An optional search parameter.

  useEffect(() => {
    fetchEventInfoFromDB();
  }, []);

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

  if (!event || !event.meetUpLocations) {
    return null; // or some fallback UI
  }

  return (
    <Block safe marginTop={sizes.mdd}>
      <View>
        {event.meetUpLocations?.map((location, index) => (
          <Button
            key={index}
            flex={1}
            gradient={gradients.info}
            marginBottom={sizes.sm}
            onPress={() =>
              navigation.navigate("StaffAttendanceLocation", {
                eventId: eventId,
                location: location,
              })
            }
            marginHorizontal={sizes.sm}
          >
            <Text bold transform="uppercase">
              {location}
            </Text>
          </Button>
        ))}
      </View>
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
