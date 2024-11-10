import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/core";
import { format } from "date-fns";

import { IArticleOptions } from "../constants/types";
import { useData, useTheme, useTranslation } from "../hooks/";
import {
  Block,
  Button,
  Image,
  Product,
  Text,
  Article,
  EventDetails,
} from "../components/";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  userJoinEvent,
  staffPublishEvent,
  staffDeleteEvent,
} from "../../api/event";
import { UserContext } from "../hooks/userContext";

const Rental = () => {
  const { article, fetchEvents } = useData();
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { gradients, sizes } = useTheme();
  const { eventId } = route.params;
  const [selectedMeetUpLocation, setSelectedMeetUpLocation] = useState<string | null>(null);
  const { identity } = useContext(UserContext);

  useEffect(() => {
    if (!article) {
      // If article is not available in state, fetch it
      const fetchEventData = async () => {
        try {
          const eventDoc = await fetchEvent(eventId);
          if (eventDoc) {
            const formattedEvent = {
              id: eventId,
              title: eventDoc.name,
              location: eventDoc.location,
              information: eventDoc.information,
              dateTime: format(eventDoc.datetime.toDate(), "MMM dd, yyyy hh:mm a"),
              meetUpLocations: eventDoc.meetUpLocations || [],
              itemsToBring: eventDoc.itemsToBring || [],
              participants: eventDoc.participants || [],
              volunteers: eventDoc.volunteers || [],
              published: eventDoc.published
            };
            handleArticle(formattedEvent);
          }
        } catch (error) {
          console.error("Error fetching event:", error);
        }
      };
      fetchEventData();
    }
  }, [eventId]);

  const handleRegister = async () => {
    const uid = identity ? JSON.parse(identity).uid : "";
    console.log("email", uid);
    console.log("selectedMeetUpLocation", selectedMeetUpLocation);
    if (selectedMeetUpLocation) {
      await userJoinEvent(eventId, uid, selectedMeetUpLocation, "yes");
    } else {
      console.log("Please select a meetup location.");
    }
  };

  const handlePublish = async () => {
    if (article.published) return;
    try {
      const res = await staffPublishEvent(eventId);
      fetchEvents();
      navigation.goBack();
    } catch (error) {
      console.error("Error publishing event:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await staffDeleteEvent(eventId);
      console.log(res);
      fetchEvents();
      navigation.goBack();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const CARD_WIDTH = sizes.width - sizes.s;
  const hasSmallScreen = sizes.width < 414; // iPhone 11
  const SNAP_OFFSET = CARD_WIDTH - (hasSmallScreen ? 28 : 19) + sizes.s;

  return (
    <Block
      scroll
      nestedScrollEnabled
      paddingVertical={sizes.padding}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: sizes.padding * 1.5 }}
    >
      <Block style={{ paddingHorizontal: sizes.padding }}>
        <EventDetails
          {...article}
          onSelectMeetUpLocation={setSelectedMeetUpLocation}
        />
      </Block>
      {/* rentals recomendations */}
      <Block paddingHorizontal={sizes.sm} marginTop={sizes.sm}>
        {/* <Button gradient={gradients.primary} onPress={() => handleRegister()}>
          <Text white bold transform="uppercase">
            {t("event.joinEvent")}
          </Text>
        </Button> */}
      </Block>
      <Block paddingHorizontal={sizes.sm} marginTop={sizes.sm}>
        <Button
          gradient={gradients.primary}
          disabled={article.published}
          onPress={() => handlePublish()}
        >
          <Text white bold transform="uppercase">
            {t("event.publish")}
          </Text>
        </Button>
      </Block>
      <Block
        paddingHorizontal={sizes.sm}
        row
        justify="space-between"
        marginVertical={sizes.sm}
      >
        <Button
          flex={1}
          gradient={gradients.dark}
          marginHorizontal={sizes.s}
          onPress={() =>
            navigation.navigate("EditEvent", {
              eventId: eventId,
            })
          }
        >
          <Text white bold transform="uppercase" marginHorizontal={sizes.s}>
            Edit
          </Text>
        </Button>
        <Button
          flex={1}
          gradient={gradients.dark}
          marginHorizontal={sizes.s}
          onPress={() => handleDelete()}
        >
          <Text white bold transform="uppercase" marginHorizontal={sizes.s}>
            Delete
          </Text>
        </Button>
      </Block>
      <Block paddingHorizontal={sizes.sm} marginTop={sizes.sm}>
        <Button
          gradient={gradients.primary}
          onPress={() =>
            navigation.navigate("StaffAttendanceLocations", {
              eventId: eventId,
            })
          }
        >
          <Text white bold transform="uppercase">
            {t("event.takeAttendance")}
          </Text>
        </Button>
      </Block>
    </Block>
  );
};

export default Rental;
