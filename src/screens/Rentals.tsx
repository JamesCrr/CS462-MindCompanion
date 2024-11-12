import React, { useCallback, useEffect, useState, useContext } from "react";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/core";

import { useData, useTheme, useTranslation } from "../hooks/";
import { UserContext } from "../hooks/userContext";
import { IArticle, IEvent2 } from "../constants/types";
import { Block, Button, Input, Image, Article, Text, MainCalendar } from "../components/";
import CaregiverCalendarView from "../components/CaregiverCalendarView";

const RentalHeader = ({ viewMode, onToggleView }) => {
  const { t } = useTranslation();
  const { identity } = useContext(UserContext);
  const { assets, gradients, sizes } = useTheme();
  const navigation = useNavigation();

  const handleViewToggle = () => {
    if (viewMode === 'list') {
      if (identity?.type === "Staff") {
        navigation.navigate("StaffCalendar");
      } else {
        navigation.navigate("CaregiverCalendar");
      }
    } else {
      onToggleView();
    }
  };

  return (
    <>
      <Block
        row
        flex={0}
        align="center"
        justify="space-around"
        padding={sizes.xs}
      >
      </Block>
      <Block row flex={0} align="center" justify="space-between">
        <Text h5 semibold>
          {viewMode === 'list' ? 'Our Events' : 'Calendar View'}
        </Text>
        <Button onPress={handleViewToggle}>
          <Text p primary semibold>
            {viewMode === 'list' ? 'View Calendar' : 'View Events'}
          </Text>
        </Button>
      </Block>
    </>
  );
};

const EventsList = ({ events, handleRental, sizes }) => {
  return (
    <FlatList
      data={events}
      showsVerticalScrollIndicator={false}
      keyExtractor={(item) => `${item?.id}`}
      style={{ paddingHorizontal: sizes.padding }}
      contentContainerStyle={{ paddingBottom: sizes.l }}
      renderItem={({ item }) => (
        <Article {...item} onPress={() => handleRental(item)} />
      )}
    />
  );
};

const Rentals = () => {
  const data = useData();
  const { t } = useTranslation();
  const { handleArticle } = data;
  const { identity } = useContext(UserContext);
  const navigation = useNavigation();
  const { colors, sizes } = useTheme();
  const [notFound, setNotFound] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
  const [events, setEvents] = useState<IEvent2[]>([]);

  // init events list
  useEffect(() => {
    console.log("view mode:", viewMode);
    setEvents(data?.events);

  }, [data?.events]);

  const handleRental = useCallback(
    (article: IEvent2) => {
      handleArticle(article);
      navigation.navigate("Rental", { eventId: article.id });
    },
    [handleArticle, navigation]
  );

  const handleToggleView = () => {
    setViewMode(prev => prev === 'list' ? 'calendar' : 'list');
  };

  return (
    <Block>
      {/* Header */}
      <Block flex={0} marginHorizontal={sizes.m} paddingHorizontal={sizes.s}>
        <RentalHeader viewMode={viewMode} onToggleView={handleToggleView} />
      </Block>

      {/* Not found message */}
      {/* {notFound && (
        <Block flex={0} padding={sizes.padding}>
          <Text p>
            {t("rentals.notFound1")}"
            <Text p bold>
              {search}
            </Text>
            "{t("rentals.notFound2")}
          </Text>
          <Text p marginTop={sizes.s}>
            {t("rentals.moreOptions")}
          </Text>
        </Block>
      )} */}

      {/* Content */}
      <Block flex={1}>
        {viewMode === 'list' ? (
          <EventsList 
            events={events}
            handleRental={handleRental}
            sizes={sizes}
          />
        ) : (
          // Replace this comment with your Calendar component
          // <MainCalendar events={events} onEventPress={handleRental} />
          // <Text>Calendar View - Replace with your calendar component</Text>
          <CaregiverCalendarView />
        )}
      </Block>
    </Block>
  );
};

export default Rentals;
