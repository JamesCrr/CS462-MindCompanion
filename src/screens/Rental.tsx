import React, {useEffect, useState} from 'react';
import {useNavigation, useRoute} from '@react-navigation/core';

import {IArticleOptions} from '../constants/types';
import {useData, useTheme, useTranslation} from '../hooks/';
import {Block, Button, Image, Product, Text, Article, EventDetails} from '../components/';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userJoinEvent } from '../../api/event';

const Rental = () => {
  const {article} = useData();
  const {t} = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const {gradients, sizes} = useTheme();
  // const [optionId, setOptionId] = useState<IArticleOptions['id']>(0);

  // Retrieve rentalId from route parameters
  const {eventId} = route.params;
  const [selectedMeetUpLocation, setSelectedMeetUpLocation] = useState<string | null>(null);


  const retrieveIdentity = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) {
        throw new Error("User not found");
      }
      return userData;
    } catch (e) {
      console.error(e);
    }
  };


  const handleRegister = async () => {
    const userData = await retrieveIdentity();
    console.log("userData", userData);
    const email = userData ? JSON.parse(userData).email : '';
    console.log("email", email);
    console.log("selectedMeetUpLocation", selectedMeetUpLocation);
    if (selectedMeetUpLocation) {
      await userJoinEvent(eventId, email, selectedMeetUpLocation, "yes");
      // Handle the registration logic here
    } else {
      console.log('Please select a meetup location.');
    }
  };



  // init with optionId = 0
  useEffect(() => {
    // setOptionId(article?.options?.[0]?.id);
    // console.log("optionId", optionId);
    console.log("eventId", eventId);
  }, [article]);

  const CARD_WIDTH = sizes.width - sizes.s;
  const hasSmallScreen = sizes.width < 414; // iPhone 11
  const SNAP_OFFSET = CARD_WIDTH - (hasSmallScreen ? 28 : 19) + sizes.s;

  return (
    <Block  
      scroll
      nestedScrollEnabled
      paddingVertical={sizes.padding}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{paddingBottom: sizes.padding * 1.5}}>
      <Block
        style={{paddingHorizontal: sizes.padding}}
      >
      <EventDetails {...article} onSelectMeetUpLocation={setSelectedMeetUpLocation} />
      </Block>
      {/* rentals recomendations */}
      <Block paddingHorizontal={sizes.sm} marginTop={sizes.sm}>
        <Button
          gradient={gradients.primary}
          onPress={() => handleRegister()}
          >
          <Text white bold transform="uppercase">
            {t('event.joinEvent')}
          </Text>
        </Button>
      </Block>
    </Block>
  );
};

export default Rental;