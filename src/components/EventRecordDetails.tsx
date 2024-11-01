import React, { useState } from "react";
import dayjs from "dayjs";
import { TouchableWithoutFeedback, TouchableOpacity, ScrollView, View, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Text from "./Text";
import Block from "./Block";
import Image from "./Image";
import { useNavigation } from "@react-navigation/native";
import { useTheme, useTranslation } from "../hooks";
import { IArticle, IEvent2 } from "../constants/types";
import { userJoinEvent } from "../../api/event";
import { Badge } from "../components/";

interface EventDetailsProp extends IEvent2 {
  onSelectMeetUpLocation: (location: string) => void;
}

import { Award, Star, Trophy, MessageSquare } from 'lucide-react';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const CompletionPie = ({ percentage, size = 80, colors }: { percentage: number; size?: number; colors: { light: string; success: string; } }) => {
  // Using a simple circle with percentage for now
  // For a more advanced circular progress, you might want to use 
  // react-native-svg or similar libraries
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.light,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 8,
        borderColor: colors.success
      }}>
        <Text p bold color={colors.success}>
          {percentage}%
        </Text>
      </View>
    </View>
  );
};

const EventRecordDetails = ({
  achievements = [],
  completion,
  rank,
  remarks,
  score,
}: any) => {
  const [modalVisible, setModalVisible] = useState(false);

  const { colors, gradients, sizes } = useTheme();
  return (
    <TouchableWithoutFeedback>
      <Block card marginTop={sizes.sm} radius={sizes.cardRadius}>
        {/* Top Section - Completion and Score */}
        <Block row justify="space-between" marginBottom={sizes.sm}>
          <Block row align="center">
            <Block marginRight={sizes.sm}>
              <Text gray>Completion</Text>
            </Block>
            <CompletionPie 
              percentage={completion} 
              colors={{ light: colors.light.toString(), success: colors.success.toString() }}
              size={80}
            />
          </Block>
        </Block>
        <Block>
          <Block row align="center" marginBottom={sizes.sm}>
            <Block 
              row
              align="center"
              justify="space-between"
              style={{
                backgroundColor: colors.danger,
                opacity: 0.2,
                padding: sizes.sm,
                borderRadius: sizes.cardRadius
              }}
            >
              <Text bold color={colors.white}>Score</Text>
              <Text h5 bold color={colors.white}>{score}</Text>
            </Block>
          </Block>
        </Block>

        {/* Middle Section - Achievements and Rank */}
        <Block row marginBottom={sizes.sm}>
          {/* Achievements */}
          <Block 
            flex={1} 
            marginRight={sizes.sm}
            style={{
              backgroundColor: colors.success.toString() + '10',
              padding: sizes.sm,
              borderRadius: sizes.cardRadius
            }}
          >
            <Block row align="center" marginBottom={sizes.sm}>
              <Icon 
                name="trophy-award" 
                size={20} 
                color={colors.success}
              />
              <Text 
                semibold 
                color={colors.success} 
                marginLeft={sizes.xs}
              >
                Achievements
              </Text>
            </Block>
            <ScrollView style={{ maxHeight: 100 }}>
              {achievements.map((achievement: string, index: number) => (
                <Block 
                  key={index} 
                  row 
                  align="center" 
                  marginBottom={sizes.xs}
                >
                  <Block 
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: colors.success.toString() + '20',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    <Text 
                      p 
                      color={colors.success} 
                      marginLeft={sizes.xs}
                    >
                      {achievement}
                    </Text>
                  </Block>
                </Block>
              ))}
            </ScrollView>
          </Block>

          {/* Rank */}
          <Block 
            width={120}
            style={{
              backgroundColor: colors.secondary.toString() + '10',
              padding: sizes.sm,
              borderRadius: sizes.cardRadius,
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Icon 
              name="trophy" 
              size={32} 
              color={colors.secondary}
            />
            <Text gray marginTop={sizes.xs}>Current Rank</Text>
            <Text h3 color={colors.secondary}>#{rank}</Text>
          </Block>
        </Block>

        {/* Bottom Section - Remarks */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Block
            style={{
              backgroundColor: colors.gray.toString() + '10',
              padding: sizes.sm,
              borderRadius: sizes.cardRadius,
              height: 150, // Set a fixed height for the container
            }}
          >
            <Block row align="center" marginBottom={sizes.sm} justify="space-between">
              <Block row align="center">
                <Icon 
                  name="comment-text" 
                  size={20} 
                  color={colors.gray}
                />
                <Text 
                  semibold 
                  color={colors.gray} 
                  marginLeft={sizes.xs}
                >
                  Remarks
                </Text>
              </Block>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text color={colors.primary}>See more...</Text>
              </TouchableOpacity>
            </Block>
            <ScrollView>
              <Text p color={colors.gray} numberOfLines={3} ellipsizeMode="tail">
                {remarks}
              </Text>
            </ScrollView>
          </Block>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Block
              style={{
                backgroundColor: colors.light,
                padding: sizes.sm,
                borderRadius: sizes.cardRadius,
                width: '90%',
                maxHeight: '50%',
              }}
            >
              <Block row align="center" justify="space-between" marginBottom={sizes.sm}>
                <Text semibold color={colors.gray}>Remarks</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Icon name="close" size={24} color={colors.gray} />
                </TouchableOpacity>
              </Block>
              <ScrollView>
                <Text p color={colors.gray}>
                  {remarks}
                </Text>
              </ScrollView>
            </Block>
          </View>
        </Modal>
      </Block>
    </TouchableWithoutFeedback>
);
};

export default EventRecordDetails;