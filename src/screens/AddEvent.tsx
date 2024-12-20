import React, { useCallback, useState, useEffect } from "react";
import { Linking, Platform } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { useData, useTheme, useTranslation } from "../hooks/";
import { Block, Button, Input, Image, Text, Checkbox, Badge } from "../components/";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { db, storage } from "../../config/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { InsertEvent } from "../../api/event";
import { addEventIntoEventRecords } from '../../api/eventRecords';

const isAndroid = Platform.OS === "android";

const AddEvent = () => {
  const { fetchEvents } = useData();
  const { isDark } = useData();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [isValid, setIsValid] = useState({
    name: false,
    location: false,
    information: false,
    meetUpLocation: false,
    itemsToBring: false,
    date: false,
    time: false,
    agreed: false,
  });
  const [eventData, setEventData] = useState({
    name: "",
    location: "",
    information: "",
    datetime: new Date(),
    meetUpLocations: [],
    meetUpLocations: [],
    itemsToBring: [],
  });

  const [meetUpLocations, setMeetUpLocations] = useState<string[]>([]);
  const [itemsToBring, setItemsToBring] = useState<string[]>([]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempMeetUpLocation, setTempMeetUpLocation] = useState("");
  const [tempItemsToBring, setTempItemsToBring] = useState("");

  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [uploadUrl, setUploadUrl] = useState("");

  const { assets, colors, gradients, sizes } = useTheme();

  const handleChange = useCallback(
    (value: any) => {
      setEventData((state) => ({ ...state, ...value }));
    },
    [setEventData]
  );

  const handleAddEvent = useCallback(async () => {
    try {
      // const imageUrl = await uploadImage(); // Upload image and get URL

      const eventPayload = {
        ...eventData,
        // meetUpLocations: filteredMeetUp,
        // itemsToBring: filteredItemstoBring,
      };

      console.log("eventPayload:", eventPayload);

      const res = await InsertEvent(eventPayload);
      console.log("Event added successfully:", res);
      setEventData({
        name: "",
        location: "",
        information: "",
        datetime: new Date(), // Initialize with current date
        meetUpLocations: [],
        meetUpLocations: [],
        itemsToBring: [],
      });

      console.log("Event added successfully:", eventData);

      if (res) {
        console.log("response about adding event:", res);
        const resAddEventIdIntoEventRecords = await addEventIntoEventRecords(res);
        console.log("Event added into event records:", resAddEventIdIntoEventRecords);
        fetchEvents();
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }
  }, [eventData, meetUpLocations, itemsToBring, navigation]);

  useEffect(() => {
    setIsValid((state) => ({
      ...state,
      name: eventData.name.length > 0,
      location: eventData.location.length > 0,
      information: eventData.information.length > 0,
      meetUpLocations: eventData.meetUpLocations.length > 0,
      itemsToBring: eventData.itemsToBring.length > 0,
      datetime: eventData.datetime,
    }));
  }, [eventData, setIsValid]);

  const handleDateChange = (event: any, selectedDate: Date | undefined) => {
    const currentDate = selectedDate || eventData.datetime;
    setShowDatePicker(false);

    const time = new Date(eventData.datetime);
    const datetime = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate(),
      time.getHours(),
      time.getMinutes(),
      time.getSeconds()
    );

    handleChange({ datetime });
  };

  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    const currentTime = selectedTime || eventData.datetime;
    setShowTimePicker(false);

    const date = new Date(eventData.datetime);
    const datetime = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      currentTime.getHours(),
      currentTime.getMinutes(),
      currentTime.getSeconds()
    );

    handleChange({ datetime });
  };

  const addMeetupLocation = () => {
    if (eventData.meetUpLocations) {
      setMeetUpLocations([...meetUpLocations, tempMeetUpLocation]);
      handleChange({ meetUpLocations: [...meetUpLocations, tempMeetUpLocation] });
    }
  };

  const addItemToBring = () => {
    if (eventData.itemsToBring) {
      // setItemsToBring([...itemsToBring, ...eventData.itemsToBring]);
      setItemsToBring([...itemsToBring, tempItemsToBring]);
      handleChange({ itemsToBring: [...itemsToBring, tempItemsToBring] });
    }
  };

  const removeMeetupLocation = (index: number) => {
    const newMeetUpLocations = [...meetUpLocations];
    newMeetUpLocations.splice(index, 1);
    setMeetUpLocations(newMeetUpLocations);
  };

  const removeItemToBring = (index: number) => {
    const newItemsToBring = [...itemsToBring];
    newItemsToBring.splice(index, 1);
    setItemsToBring(newItemsToBring);
  };

  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    console.log(pickerResult);
    if (!pickerResult.canceled) {
      setSelectedImage(pickerResult["assets"][0].uri);
    }
  };

  const uploadImage = async () => {
    if (!selectedImage) return "";

    try {
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      const storageRef = ref(storage, `images/${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(snapshot.ref);

      setUploadUrl(url);
      console.log("Image uploaded successfully:", url);
      return url;
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  useEffect(() => {
    setIsValid((state) => ({
      ...state,
      name: eventData.name.length > 0,
      location: eventData.location.length > 0,
      information: eventData.information.length > 0,
      meetUpLocations: eventData.meetUpLocations.length > 0,
      itemsToBring: eventData.itemsToBring.length > 0,
      datetime: eventData.datetime,
    }));
  }, [eventData, setIsValid]);

  return (
    <Block safe marginTop={sizes.md}>
      <Block paddingHorizontal={sizes.s}>
        <Block flex={0} style={{ zIndex: 0 }}>
          <Image
            background
            resizeMode="cover"
            padding={sizes.sm}
            radius={sizes.cardRadius}
            source={assets.background}
            height={sizes.height * 0.3}
          >
            <Button
              row
              flex={0}
              justify="flex-start"
              onPress={() => navigation.goBack()}
              style={{ position: "absolute", top: sizes.sm, left: sizes.sm, zIndex: 2 }}
            >
              <Image
                radius={0}
                width={10}
                height={18}
                color={colors.white}
                source={assets.arrow}
                transform={[{ rotate: "180deg" }]}
              />
              <Text p white marginLeft={sizes.s}>
                {t("common.goBack")}
              </Text>
            </Button>

            <Text h4 center white marginTop={sizes.l}>
              {t("addEvent.title")}
            </Text>
          </Image>
        </Block>
        {/* event form */}
        <Block keyboard marginTop={-(sizes.height * 0.2 - sizes.l)} behavior={!isAndroid ? "padding" : "height"}>
          <Block flex={0} radius={sizes.sm} marginHorizontal="8%" shadow={!isAndroid}>
            <Block
              blur
              flex={0}
              intensity={90}
              radius={sizes.sm}
              overflow="hidden"
              justify="space-evenly"
              tint={colors.blurTint}
              paddingVertical={sizes.sm}
            >
              {/* form inputs */}
              <Block paddingHorizontal={sizes.sm}>
                {/* image picker */}
                <Block marginVertical={sizes.sm}>
                  <Button gradient={gradients.primary} onPress={openImagePicker} marginVertical={sizes.s}>
                    <Text bold white>
                      Select Event Image
                    </Text>
                  </Button>

                  <Block flex={1} align="center">
                    {selectedImage && (
                      <Image source={{ uri: selectedImage }} style={{ width: 100, height: 100 }} resizeMode="cover" />
                    )}
                  </Block>
                </Block>

                <Input
                  label={t("common.eventName")}
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  placeholder={t("common.eventNamePlaceholder")}
                  success={Boolean(eventData.name && isValid.name)}
                  danger={Boolean(eventData.name && !isValid.name)}
                  onChangeText={(value) => handleChange({ name: value })}
                />
                <Input
                  label={t("common.location")}
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  placeholder={t("common.locationPlaceholder")}
                  success={Boolean(eventData.location && isValid.location)}
                  danger={Boolean(eventData.location && !isValid.location)}
                  onChangeText={(value) => handleChange({ location: value })}
                />
                <Input
                  label={t("common.information")}
                  autoCapitalize="none"
                  marginBottom={sizes.m}
                  placeholder={t("common.informationPlaceholder")}
                  success={Boolean(eventData.information && isValid.information)}
                  danger={Boolean(eventData.information && !isValid.information)}
                  onChangeText={(value) => handleChange({ information: value })}
                />
                <Block row align="center">
                  <Block flex={1}>
                    <Input
                      label={t("common.meetupLocation")}
                      autoCapitalize="none"
                      marginBottom={sizes.m}
                      placeholder={t("common.meetupLocationPlaceholder")}
                      success={Boolean(eventData.meetUpLocations && isValid.meetUpLocation)}
                      // danger={Boolean(eventData.meetupLocations && !isValid.meetupLocation)}
                      onChangeText={(value) => setTempMeetUpLocation(value)}
                      // value={eventData.meetupLocations}
                      value={tempMeetUpLocation}
                    />
                  </Block>
                  <Button onPress={addMeetupLocation} marginLeft={sizes.s}>
                    <Text bold primary>
                      +
                    </Text>
                  </Button>
                </Block>
                <Block row wrap="wrap">
                  {meetUpLocations.map((location, index) => (
                    <Block key={index} marginRight={sizes.s} marginBottom={sizes.s}>
                      <Badge onPress={() => removeMeetupLocation(index)}>
                        <Text>{location}</Text>
                      </Badge>
                    </Block>
                  ))}
                </Block>
                <Block row align="center">
                  <Block flex={1}>
                    <Input
                      label={t("common.itemsToBring")}
                      autoCapitalize="none"
                      marginBottom={sizes.m}
                      placeholder={t("common.itemsToBringPlaceholder")}
                      success={Boolean(eventData.itemsToBring && isValid.itemsToBring)}
                      // danger={Boolean(eventData.itemsToBring && !isValid.itemsToBring)}
                      onChangeText={(value) => setTempItemsToBring(value)}
                      // value={eventData.itemsToBring}
                      value={tempItemsToBring}
                    />
                  </Block>
                  <Button onPress={addItemToBring} marginLeft={sizes.s}>
                    <Text bold primary>
                      +
                    </Text>
                  </Button>
                </Block>
                <Block row wrap="wrap">
                  {itemsToBring.map((item, index) => (
                    // <Badge key={index} marginRight={sizes.s} marginBottom={sizes.s}>
                    //   <Text>{item}</Text>
                    //   <Button onPress={() => removeItemToBring(index)}>
                    //     <Text>X</Text>
                    //   </Button>
                    // </Badge>
                    <Block key={index} marginRight={sizes.s} marginBottom={sizes.s}>
                      <Badge onPress={() => removeItemToBring(index)}>
                        <Text>{item}</Text>
                      </Badge>
                    </Block>
                  ))}
                </Block>
                <Block row>
                  <Block flex={1} paddingRight={sizes.s}>
                    <Text>{t("common.date")}</Text>
                    <Button onPress={() => setShowDatePicker(true)}>
                      <Text>{eventData.datetime.toDateString()}</Text>
                    </Button>
                    {showDatePicker && (
                      <DateTimePicker
                        value={eventData.datetime}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                      />
                    )}
                  </Block>
                  <Block flex={1} paddingLeft={sizes.s}>
                    <Text>{t("common.time")}</Text>
                    <Button onPress={() => setShowTimePicker(true)}>
                      <Text>{eventData.datetime.toLocaleTimeString()}</Text>
                    </Button>
                    {showTimePicker && (
                      <DateTimePicker
                        value={eventData.datetime}
                        mode="time"
                        display="default"
                        onChange={handleTimeChange}
                      />
                    )}
                  </Block>
                </Block>
              </Block>
              {/* checkbox terms */}
              {/* <Block row flex={0} align="center" paddingHorizontal={sizes.sm}>
                <Checkbox
                  marginRight={sizes.sm}
                  checked={eventData?.agreed}
                  onPress={(value) => handleChange({ agreed: value })}
                />
                <Text paddingRight={sizes.s}>
                  {t('common.agree')}
                  <Text
                    semibold
                    onPress={() => {
                      Linking.openURL('https://www.creative-tim.com/terms');
                    }}
                  >
                    {t('common.terms')}
                  </Text>
                </Text>
              </Block> */}
              <Button
                onPress={handleAddEvent}
                marginVertical={sizes.s}
                marginHorizontal={sizes.sm}
                gradient={gradients.primary}
                // disabled={Object.values(isValid).includes(false)}
              >
                <Text bold white transform="uppercase">
                  {t("common.addEvent")}
                </Text>
              </Button>
            </Block>
          </Block>
        </Block>
      </Block>
    </Block>
  );
};

export default AddEvent;
