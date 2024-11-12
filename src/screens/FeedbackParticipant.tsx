import React, { useCallback, useContext, useEffect, useState} from "react";
import { useNavigation, useRoute } from "@react-navigation/core";
import { useData, useTheme, useTranslation } from "../hooks";
import {
  Block,
  EventDetails,
  EventRecordDetails,
  Text,
  Button, 
  Input,
  Badge,
} from "../components";
import {FlatList} from 'react-native';
import {
  userJoinEvent,
  staffPublishEvent,
} from "../../api/event";
import { UserContext } from "../hooks/userContext";
import { View, Modal, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from "react-native";
import { updateEventRecord } from "../../api/eventRecords";

const FeedbackParticipant = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<{ key: string; name: string; params: { eventId: string, eventDetails: any, userRecord: any, participantName: string } }>();
  const { colors, gradients, sizes } = useTheme();
  const { eventId, eventDetails, userRecord, participantName } = route.params;
  const [selectedMeetUpLocation, setSelectedMeetUpLocation] = useState<
    string | null
  >(null);

  const [achievements, setAchievements] = useState<string[]>([]);
  const [tempAchievements, setTempAchievements] = useState<string>("");
  const { identity, retrieveIdentity } = useContext(UserContext);
  
  useEffect(() => {
    console.log("EventId:", eventId);
    console.log("Event Details:", eventDetails);
    console.log("User Record:", userRecord);
    if (!userRecord) {
      setEventRecord({
        completion: 0, 
        score: 0, 
        achievements: [], 
        rank: 0, 
        remarks: ""
      })
    } else {
      setEventRecord(userRecord);
      setAchievements(userRecord.achievements);
    }
  }, []);
  
  const [modalVisible, setModalVisible] = useState(false);

  const [eventRecord, setEventRecord] = useState({
    completion: 0, 
    score: 0, 
    achievements: [], 
    rank: 0, 
    remarks: ""
  });

  const handleChange = useCallback(
    (value: any) => {
      setEventRecord((state) => ({ ...state, ...value }));
    },
    [setEventRecord]
  );

  const addAchievements = () => {
    if (eventRecord.achievements && tempAchievements.trim()) {
      setAchievements([...achievements, tempAchievements]);
      handleChange({ achievements: [...achievements, tempAchievements] });
      setTempAchievements(""); // Clear input after adding
    }
  };

  const removeAchievements = (index: number) => {
    const newAchievements = [...achievements];
    newAchievements.splice(index, 1);
    setAchievements(newAchievements);
    handleChange({ achievements: newAchievements });
  };

  const handleSubmit = async () => {
    console.log("Submitting feedback", eventRecord);

    try {
      const res = await updateEventRecord(eventId, participantName, eventRecord);
      console.log(res);
      setModalVisible(false); // Close modal after successful submission
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const CARD_WIDTH = sizes.width - sizes.s;
  const hasSmallScreen = sizes.width < 414; // iPhone 11
  const SNAP_OFFSET = CARD_WIDTH - (hasSmallScreen ? 28 : 19) + sizes.s;

  return (
    <Block safe marginHorizontal={sizes.padding} paddingBottom={sizes.sm}>
      <Block
        scroll
        nestedScrollEnabled
        paddingVertical={sizes.padding}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: sizes.padding * 1.5 }}
      >
        {/* Header Section */}
        <Block row align="center" justify="space-between" marginLeft={sizes.m}>
          <Text h5 semibold>{participantName}</Text>
        </Block>
        <Block style={{ paddingHorizontal: sizes.xs }} >  
          <EventRecordDetails {...userRecord} />
        </Block>
        <Button 
          gradient={gradients.primary} 
          marginTop={sizes.s} 
          onPress={() => {setModalVisible(true)}}
        >
          <Text bold white transform="uppercase" marginHorizontal={sizes.sm}>
            Edit
          </Text>
        </Button>
      </Block>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        >
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.modalView}>
              <ScrollView 
                contentContainerStyle={styles.scrollViewContent}
                showsVerticalScrollIndicator={true}
                bounces={false}
              >
                <Block paddingHorizontal={sizes.sm}>
                  <Block row justify="space-between" align="center" marginBottom={sizes.sm}>
                    <Text h5>Feedback</Text>
                    <Button onPress={() => setModalVisible(false)}>
                      <Text bold>X</Text>
                    </Button>
                  </Block>
                  
                  <Input
                    label="Completion"
                    autoCapitalize="none"
                    marginBottom={sizes.m}
                    placeholder="100"
                    keyboardType="numeric"
                    value={String(eventRecord.completion)}
                    onChangeText={(value: any) => handleChange({ completion: parseInt(value) || 0 })}
                  />
                  
                  <Input
                    label="Score"
                    autoCapitalize="none"
                    marginBottom={sizes.m}
                    placeholder="100"
                    keyboardType="numeric"
                    value={String(eventRecord.score)}
                    onChangeText={(value: any) => handleChange({ score: parseInt(value) || 0 })}
                  />
                  
                  <Block row align="center">
                    <Block flex={1}>
                      <Input
                        label="Achievements"
                        autoCapitalize="none"
                        marginBottom={sizes.m}
                        placeholder="Bold, Creative, etc."
                        onChangeText={setTempAchievements}
                        value={tempAchievements}
                        onSubmitEditing={addAchievements}
                      />
                    </Block>
                    <Button 
                      onPress={addAchievements} 
                      marginLeft={sizes.s}
                      disabled={!tempAchievements.trim()}
                    >
                      <Text bold primary>+</Text>
                    </Button>
                  </Block>
                  
                  <Block row wrap="wrap" marginBottom={sizes.m}>
                    {achievements.map((achievement, index) => (
                      <Block key={index} marginRight={sizes.s} marginBottom={sizes.s}>
                        <Badge onPress={() => removeAchievements(index)}>
                          <Text>{achievement}</Text>
                        </Badge>
                      </Block>
                    ))}
                  </Block>
                  
                  <Input
                    label="Current Rank"
                    autoCapitalize="none"
                    marginBottom={sizes.m}
                    placeholder="1"
                    keyboardType="numeric"
                    value={String(eventRecord.rank)}
                    onChangeText={(value: any) => handleChange({ rank: parseInt(value) || 0 })}
                  />
                  
                  <Input
                    label="Remarks"
                    autoCapitalize="none"
                    marginBottom={sizes.m}
                    placeholder="Remarks"
                    multiline
                    numberOfLines={3}
                    value={eventRecord.remarks}
                    onChangeText={(value: any) => handleChange({ remarks: value })}
                  />
                  
                  <Button 
                    onPress={handleSubmit}               
                    style={{
                      backgroundColor: colors.danger,
                      padding: sizes.sm,
                      borderRadius: sizes.cardRadius,
                      marginTop: sizes.m,
                      marginBottom: sizes.xl,
                      borderWidth: 1, // Add border width
                      borderColor: colors.black, // Set border color
                    }}
                  >
                    <Text bold black>Submit</Text>
                  </Button>
                </Block>
              </ScrollView>
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </Block>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    flex: 1,
    marginTop: 60,
    marginBottom: 20,
    marginHorizontal: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
});

export default FeedbackParticipant;