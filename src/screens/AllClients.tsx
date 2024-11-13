import React, {useCallback, useEffect, useState} from 'react';

import {Block, Button, Image, Modal, Text} from '../components';
import {useTheme, useTranslation} from '../hooks';
import {EXTRAS} from '../constants/mocks';
import {IExtra} from '../constants/types';
import {FlatList} from 'react-native';
import dayjs from 'dayjs';
import {useNavigation, useRoute}  from '@react-navigation/native';
import {RouteProp} from '@react-navigation/native';
import { getAllUsers } from '../../api/users';
import { fetchEventRecordUsingParticipantName } from '../../api/eventRecords';
import { fetchEvent, fetchEventById } from '../../api/event';

interface IParticipantsRoute {
  route: RouteProp<{params: {eventId?: number, participants?: any[]}}, 'params'>;
}


const Client = ({
  id,
  name,
  image,
  available,
  onLeaveFeedback,
  // onBook,
  // onSave,
  // onTimeSelect,
}: any) => {
  const {t} = useTranslation();
  const {assets, colors, gradients, sizes} = useTheme();

  useEffect(() => {
    console.log("Client Info", id, name, image);
  }, []);
  
  return (
    <Block card align="center" padding={sizes.sm} marginTop={sizes.base * 8}>
      <Image source={image} height={100} marginTop={-50} />
      <Text p semibold marginTop={sizes.sm} marginBottom={sizes.xs}>
        {name}
      </Text>
      <Text
        p
        bold
        transform="uppercase"
        success={available}
        danger={!available}>
        {t(`extras.${available ? 'unavailable' : 'available'}`)}
      </Text>
      <Block row justify="space-evenly" marginTop={sizes.sm}>
        {/* <Button
          flex={0.5}
          gradient={gradients.secondary}
          onPress={() => onTimeSelect?.(id)}>
          <Block
            row
            align="center"
            justify="space-between"
            paddingHorizontal={sizes.sm}>
            <Text bold white transform="uppercase" marginRight={sizes.sm}>
              {time}
            </Text>
            <Image
              source={assets.arrow}
              color={colors.white}
              transform={[{rotate: '90deg'}]}
            />
          </Block>
        </Button>
        <Button
          flex={1}
          onPress={() => onSave?.()}
          marginHorizontal={sizes.s}
          gradient={saved ? gradients.success : gradients.secondary}>
          <Text bold white transform="uppercase" marginHorizontal={sizes.s}>
            {t(saved ? 'extras.saved' : 'extras.save')}
          </Text>
        </Button>
        <Button
          flex={0.5}
          disabled={!available}
          onPress={() => onBook?.()}
          gradient={booked ? gradients.success : gradients.primary}>
          <Text bold white transform="uppercase" marginHorizontal={sizes.sm}>
            {t(booked ? 'extras.booked' : 'extras.book')}
          </Text>
        </Button> */}
        <Button
          flex={0.5}
          // disabled={!available}
          onPress={() => onLeaveFeedback?.()}
          marginHorizontal={sizes.s}
          gradient={gradients.primary}>
          <Text bold white transform="uppercase" marginHorizontal={sizes.sm}>
            {/* {t(booked ? 'extras.booked' : 'extras.book')} */}
            {t('eventParticipants.viewFeedback')}
          </Text>
        </Button>
        {/* <Button
          flex={0.5}
          onPress={() => onViewItemsToBring?.()}
          gradient={gradients.primary}>
          <Text bold white transform="uppercase" marginHorizontal={sizes.sm}>
            {t('eventParticipants.viewItemsToBring')}
          </Text>
        </Button> */}
      </Block>
    </Block>
  );
};

const AllClients = () => {
  const {t} = useTranslation();
  const {gradients, sizes} = useTheme();
  const [clients, setClients] = useState<any[]>([]);
    // retrieve event id and participants from params
  const { params } = useRoute<IParticipantsRoute['route']>();
  const navigation = useNavigation();

  const imageMapping = {
    '1': require('../assets/images/1.png'),
    '2': require('../assets/images/2.png'),
    '3': require('../assets/images/3.png'),
    '4': require('../assets/images/4.png'),
    'default': require('../assets/images/4.png'),
  };
  

  useEffect(() => {
    const fetchUsers = async () => {
      console.log(params);
      const allUsers = await getAllUsers();
      // map the users to get id
      const allClients = allUsers.map((user) => {

        if (user.type === "Caregiver") {
          user.image = imageMapping[user.image as keyof typeof imageMapping] || imageMapping['default'];
          const { password, stats, ...userInfo } = user;
          console.log("User Info", userInfo);
          return userInfo;
        }
        return null;
      }).filter(Boolean); // Filter out any undefined values
      
      console.log("My Clients", allClients);
      return allClients;
    };

    fetchUsers().then(clientInfo => {
      setClients(clientInfo || []);
    });

  }, [params]);

  /* handle time selection */
  // const handleTime = useCallback(
  //   (time) => {
  //     const newExtras = extras?.map((extra) =>
  //       extra?.id === modal ? {...extra, time} : extra,
  //     );
  //     setExtras(newExtras);
  //     setModal(undefined);
  //   },
  //   [extras, modal, setExtras, setModal],
  // );

  // /* handle save for later */
  // const handleSave = useCallback(
  //   (id) => {
  //     const newExtras = extras?.map((extra) =>
  //       extra?.id === id ? {...extra, saved: true} : extra,
  //     );
  //     setExtras(newExtras);
  //   },
  //   [extras, setExtras],
  // );

  // /* handle book */
  // const handleBook = useCallback(
  //   (id) => {
  //     const newExtras = extras?.map((extra) =>
  //       extra?.id === id ? {...extra, booked: true} : extra,
  //     );
  //     setExtras(newExtras);
  //   },
  //   [extras, setExtras],
  // );

  const handleLeaveFeedback = async (client: any) => {
    // navigation.navigate("FeedbackParticipant", { eventId: params.eventId, participant: participant});
    navigation.navigate("ClientProfile", { client: client }); 
  }

  return (
    <Block safe marginHorizontal={sizes.padding} paddingBottom={sizes.sm}>
      <Block
        scroll
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingVertical: sizes.md}}>
        <Text h3 gradient={gradients.primary} end={[0.7, 0]}>
          {t('allClients.title1')}
        </Text>
        <Text p semibold>
          {t('allClients.list')}
        </Text>

        {/* using map for items due to nested scrolls on same direction (vertical) */}
        {clients?.map((participant) => (
          
          <Client
            {...participant}
            key={`participant-${participant?.name}`}
            onLeaveFeedback={() => {handleLeaveFeedback(participant)}}
          />
        ))}
      </Block>

      {/* contact us */}
      {/* <Button gradient={gradients.primary} marginTop={sizes.s}>
        <Text bold white transform="uppercase" marginHorizontal={sizes.sm}>
          {t('extras.contactUs')}
        </Text>
      </Button> */}

      {/* change time modal */}
      {/* <Modal
        visible={Boolean(modal)}
        onRequestClose={() => setModal(undefined)}>
        <FlatList
          keyExtractor={(index) => `${index}`}
          data={[
            dayjs().add(30, 'm'),
            dayjs().add(60, 'm'),
            dayjs().add(90, 'm'),
            dayjs().add(120, 'm'),
            dayjs().add(150, 'm'),
          ]}
          renderItem={({item}) => (
            <Button
              marginBottom={sizes.sm}
              onPress={() => handleTime(dayjs(item).format('hh:mm'))}>
              <Text p white semibold transform="uppercase">
                {dayjs(item).format('hh:mm')}
              </Text>
            </Button>
          )}
        />
      </Modal> */}
    </Block>
  );
};

export default AllClients;
