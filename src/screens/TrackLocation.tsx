import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import Geocoder from "react-native-geocoding";
import { useNavigation, useRoute } from "@react-navigation/core";
import { DocumentData } from "firebase/firestore";
import { useData, useTheme, useTranslation } from "../hooks";
import { Block, Text, Checkbox } from "../components";
import { UserContext } from "../hooks/userContext";
import { fetchEvent } from "../../api/event";
import { getAllUsers } from "../../api/users";

// Initialize the geocoder with your Google Maps API key
Geocoder.init("AIzaSyANdSwW4wICVd0GxxLcFozyFyR63DFaq9k");

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

const TrackLocation = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { gradients, sizes } = useTheme();
  const { identity } = useContext(UserContext);
  const [event, setEvent] = useState<Event>();
  const [users, setUsers] = useState<Array<any>>();
  const [mapRegion, setMapRegion] = useState<any>();
  const [loading, setLoading] = useState<boolean>(false);
  const { eventId } = route.params;

  const CARD_WIDTH = sizes.width - sizes.s;
  const hasSmallScreen = sizes.width < 414; // iPhone 11
  const SNAP_OFFSET = CARD_WIDTH - (hasSmallScreen ? 28 : 19) + sizes.s;

  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
  const styles = StyleSheet.create({
    container: {
      // ...StyleSheet.absoluteFillObject,
      height: 500,
      width: 400,
      justifyContent: "flex-end",
      alignItems: "center",
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
  });

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

  // Fetch all locations of participants of event
  const fetchLocations = async () => {
    setLoading(true);

    // Fetch Event
    let fetchedEvent = null;
    try {
      fetchedEvent = await fetchEvent(eventId);
      if (fetchedEvent == null) {
        throw new Error("");
      }
      setEvent(mapFirestoreToEvent(fetchedEvent));
      // console.log(fetchedEvent);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
      return;
    }

    // Fetch location of evnet
    try {
      const json = await Geocoder.from(fetchedEvent["location"]);
      const location = json.results[0].geometry.location;
      setMapRegion({
        latitude: location.lat,
        longitude: location.lng,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    } catch (error) {
      console.error("Geocoding error:", error);
      return;
    }

    // Fetch Locations of participants
    let foundUsers = [];
    try {
      const fetchedUsers = await getAllUsers();
      for (let parStr of fetchedEvent["participants"]) {
        const parDetails = parStr.split(",");
        for (let u of fetchedUsers) {
          if (u["name"] == parDetails[0]) {
            u["coords"]["jsdatetime"] = u["coords"]["updatedAt"].toDate();
            u["coords"]["checked"] = true;
            foundUsers.push(u);
          }
        }
      }
    } catch (error) {
      console.error(error);
      return;
    }

    // console.log(foundUsers);
    setUsers(foundUsers);
    setLoading(false);
  };

  // Toggle visibility of participant on map
  const toggleVisibilityOnMap = (index: any) => {
    if (index >= users?.length) return;

    setUsers((prev) => {
      let newlist = [...prev];
      newlist[index]["coords"]["checked"] = !newlist[index]["coords"]["checked"];
      return newlist;
    });
  };

  useEffect(() => {
    fetchLocations();
  }, [eventId]);

  return (
    <Block
      scroll
      nestedScrollEnabled
      // paddingVertical={sizes.padding}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: sizes.padding * 1.5 }}
    >
      {loading ? (
        <Block flex={1} center justify="center" align="center">
          <Text h4 bold>
            Loading...
          </Text>
        </Block>
      ) : (
        <Block>
          <View style={styles.container}>
            <MapView
              provider={PROVIDER_GOOGLE} // remove if not using Google Maps
              style={styles.map}
              region={{
                latitude: 1.2979129,
                longitude: 103.8491567,
                latitudeDelta: 0.015,
                longitudeDelta: 0.0121,
              }}
            >
              {users &&
                users.map((item, index) => {
                  if (!item["coords"]["checked"]) return <View key={index}></View>;
                  return (
                    <Marker
                      key={index}
                      title={item["name"]}
                      coordinate={{
                        latitude: item["coords"]["lat"],
                        longitude: item["coords"]["long"],
                      }}
                    />
                  );
                })}
            </MapView>
          </View>
          <Block marginHorizontal={sizes.sm} marginTop={sizes.sm}>
            {users &&
              users.map((item, index) => {
                return (
                  <Block key={index} card marginBottom={sizes.sm}>
                    <Block row justify="space-between" align="center">
                      <Checkbox checked={item["coords"]["checked"]} onPress={() => toggleVisibilityOnMap(index)} />
                      <Text h5 semibold primary={item["coords"]["checked"]} gray={!item["coords"]["checked"]}>
                        {item["name"]}
                      </Text>
                    </Block>
                    <Block row justify="space-between" align="center">
                      <Text p gray={!item["coords"]["checked"]}>
                        Last updated at:
                      </Text>
                      <Text p gray={!item["coords"]["checked"]}>
                        {item["coords"]["jsdatetime"].toLocaleString()}
                      </Text>
                    </Block>
                  </Block>
                );
              })}
          </Block>
        </Block>
      )}
    </Block>
  );
};

export default TrackLocation;
