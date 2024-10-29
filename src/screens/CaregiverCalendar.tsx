import React, { useState, useEffect, useContext } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/core";
import { Block, Button, Text } from "../components";
import { UserContext } from "../hooks/userContext";
import { format, addDays } from "date-fns";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import CaregiverCalendarView from "../components/CaregiverCalendarView";

const CaregiverCalendar = () => {
  return <CaregiverCalendarView />;
};

export default CaregiverCalendar;
