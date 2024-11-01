import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/core";
import { useData, useTheme, useTranslation } from "../hooks";
import {
  Block,
  EventDetails,
  EventRecordDetails,
  Text,
} from "../components";
import {
  userJoinEvent,
  staffPublishEvent,
} from "../../api/event";
import { UserContext } from "../hooks/userContext";

const EventRecord = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<{ key: string; name: string; params: { eventId: string, eventDetails: any, userRecord: any } }>();
  const { gradients, sizes } = useTheme();
  const { eventId, eventDetails, userRecord } = route.params;
  // Retrieve rentalId from route parameters
  // const { eventId: string, eventDetails: any, userRecord: any } = route.params;
  const [selectedMeetUpLocation, setSelectedMeetUpLocation] = useState<
    string | null
  >(null);
  const { identity, retrieveIdentity } = useContext(UserContext);
  useEffect(() => {
    console.log("EventId:", eventId);
    console.log("Event Details:", eventDetails);
    console.log("User Record:", userRecord);
  }, []);

  // const handlePublish = async () => {
  //   // const userData = await retrieveIdentity();
  //   // console.log("userData", userData);
  //   try {
  //     const res = await staffPublishEvent(eventId);
  //     console.log(res);
  //     fetchEvents();
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error("Error publishing event:", error);
  //   }
  // };

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
      {/* Header Section */}
      <Block row align="center" justify="space-between" marginLeft={sizes.m}>
        {/* <Text h5 semibold>{t("eventRecords.title")}</Text> */}
        {/* <Icon name="calendar" color={colors.primary} size={sizes.icon} /> */}
      </Block>
      <Block style={{ paddingHorizontal: sizes.padding }}>
        <EventDetails
          {...eventDetails}
          onSelectMeetUpLocation={setSelectedMeetUpLocation}
        />
      </Block>
      <Block style={{ paddingHorizontal: sizes.padding }} >  
        <EventRecordDetails {...userRecord} />
      </Block>
    </Block>
  );
};

export default EventRecord;
