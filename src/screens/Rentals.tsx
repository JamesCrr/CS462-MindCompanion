import React, { useCallback, useEffect, useState, useContext } from "react";
import { FlatList } from "react-native";
import { useNavigation } from "@react-navigation/core";

import { useData, useTheme, useTranslation } from "../hooks/";
import { UserContext } from "../hooks/userContext";
import { IArticle, IEvent2 } from "../constants/types";
import { Block, Button, Input, Image, Article, Text, MainCalendar } from "../components/";

const RentalHeader = () => {
  const { t } = useTranslation();
  const { assets, gradients, sizes } = useTheme();
  const [viewCalendar, setViewCalendar] = useState(false);
  const navigation = useNavigation();
  const { identity } = useContext(UserContext);

  const changeView = () => {
    if (identity["type"] == "Caregiver") {
      navigation.navigate("CaregiverCalendar");
    } else {
      navigation.navigate("StaffCalendar");
    }
  };

  return (
    <>
      <Block row flex={0} align="center" justify="space-around" marginVertical={sizes.s}>
        {/* <Block flex={0}>
          <Button
            flex={0}
            gradient={gradients.primary}
            radius={sizes.socialRadius}>
            <Image source={assets.flight} radius={0} />
          </Button>
          <Text center marginTop={sizes.s} semibold>
            {t('rentals.flight')}
          </Text>
        </Block>
        <Block flex={0}>
          <Button
            flex={0}
            gradient={gradients.info}
            radius={sizes.socialRadius}>
            <Image source={assets.hotel} radius={0} />
          </Button>
          <Text center marginTop={sizes.s} semibold>
            {t('rentals.hotel')}
          </Text>
        </Block>
        <Block flex={0}>
          <Button
            flex={0}
            gradient={gradients.warning}
            radius={sizes.socialRadius}>
            <Image source={assets.train} radius={0} />
          </Button>
          <Text center marginTop={sizes.s} semibold>
            {t('rentals.train')}
          </Text>
        </Block>
        <Block flex={0}>
          <Button
            flex={0}
            gradient={gradients.dark}
            radius={sizes.socialRadius}>
            <Image source={assets.more} radius={0} />
          </Button>
          <Text center marginTop={sizes.s} semibold>
            {t('common.more')}
          </Text>
        </Block> */}
      </Block>
      <Block row flex={0} align="center" justify="space-between">
        <Text h5 semibold>
          {/* {t('common.recommended')} */}
          Our Events
        </Text>
        <Button>
          {/* <Text p primary semibold>
            {t('common.viewall')}
          </Text> */}
          <Text p primary semibold onPress={changeView}>
            View Calendar
          </Text>
        </Button>
      </Block>
    </>
  );
};

const Rentals = () => {
  const data = useData();
  const { t } = useTranslation();
  const { handleArticle } = data;
  const navigation = useNavigation();
  const { colors, sizes } = useTheme();
  const [notFound, setNotFound] = useState(false);

  const [search, setSearch] = useState("");
  // const [recommendations, setRecommendations] = useState<IArticle[]>([]);
  const [events, setEvents] = useState<IEvent2[]>([]);

  // init recommendations list
  useEffect(() => {
    // setRecommendations(data?.recommendations);
    setEvents(data?.events);
  }, [data?.events]);

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

      {/* rentals list */}
      <FlatList
        data={events}
        // stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => `${item?.id}`}
        ListHeaderComponent={() => <RentalHeader />}
        style={{ paddingHorizontal: sizes.padding }}
        contentContainerStyle={{ paddingBottom: sizes.l }}
        renderItem={({ item }) => <Article {...item} onPress={() => handleRental(item)} />}
      />
    </Block>
  );
};

export default Rentals;
