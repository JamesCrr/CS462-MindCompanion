import React, { useCallback, useState, useEffect, useContext } from 'react';
import { Platform, Linking, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {useNavigation, useRoute}  from '@react-navigation/native';
import { UserContext } from "../hooks/userContext";
import { Block, Button, Image, Text, MyEventCard } from '../components';
import { useData, useTheme, useTranslation } from '../hooks';
import { fetchAllEventsAndRecordsForUser } from '../../api/eventRecords';
import {RouteProp} from '@react-navigation/native';
const isAndroid = Platform.OS === 'android';



interface IParticipantsRoute {
  route: RouteProp<{params: {client: any}}, 'params'>;
}


const ClientProfile = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { params } = useRoute<IParticipantsRoute['route']>();
  const { assets, colors, sizes } = useTheme();
  const [eventRecords, setEventRecords] = useState<any[]>([]);

  const IMAGE_SIZE = (sizes.width - (sizes.padding + sizes.sm) * 2) / 3;
  const IMAGE_VERTICAL_SIZE = (sizes.width - (sizes.padding + sizes.sm) * 2) / 2;
  const IMAGE_MARGIN = (sizes.width - IMAGE_SIZE * 3 - sizes.padding * 2) / 2;
  const IMAGE_VERTICAL_MARGIN = (sizes.width - (IMAGE_VERTICAL_SIZE + sizes.sm) * 2) / 2;

  const imageMapping = {
    '1': require('../assets/images/1.png'),
    '2': require('../assets/images/2.png'),
    '3': require('../assets/images/3.png'),
    '4': require('../assets/images/4.png'),
    'default': require('../assets/images/4.png'),
  };
  

  useEffect(() => {
    console.log("client object:", params.client.name, params.client.type, params.client.image);
    if (params.client.name) {
      console.log("params client image", params.client.image);
      fetchEventsAndRecordsForUser(params.client.name);
      params.client.image = imageMapping[params.client.image as keyof typeof imageMapping] || imageMapping['default'];
      console.log("Client Image:", params.client.image);
    }
  }, [params]);

  const fetchEventsAndRecordsForUser = async (name: string) => {
    try {
      console.log("Identity name:", name);
      const response: any = await fetchAllEventsAndRecordsForUser(name);
      if (response) {
        console.log("Event Records:", response);
        setEventRecords(response);

        console.log("event data:", response);
      } else {
        console.log("No event records found");
      }
    } catch (error) {
      console.log("Error fetching event records", error);
    }
  };

  const renderHeader = () => (
    <Block>
      <Image
        background
        resizeMode="cover"
        padding={sizes.sm}
        paddingBottom={sizes.l}
        radius={sizes.cardRadius}
        source={assets.background}>
        <Button
          row
          flex={0}
          justify="flex-start"
          onPress={() => navigation.goBack()}>
          <Image
            radius={0}
            width={10}
            height={18}
            color={colors.white}
            source={assets.arrow}
            transform={[{ rotate: '180deg' }]}
          />
          <Text p white marginLeft={sizes.s}>
            {t('profile.title')}
          </Text>
        </Button>
        <Block flex={0} align="center">
          {/* <Image
            width={64}
            height={64}
            marginBottom={sizes.sm}
            source={params.client?.image}
          /> */}
          <Text h5 center white>
            {params.client.name}
          </Text>
          <Text p center white>
            {params.client?.type}
          </Text>
          <Block row marginVertical={sizes.m}>
            <Button
              white
              outlined
              shadow={false}
              radius={sizes.m}
              // onPress={() => {
              //   alert(`Follow ${user?.name}`);
              // }}
              >
              <Block
                justify="center"
                radius={sizes.m}
                paddingHorizontal={sizes.m}
                color="rgba(255,255,255,0.2)">
                <Text white bold transform="uppercase">
                  {t('common.healthRecords')}
                </Text>
              </Block>
            </Button>
            {/* <Button
              shadow={false}
              radius={sizes.m}
              marginHorizontal={sizes.sm}
              color="rgba(255,255,255,0.2)"
              outlined={String(colors.white)}
              onPress={() => handleSocialLink('twitter')}>
              <Ionicons
                size={18}
                name="logo-twitter"
                color={colors.white}
              />
            </Button>
            <Button
              shadow={false}
              radius={sizes.m}
              color="rgba(255,255,255,0.2)"
              outlined={String(colors.white)}
              onPress={() => handleSocialLink('dribbble')}>
              <Ionicons
                size={18}
                name="logo-dribbble"
                color={colors.white}
              />
            </Button> */}
          </Block>
        </Block>
      </Image>

      {/* profile: stats */}
      {params.client?.type === "Caregiver" && (
      <Block
        flex={0}
        radius={sizes.sm}
        shadow={!isAndroid} // disabled shadow on Android due to blur overlay + elevation issue
        marginTop={-sizes.l}
        marginHorizontal="8%"
        color="rgba(255,255,255,0.2)">
        <Block
          row
          blur
          flex={0}
          intensity={100}
          radius={sizes.sm}
          overflow="hidden"
          tint={colors.blurTint}
          justify="space-evenly"
          paddingVertical={sizes.sm}
          renderToHardwareTextureAndroid>
          <Block align="center">
            <Text h5>{params.client?.stats?.medals}</Text>
            <Text>{t('profile.noOfMedals')}</Text>
          </Block>
          <Block align="center">
            <Text h5>{(params.client?.stats?.podiums || 0)}</Text>
            <Text>{t('profile.noOfPodiums')}</Text>
          </Block>
          <Block align="center">
            <Text h5>{(params.client?.stats?.score || 0)}</Text>
            <Text>{t('profile.totalScore')}</Text>
          </Block>
        </Block>
      </Block>
      )}

      {params.client?.type === "Volunteer" && (
            <Block
              flex={0}
              radius={sizes.sm}
              shadow={!isAndroid} // disabled shadow on Android due to blur overlay + elevation issue
              marginTop={-sizes.l}
              marginHorizontal="8%"
              color="rgba(255,255,255,0.2)">
              <Block
                row
                blur
                flex={0}
                intensity={100}
                radius={sizes.sm}
                overflow="hidden"
                tint={colors.blurTint}
                justify="space-evenly"
                paddingVertical={sizes.sm}
                renderToHardwareTextureAndroid>
                <Block align="center">
                  <Text h5>{params.client?.stats?.noOfActivitiesAttended}</Text>
                  <Text>{t('profile.noOfActivitiesAttended')}</Text>
                </Block>
              </Block>
            </Block>
            )}



      {/* profile: about me */}
      <Block paddingHorizontal={sizes.sm}>
        <Text h5 semibold marginBottom={sizes.s} marginTop={sizes.sm}>
          {t('profile.eventRecords')}
        </Text>
        {/* <Text p lineHeight={26}>
          {user?.about}
        </Text> */}
      </Block>
    </Block>
  );

  return (
    <Block safe marginTop={sizes.md}>
      <FlatList
        data={eventRecords}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => `${item?.eventId}`}
        style={{ paddingHorizontal: sizes.padding }}
        contentContainerStyle={{ paddingBottom: sizes.l }}
        renderItem={({ item }) => (
          <MyEventCard
            {...item.eventDetails}
            onPress={() => navigation.navigate("EventRecord", { eventId: item.eventId, eventDetails: item.eventDetails, userRecord: item.userRecord })}
          />
        )}
      />
    </Block>
  );
};

export default ClientProfile;