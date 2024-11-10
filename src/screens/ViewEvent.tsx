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
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import { useTheme } from "../hooks/";
import { useContext } from "react"; // Add this import
import { UserContext } from "../hooks/userContext"; // Add this import

import { fetchEvent, updateEvent } from "../../api/event";
import { Block, Button, Image, Product, Switch, Text, Input, Article, EventDetails, Modal } from "../components/";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
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
  published: boolean;
}

export default function ViewEvent() {
  const navigation = useNavigation();
  const [event, setEvent] = useState<Event>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const { sizes, colors, gradients } = useTheme();
  const { identity } = useContext(UserContext);

  const route = useRoute();
  const { eventId } = route.params;

  useEffect(() => {
    fetchEventInfoFromDB();
  }, []);

  const mapFirestoreToEvent = (eventDoc: DocumentData): Event => {
    return {
      name: eventDoc.name,
      location: eventDoc.location,
      information: eventDoc.information,
      datetime: eventDoc.datetime.toDate(),
      meetUpLocations: eventDoc.meetUpLocations || [],
      itemsToBring: eventDoc.itemsToBring || [],
      participants: eventDoc.participants || [],
      volunteers: eventDoc.volunteers || [],
      participantAttendance: eventDoc.participantAttendance || [],
      volunteerAttendance: eventDoc.volunteerAttendance || [],
      published: eventDoc.published,
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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const isUserJoined = () => {
    if (!identity || !event) return false;

    if (identity.type === "Caregiver") {
      return event.participants?.some((participant) => participant.split(",")[0] === identity.name);
    } else if (identity.type === "Volunteer") {
      return event.volunteers?.includes(identity.name);
    }
    return false;
  };

  const handleJoinEvent = async () => {
    if (!identity || !event) return;

    const isCurrentlyJoined = isUserJoined();

    if (isCurrentlyJoined) {
      setIsWithdrawing(true);
      try {
        let updatedEvent = { ...event };

        if (identity.type === "Caregiver") {
          updatedEvent.participants = event.participants?.filter(
            (participant) => participant.split(",")[0] !== identity.name
          );
        } else if (identity.type === "Volunteer") {
          updatedEvent.volunteers = event.volunteers?.filter((volunteer) => volunteer !== identity.name);
        }

        await updateEvent(eventId, updatedEvent);
        setEvent(updatedEvent);
        navigation.goBack();
      } catch (error) {
        console.error("Error withdrawing from event:", error);
      } finally {
        setIsWithdrawing(false);
      }
    } else {
      if (identity.type === "Caregiver" && !selectedLocation) {
        Alert.alert(
          "Location Required",
          "Please select a meet-up location before joining the event",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }]
        );
        return;
      }

      setIsJoining(true);
      try {
        let updatedEvent;
        if (identity.type === "Caregiver") {
          const newParticipant = `${identity.name},${selectedLocation},${caregiverComing ? "yes" : "no"}`;
          updatedEvent = {
            ...event,
            participants: [...(event.participants || []), newParticipant],
          };
        } else if (identity.type === "Volunteer") {
          updatedEvent = {
            ...event,
            volunteers: [...(event.volunteers || []), identity.name],
          };
        }

        if (updatedEvent) {
          await updateEvent(eventId, updatedEvent);
          setEvent(updatedEvent);
          setSelectedLocation("");
          setCaregiverComing(false);
          navigation.goBack();
        }
      } catch (error) {
        console.error("Error joining event:", error);
      } finally {
        setIsJoining(false);
      }
    }
  };

  const [selectedLocation, setSelectedLocation] = useState("");
  const [caregiverComing, setCaregiverComing] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const renderLocationModal = () => {
    return (
      <Modal visible={showLocationModal} onRequestClose={() => setShowLocationModal(false)}>
        <Block
          card
          padding={sizes.padding}
          marginHorizontal={sizes.sm}
          marginVertical={sizes.sm}
          flex={0}
          style={{
            position: "absolute",
            top: "20%",
            left: 0,
            right: 0,
            backgroundColor: colors.card,
            borderRadius: sizes.cardRadius,
            maxHeight: "60%",
          }}
        >
          <Block>
            <Text h5 semibold marginBottom={sizes.sm}>
              Select Meet-up Location
            </Text>
            <Block scroll showsVerticalScrollIndicator={false}>
              {event?.meetUpLocations?.map((location, index) => (
                <Button
                  key={index}
                  marginBottom={sizes.sm}
                  onPress={() => {
                    setSelectedLocation(location);
                    setShowLocationModal(false);
                  }}
                  gradient={gradients.primary}
                >
                  <Text p white>
                    {location}
                  </Text>
                </Button>
              ))}
            </Block>
            <Button marginTop={sizes.sm} onPress={() => setShowLocationModal(false)} gradient={gradients.secondary}>
              <Text p white>
                Cancel
              </Text>
            </Button>
          </Block>
        </Block>
      </Modal>
    );
  };

  return (
    <Block safe>
      <Block scroll showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: sizes.padding }}>
        {loading ? (
          <Block center>
            <Text p>Loading event details...</Text>
          </Block>
        ) : event ? (
          <Block paddingHorizontal={sizes.padding}>
            <Block card marginBottom={sizes.sm}>
              <Text h5 semibold marginBottom={sizes.sm}>
                Event Details
              </Text>
              <Text p bold marginBottom={sizes.sm}>
                {event.name}
              </Text>
              <Text p marginBottom={sizes.sm}>
                Location: {event.location}
              </Text>
              <Text p marginBottom={sizes.sm}>
                {event.information}
              </Text>
              <Text p bold>
                Date: {format(event.datetime, "MMM dd, yyyy")}
              </Text>
              <Text p bold>
                Time: {format(event.datetime, "hh:mm a")}
              </Text>
            </Block>

            <TouchableWithoutFeedback
              onPress={() =>
                navigation.navigate("ItemsPreCheck", {
                  eventId: eventId,
                  thingsToBring: event.itemsToBring,
                })
              }
            >
              <Block card marginBottom={sizes.sm}>
                <Text h5 semibold marginBottom={sizes.sm}>
                  Things to Bring
                </Text>
                {event.itemsToBring?.map((item, index) => (
                  <Block key={index} card marginBottom={sizes.sm} padding={sizes.s}>
                    <Text p>{item}</Text>
                  </Block>
                ))}
              </Block>
            </TouchableWithoutFeedback>

            <Block card marginBottom={sizes.sm}>
              <Text h5 semibold marginBottom={sizes.sm}>
                Meet-up Locations
              </Text>
              {event.meetUpLocations?.map((location, index) => (
                <Block key={index} card marginBottom={sizes.sm} padding={sizes.s}>
                  <Text p>{location}</Text>
                </Block>
              ))}
            </Block>

            {identity?.type === "Caregiver" && !isUserJoined() && (
              <Block card marginBottom={sizes.sm}>
                <Text h5 semibold marginBottom={sizes.sm}>
                  Join Event Form
                </Text>
                <Block marginBottom={sizes.sm}>
                  <Text p semibold color={colors.primary} marginBottom={sizes.sm}>
                    {selectedLocation || "Please select a location below"}
                  </Text>

                  {event?.meetUpLocations?.map((location, index) => (
                    <Button
                      key={index}
                      marginBottom={sizes.xs}
                      onPress={() => setSelectedLocation(location)}
                      gradient={selectedLocation === location ? gradients.success : gradients.light}
                    >
                      <Text p semibold color={selectedLocation === location ? colors.white : colors.dark}>
                        {location}
                      </Text>
                    </Button>
                  ))}
                  {event?.meetUpLocations && event.meetUpLocations.length === 0 && (
                    <Block card padding={sizes.sm} marginTop={sizes.sm} gradient={gradients.danger}>
                      <Text p semibold white align="center">
                        No meet-up locations available
                      </Text>
                    </Block>
                  )}
                </Block>
                <Block row align="center" justify="space-between">
                  <Text p>Is your caregiver coming?</Text>
                  <Switch checked={caregiverComing} onPress={(checked) => setCaregiverComing(checked)} />
                </Block>
              </Block>
            )}

            {renderLocationModal()}

            {identity && (
              <Button
                gradient={gradients?.[isUserJoined() ? "secondary" : "primary"]}
                marginTop={sizes.sm}
                onPress={handleJoinEvent}
                disabled={
                  isJoining || 
                  isWithdrawing || 
                  (!isUserJoined() && identity.type === "Caregiver" && !selectedLocation)
                }
              >
                <Text white bold transform="uppercase">
                  {isJoining
                    ? "Joining..."
                    : isWithdrawing
                    ? "Withdrawing..."
                    : isUserJoined()
                    ? "Withdraw from Event"
                    : "Join Event"}
                </Text>
              </Button>
            )}
          </Block>
        ) : (
          <Block center>
            <Text p>Error loading event</Text>
          </Block>
        )}
      </Block>
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
