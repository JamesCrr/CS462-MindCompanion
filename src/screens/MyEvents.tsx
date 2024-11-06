import React, { useCallback, useEffect, useState } from "react";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/core";

import { useData, useTheme, useTranslation } from "../hooks";
import { IArticle, IEvent2 } from "../constants/types";
import { Block, Button, Input, Image, Article, Text, MyEventCard, MainCalendar } from "../components";
import { useContext } from "react";
import { UserContext } from "../hooks/userContext";
import { fetchAllEventsOfUser } from "../../api/event";

const RentalHeader = () => {
  const { t } = useTranslation();
  const { assets, gradients, sizes } = useTheme();
  return (
    <>
      <Block row flex={0} align="center" justify="space-around" marginVertical={sizes.s}></Block>
      <Block row flex={0} align="center" justify="space-between">
        <Text h5 semibold>
          {/* {t('common.recommended')} */}
          My Events
        </Text>
        <Button>
          {/* <Text p primary semibold>
            {t('common.viewall')}
          </Text> */}
          <Text p primary semibold>
            View Calendar
          </Text>
        </Button>
      </Block>
    </>
  );
};

const MyEvents = () => {
  const data = useData();
  const { t } = useTranslation();
  const { handleArticle } = data;
  const navigation = useNavigation();
  const { colors, sizes } = useTheme();
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");

  const { identity, retrieveIdentity } = useContext(UserContext);
  // const [recommendations, setRecommendations] = useState<IArticle[]>([]);
  const [events, setEvents] = useState<IEvent2[]>([]);

  // init recommendations list
  useEffect(() => {
    // setRecommendations(data?.recommendations);
    fetchEvents();
    // setEvents(data?.events);
  }, [data?.events]);

  const fetchEvents = async () => {
    // setLoading(true);
    try {
      console.log("identity", identity.uid);
      const fetchedEvents = await fetchAllEventsOfUser(identity.uid);
      console.log("fetchedEvents", fetchedEvents);
      if (fetchedEvents == null) {
        console.log("Failed to fetch events");
        throw new Error("Failed to fetch events");
      } else {
        setEvents(fetchedEvents);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      // setLoading(false);
    }
  };

  const handleRental = useCallback(
    (article: IEvent2) => {
      handleArticle(article);
      navigation.navigate("Rental", { eventId: article.id });
    },
    [handleArticle, navigation]
  );

  const handleSearch = useCallback(() => {
    setNotFound(true);
  }, [setNotFound]);

  return (
    <Block>
      {/* search input */}
      {/* <Block color={colors.card} flex={0} padding={sizes.padding}>
        <Input
          search
          returnKeyType="search"
          placeholder={t('common.search')}
          onFocus={() => setNotFound(false)}
          onSubmitEditing={() => handleSearch()}
          onChangeText={(text) => setSearch(text)}
        />
      </Block> */}

      {/* not found */}
      {notFound && (
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
      )}
      <MainCalendar />
      {/* rentals list */}
    </Block>
  );
};

export default MyEvents;
