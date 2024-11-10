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
import { useData, useTheme } from "../hooks/";

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
  published?: boolean;
}

export default function EditEvent() {
  const navigation = useNavigation();
  const { fetchEvents } = useData();
  const [event, setEvent] = useState<Event>();
  const [loading, setLoading] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<string>();
  const [newMeetUpLocation, setMeetUpLocation] = useState<string>();
  const [newParticipantName, setNewParticipantName] = useState<string>();
  const [newParticipantLocation, setNewParticipantLocation] =
    useState<string>();
  const [newParticipantCaregiver, setNewParticipantCaregiver] = useState(false);
  const [newVolunteer, setNewVolunteer] = useState<string>();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showModalItem, setModalItem] = useState(false);
  const [showModalLocation, setModalLocation] = useState(false);
  const [showModalParticipant, setModalParticipant] = useState(false);
  const [showModalVolunteer, setModalVolunteer] = useState(false);
  const { sizes, colors, gradients } = useTheme();

  const route = useRoute();
  const { eventId } = route.params;

  //for popover
  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };
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
      setEvent(mapFirestoreToEvent(event));
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

  const editEventName = (text: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case

      return {
        ...event, // Spread the current event properties
        name: text, // Update the 'information' property
      };
    });
  };

  const editEventLocation = (text: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case

      return {
        ...event, // Spread the current event properties
        location: text, // Update the 'location' property
      };
    });
  };
  const editEventInfo = (text: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case

      return {
        ...event, // Spread the current event properties
        information: text, // Update the 'information' property
      };
    });
  };

  const deleteItem = (deleteItem: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      const filtered = event.itemsToBring?.filter((item) => item != deleteItem);

      return {
        ...event, // Spread the current event properties
        itemsToBring: filtered, // Update the 'information' property
      };
    });
  };

  const onChangeTextAddItem = (text: string) => {
    setNewItem(text);
  };
  const addItem = () => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      if (!newItem) return event;
      const newItems = [...(event.itemsToBring ?? []), newItem];

      return {
        ...event, // Spread the current event properties
        itemsToBring: newItems, // Update the 'information' property
      };
    });
    setNewItem("");
    setModalItem(false);
  };

  const onChangeTextAddLocation = (text: string) => {
    setMeetUpLocation(text);
  };

  const addLocation = () => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      if (!newMeetUpLocation) return event;
      const newLocations = [
        ...(event.meetUpLocations ?? []),
        newMeetUpLocation,
      ];

      return {
        ...event, // Spread the current event properties
        meetUpLocations: newLocations, // Update the 'information' property
      };
    });
    setNewItem("");
    setModalLocation(false);
  };

  const deleteLocation = (deleteLocation: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      const filtered = event.meetUpLocations?.filter(
        (item) => item != deleteLocation
      );

      return {
        ...event, // Spread the current event properties
        meetUpLocations: filtered, // Update the 'information' property
      };
    });
  };

  // const onChangeTextAddParticipant = (text: string) => {
  //   setNewParticipant(text);
  // };

  const addParticipant = () => {
    const newParticipant = `${newParticipantName},${newParticipantLocation},${
      newParticipantCaregiver ? "yes" : "no"
    }`;

    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      if (!newParticipant) return event;
      const newParticipants = [...(event.participants ?? []), newParticipant];

      return {
        ...event, // Spread the current event properties
        participants: newParticipants, // Update the 'information' property
      };
    });
    setNewItem("");
    setModalParticipant(false);
  };

  const deleteParticipant = (deleteParticipant: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      const filtered = event.participants?.filter(
        (item) => item != deleteParticipant
      );

      return {
        ...event, // Spread the current event properties
        participants: filtered, // Update the 'information' property
      };
    });
  };

  const onChangeTextAddVolunteer = (text: string) => {
    setNewVolunteer(text);
  };

  const addVolunteer = () => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      if (!newVolunteer) return event;
      const newVolunteers = [...(event.volunteers ?? []), newVolunteer];

      return {
        ...event, // Spread the current event properties
        volunteers: newVolunteers, // Update the 'information' property
      };
    });
    setNewItem("");
    setModalVolunteer(false);
  };

  const deleteVolunteer = (deleteVolunteer: string) => {
    setEvent((event) => {
      if (!event) return event; // Handle undefined case
      const filtered = event.volunteers?.filter(
        (item) => item != deleteVolunteer
      );

      return {
        ...event, // Spread the current event properties
        volunteers: filtered, // Update the 'information' property
      };
    });
  };
  const changeTime = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowTimePicker(false);
    console.log(selectedTime?.toLocaleDateString());
    console.log(selectedTime?.toLocaleTimeString());
    if (selectedTime) {
      setEvent((event) => {
        if (!event) return event; // Handle undefined case

        return {
          ...event, // Spread the current event properties
          datetime: selectedTime, // Update the 'information' property
        };
      });
    }
  };

  const changeDate = (event: DateTimePickerEvent, selectedDate?: Date) => {
    console.log(selectedDate?.toLocaleDateString());
    console.log(selectedDate?.toLocaleTimeString());

    setShowDatePicker(false);
    if (selectedDate) {
      setEvent((event) => {
        if (!event) return event; // Handle undefined case

        return {
          ...event, // Spread the current event properties
          datetime: selectedDate, // Update the 'information' property
        };
      });
    }
  };

  return (
    <Block safe>
      <Block
        scroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: sizes.padding }}
      >
        {loading ? (
          <Block center>
            <Text p>Loading event details...</Text>
          </Block>
        ) : event ? (
          <Block paddingHorizontal={sizes.padding}>
            {/* Event Basic Details Section */}
            <Block card marginBottom={sizes.sm}>
              <Text h5 semibold marginBottom={sizes.base}>
                Event Details
              </Text>
              <Input
                placeholder="Event Name"
                value={event.name}
                onChangeText={editEventName}
                marginBottom={sizes.sm}
              />
              <Input
                placeholder="Event Location"
                value={event.location}
                onChangeText={editEventLocation}
                marginBottom={sizes.sm}
              />
              <Input
                multiline
                placeholder="Event Information"
                value={event.information}
                onChangeText={editEventInfo}
                marginBottom={sizes.sm}
              />

              {/* Date and Time Pickers */}
              <Block row justify="space-between" marginTop={sizes.sm}>
                <Button
                  flex={1}
                  marginRight={sizes.s}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Block row align="center" justify="center">
                    <Text white semibold>
                      {format(event.datetime, "MMM dd, yyyy")}
                    </Text>
                  </Block>
                </Button>
                <Button flex={1} onPress={() => setShowTimePicker(true)}>
                  <Block row align="center" justify="center">
                    <Text white semibold>
                      {format(event.datetime, "hh:mm a")}
                    </Text>
                  </Block>
                </Button>
              </Block>
              {showDatePicker && (
                <DateTimePicker
                  value={event.datetime}
                  mode="date"
                  display="default"
                  onChange={changeDate}
                />
              )}
              {showTimePicker && (
                <DateTimePicker
                  value={event.datetime}
                  mode="time"
                  display="default"
                  onChange={changeTime}
                />
              )}
            </Block>

            {/* Items to Bring Section */}
            <Block card marginBottom={sizes.sm}>
              <Block row justify="space-between" marginBottom={sizes.sm}>
                <Text h5 semibold>
                  Things to Bring
                </Text>
                <Button onPress={() => setModalItem(true)}>
                  <Text primary semibold>
                    Add Item
                  </Text>
                </Button>
              </Block>
              {event.itemsToBring?.map((item, index) => (
                <Block
                  key={index}
                  card
                  row
                  justify="space-between"
                  align="center"
                  marginBottom={sizes.sm}
                  padding={sizes.s}
                >
                  <Text p>{item}</Text>
                  <Button
                    gradient={gradients.danger}
                    onPress={() => deleteItem(item)}
                  >
                    <Text white bold transform="uppercase">
                      Remove
                    </Text>
                  </Button>
                </Block>
              ))}
            </Block>

            {/* Meet-up Locations Section */}
            <Block card marginBottom={sizes.sm}>
              <Block row justify="space-between" marginBottom={sizes.sm}>
                <Text h5 semibold>
                  Meet-up Locations
                </Text>
                <Button onPress={() => setModalLocation(true)}>
                  <Text primary semibold>
                    Add Location
                  </Text>
                </Button>
              </Block>
              {event.meetUpLocations?.map((location, index) => (
                <Block
                  key={index}
                  card
                  row
                  justify="space-between"
                  align="center"
                  marginBottom={sizes.sm}
                  padding={sizes.s}
                >
                  <Text p>{location}</Text>
                  <Button
                    gradient={gradients.danger}
                    onPress={() => deleteLocation(location)}
                  >
                    <Text white bold transform="uppercase">
                      Remove
                    </Text>
                  </Button>
                </Block>
              ))}
            </Block>

            {/* Participants Section */}
            <Block card marginBottom={sizes.sm}>
              <Block row justify="space-between" marginBottom={sizes.sm}>
                <Text h5 semibold>
                  Participants
                </Text>
                <Button onPress={() => setModalParticipant(true)}>
                  <Text primary semibold>
                    Add Participant
                  </Text>
                </Button>
              </Block>
              {event.participants?.map((participant, index) => {
                const [name, location, caregiver] = participant.split(",");
                return (
                  <Block
                    key={index}
                    card
                    marginBottom={sizes.sm}
                    padding={sizes.sm}
                  >
                    <Text p semibold>
                      {name}
                    </Text>
                    <Text p color={colors.text}>
                      Location: {location}
                    </Text>
                    <Block row justify="space-between" marginTop={sizes.xs}>
                      <Text p color={colors.text}>
                        Caregiver: {caregiver === "yes" ? "Yes" : "No"}
                      </Text>
                      <Button
                        gradient={gradients.danger}
                        onPress={() => deleteParticipant(participant)}
                      >
                        <Text white bold transform="uppercase">
                          Remove
                        </Text>
                      </Button>
                    </Block>
                  </Block>
                );
              })}
            </Block>

            {/* Volunteers Section */}
            <Block card marginBottom={sizes.sm}>
              <Block row justify="space-between" marginBottom={sizes.sm}>
                <Text h5 semibold>
                  Volunteers
                </Text>
                <Button onPress={() => setModalVolunteer(true)}>
                  <Text primary semibold>
                    Add Volunteer
                  </Text>
                </Button>
              </Block>
              {event.volunteers?.map((volunteer, index) => (
                <Block
                  key={index}
                  card
                  row
                  justify="space-between"
                  align="center"
                  marginBottom={sizes.sm}
                  padding={sizes.s}
                >
                  <Text p>{volunteer}</Text>
                  <Button
                    gradient={gradients.danger}
                    onPress={() => deleteVolunteer(volunteer)}
                  >
                    <Text white bold transform="uppercase">
                      Remove
                    </Text>
                  </Button>
                </Block>
              ))}
            </Block>

            {/* Save Button */}
            <Button
              gradient={gradients.primary}
              marginTop={sizes.sm}
              onPress={saveChanges}
            >
              <Text white bold transform="uppercase">
                Save Changes
              </Text>
            </Button>
          </Block>
        ) : (
          <Block center>
            <Text p>Error loading event</Text>
          </Block>
        )}
      </Block>

      {/* Modals */}
      <Modal visible={showModalItem} onRequestClose={() => setModalItem(false)}>
        <Text h5 semibold marginBottom={sizes.sm} color="white">
          Add New Item
        </Text>
        <Input
          placeholder="Enter item name"
          value={newItem}
          onChangeText={onChangeTextAddItem}
          marginBottom={sizes.sm}
        />
        <Button gradient={gradients.primary} onPress={addItem}>
          <Text white bold transform="uppercase">
            Add Item
          </Text>
        </Button>
      </Modal>

      <Modal
        visible={showModalLocation}
        onRequestClose={() => setModalLocation(false)}
      >
        <Text h5 semibold marginBottom={sizes.sm} color="white">
          Add New Location
        </Text>
        <Input
          placeholder="Enter location"
          value={newMeetUpLocation}
          onChangeText={onChangeTextAddLocation}
          marginBottom={sizes.sm}
        />
        <Button gradient={gradients.primary} onPress={addLocation}>
          <Text white bold transform="uppercase">
            Add Location
          </Text>
        </Button>
      </Modal>

      <Modal
        visible={showModalParticipant}
        onRequestClose={() => setModalParticipant(false)}
      >
        <Text h5 semibold marginBottom={sizes.sm} color="white">
          Add New Participant
        </Text>
        <Input
          placeholder="Participant name"
          value={newParticipantName}
          onChangeText={setNewParticipantName}
          marginBottom={sizes.sm}
        />
        <Input
          placeholder="Meet-up location"
          value={newParticipantLocation}
          onChangeText={setNewParticipantLocation}
          marginBottom={sizes.sm}
        />
        <Text p marginRight={sizes.sm} color="white">
          Has Caregiver:
        </Text>
        <Switch
          checked={newParticipantCaregiver}
          onPress={(checked) => setNewParticipantCaregiver(checked)}
        />
        <Button gradient={gradients.primary} onPress={addParticipant}>
          <Text white bold transform="uppercase">
            Add Participant
          </Text>
        </Button>
      </Modal>

      <Modal
        visible={showModalVolunteer}
        onRequestClose={() => setModalVolunteer(false)}
      >
        <Text h5 semibold marginBottom={sizes.sm} color="white">
          Add New Volunteer
        </Text>
        <Input
          placeholder="Enter volunteer name"
          value={newVolunteer}
          onChangeText={setNewVolunteer}
          marginBottom={sizes.sm}
        />
        <Button gradient={gradients.primary} onPress={addVolunteer}>
          <Text white bold transform="uppercase">
            Add Volunteer
          </Text>
        </Button>
      </Modal>
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
