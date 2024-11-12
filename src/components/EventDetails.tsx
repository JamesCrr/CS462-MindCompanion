import React, { useState } from "react";
import dayjs from "dayjs";
import { TouchableWithoutFeedback, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Text from "./Text";
import Block from "./Block";
import Image from "./Image";
import { useNavigation } from "@react-navigation/native";
import { useTheme, useTranslation } from "../hooks/";
import { IArticle, IEvent2 } from "../constants/types";
import { userJoinEvent } from "../../api/event";
import { Button } from "../components/";

interface EventDetailsProp extends IEvent2 {
  onSelectMeetUpLocation: (location: string) => void;
}

const EventDetails = ({
  id,
  title,
  // description,
  information,
  image,
  category,
  // rating,
  location,
  dateTime,
  thingsToBring,
  meetUpLocations,
  participants,
  volunteers,
  timestamp,
  // user,
  leaveFeedback,
  onPress,
  onSelectMeetUpLocation,
}: any) => {
  const { t } = useTranslation();
  const navigation = useNavigation();

  image = "https://images.unsplash.com/photo-1604998103924-89e012e5265a?fit=crop&w=450&q=80";
  const { colors, gradients, icons, sizes } = useTheme();
  const [selectedMeetUpLocation, setSelectedMeetUpLocation] = useState<string | null>(null);

  const handleMeetUpLocationSelect = (location: string) => {
    setSelectedMeetUpLocation(location);
    onSelectMeetUpLocation(location); // Call the function to pass the selected location to Rental
  };

  const handleThingsToBringPress = () => {
    console.log("Things to bring:", thingsToBring);
    navigation.navigate("ItemsPreCheck", { eventId: id, thingsToBring });
  };

  const handleNavigateParticipants = () => {
    navigation.navigate("Participants", { eventId: id, participants }); 
  }



  // render card for Newest & Fashion
  if (category?.id !== 1) {
    console.log("EventId:", id);
    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <Block card padding={sizes.sm} marginTop={sizes.sm}>
          <Image height={170} resizeMode="cover" source={{ uri: image }} />
          {/* article description */}
          <Text p semibold paddingTop={sizes.s} paddingBottom={sizes.s}>
            {title}
          </Text>
          {information && (
            <Text p marginTop={sizes.s} marginLeft={sizes.xs} marginBottom={sizes.sm}>
              {information}
            </Text>
          )}

          {Array.isArray(thingsToBring) && thingsToBring.length > 0 && (
            <TouchableWithoutFeedback onPress={handleThingsToBringPress}>
              <Block justify="center" paddingBottom={sizes.s}>
                <Text semibold>Things to Bring:</Text>
                {thingsToBring.map((item, index) => (
                  <Text key={index}>{`${index + 1}. ${item}`}</Text>
                ))}
              </Block>
            </TouchableWithoutFeedback>
          )}

          {Array.isArray(meetUpLocations) && meetUpLocations.length > 0 && (
            <Block justify="flex-start" paddingBottom={sizes.s}>
              <Text semibold>Meet Up Locations</Text>
              {meetUpLocations.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleMeetUpLocationSelect(item)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: sizes.xs,
                    maxWidth: 250, // Set a maximum width
                  }}
                >
                  <Block
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: sizes.xs,
                    }}
                  >
                    <Block
                      style={{
                        height: 20,
                        width: 20,
                        maxWidth: 20,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: colors.black,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: sizes.xs,
                      }}
                    >
                      {selectedMeetUpLocation === item && (
                        <Block
                          style={{
                            height: 10,
                            width: 10,
                            borderRadius: 5,
                            backgroundColor: colors.black,
                          }}
                        />
                      )}
                    </Block>
                    <Text>{`${index + 1}. ${item}`}</Text>
                  </Block>
                </TouchableOpacity>
              ))}
            </Block>
          )}

          {Array.isArray(participants) && participants.length > 0 && (
            <Block justify="center" paddingBottom={sizes.s}>
                {leaveFeedback ? (
                  <Text semibold>No of Participants: {participants.length}</Text>
                ) : (
                  <Button
                    style={{
                      backgroundColor: colors.gray, // Set the button fill color to light grey
                      padding: sizes.sm,
                      borderRadius: sizes.cardRadius,
                      borderWidth: 1, // Add border width
                      borderColor: colors.black,
                    }}
                    onPress={handleNavigateParticipants}
                  >
                    <Text semibold>No of Participants: {participants.length}</Text>
                  </Button>
                )}
            </Block>
          )}

          {/* location & rating */}
          {(Boolean(location) || Boolean(dateTime)) && (
            <Block wrap="wrap" row align="center">
              <Block row align="center">
                <Image source={icons.location} marginRight={sizes.s} />
                <Text p size={12} semibold>
                  {location}
                </Text>
              </Block>
              {/* <Text p bold marginHorizontal={sizes.s}></Text> */}
              <Block row align="center">
                <Image source={icons.star} marginRight={sizes.s} />
                <Text p size={12} semibold>
                  {typeof dateTime === "string" ? dateTime : dayjs(new Date(dateTime)).format("MMM dd, yyyy hh:mm a")}
                </Text>
              </Block>
            </Block>
          )}
        </Block>
      </TouchableWithoutFeedback>
    );
  }
};

export default EventDetails;
