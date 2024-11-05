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

import { deleteEventRecord, addNewEventRecord } from "../../api/eventRecords";
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
      // Withdrawal logic remains the same
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

        await deleteEventRecord(eventId, identity.name);

        setEvent(updatedEvent);
      } catch (error) {
        console.error("Error withdrawing from event:", error);
      } finally {
        setIsWithdrawing(false);
      }
    } else {
      // Modified join logic with custom alert
      if (identity.type === "Caregiver" && !selectedLocation) {
        Alert.alert(
          "Location Required", // Title of the alert
          "Please select a meet-up location before joining the event", // Message of the alert
          [{ text: "OK", onPress: () => console.log("OK Pressed") }] // Button configuration
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
          await addNewEventRecord(eventId, identity.name);
          setEvent(updatedEvent);
          // Reset form after successful join
          setSelectedLocation("");
          setCaregiverComing(false);
        }
      } catch (error) {
        console.error("Error joining event:", error);
      } finally {
        setIsJoining(false);
      }
    }
  };

  // Add these state variables after the existing ones
  const [selectedLocation, setSelectedLocation] = useState("");
  const [caregiverComing, setCaregiverComing] = useState(false); // Default to false (not checked)
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Update the renderLocationModal function
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
            {/* Event Basic Details Section */}
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

            {/* Items to Bring Section */}
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

            {/* Meet-up Locations Section */}
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

            {/* Participants Section */}
            <Block card marginBottom={sizes.sm}>
              <Text h5 semibold marginBottom={sizes.sm}>
                Participants
              </Text>
              {event.participants?.map((participant, index) => {
                const [name, location, caregiver] = participant.split(",");
                return (
                  <Block key={index} card marginBottom={sizes.sm} padding={sizes.sm}>
                    <Text p semibold>
                      {name}
                    </Text>
                    <Text p color={colors.text}>
                      Location: {location}
                    </Text>
                    <Text p color={colors.text}>
                      Caregiver: {caregiver === "yes" ? "Yes" : "No"}
                    </Text>
                  </Block>
                );
              })}
            </Block>

            {/* Volunteers Section */}
            <Block card marginBottom={sizes.sm}>
              <Text h5 semibold marginBottom={sizes.sm}>
                Volunteers
              </Text>
              {event.volunteers?.map((volunteer, index) => (
                <Block key={index} card marginBottom={sizes.sm} padding={sizes.s}>
                  <Text p>{volunteer}</Text>
                </Block>
              ))}
            </Block>

            {/* Join Event Form */}
            {identity?.type === "Caregiver" && !isUserJoined() && (
              <Block card marginBottom={sizes.sm}>
                <Text h5 semibold marginBottom={sizes.sm}>
                  Join Event Form
                </Text>
                <Block marginBottom={sizes.sm}>
                  <Text p semibold color={colors.primary} marginBottom={sizes.sm}>
                    {selectedLocation || "Please select a location below"}
                  </Text>

                  {/* Location Options */}
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

            {/* Join/Withdraw Event Button */}
            {identity && (
              <Button
                gradient={gradients?.[isUserJoined() ? "secondary" : "primary"]}
                marginTop={sizes.sm}
                onPress={handleJoinEvent}
                disabled={isJoining || isWithdrawing || selectedLocation == ""}
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
