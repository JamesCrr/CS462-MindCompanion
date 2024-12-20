import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { Block, Button, Text } from ".";
import { UserContext } from "../hooks/userContext";
import { format, addDays } from "date-fns";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useTheme, useTranslation } from "../hooks";

interface Event {
  name: string;
  location: string;
  information: string;
  datetime: Date;
  meetUpLocations?: string[];
  itemsToBring?: string[];
  participants?: string[];
  volunteers?: string[];
  participantAttendance?: string[];
  volunteerAttendance?: string[];
  published?: boolean;
}

const CaregiverCalendarView = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { identity } = useContext(UserContext);
  const { assets, colors, gradients, sizes } = useTheme();

  // Calendar states
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  useEffect(() => {
    if (identity == null) {
      //   navigation.replace("Login");
    }
  }, [identity]);

  const retrieveAllEvents = async () => {
    var events: Event[] = [];
    const querySnapshot = await getDocs(collection(db, "events"));
    querySnapshot.forEach((doc) => {
      var event: Event = {
        id: doc.id,
        name: doc.data().name,
        location: doc.data().location,
        information: doc.data().information,
        datetime: doc.data().datetime.toDate(),
        meetUpLocations: doc.data().meetUpLocations || [],
        itemsToBring: doc.data().itemsToBring || [],
        participants: doc.data().participants || [],
        volunteers: doc.data().volunteers || [],
        participantAttendance: doc.data().participantAttendance || [],
        volunteerAttendance: doc.data().volunteerAttendance || [],
        published: doc.data().published,
      };

      console.log("Each Event:", event);
      events.push(event);
    });
    setEvents(events);
  };

  useEffect(() => {
    const retrieveData = async () => {
      await retrieveAllEvents();
    };
    retrieveData();
    setCurrentDate(new Date());
  }, []);

  // Add a new useEffect to listen for focus events
  useEffect(() => {
    // Add listener for when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      retrieveAllEvents(); // Re-fetch events when screen is focused
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [navigation]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, "yyyy-MM-dd");
  };

  const renderMonthView = () => {
    const getDaysInMonth = (date: Date) => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getMonthDays = () => {
      const days: (Date | null)[] = [];
      const daysInMonth = getDaysInMonth(currentDate);
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
      }

      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
      }

      return days;
    };

    const monthDays = getMonthDays();

    return (
      <View style={styles.monthGrid}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <View key={day} style={styles.dayHeader}>
            <Text>{day}</Text>
          </View>
        ))}
        {monthDays.map((day, index) => {
          if (day) {
            const dayEvents = events.filter((event) => 
              formatDate(event.datetime.toISOString()) === formatDate(day.toISOString()) 
              && event.published === true
            );
          }
          
          return (
            <View key={index} style={styles.dayCell}>
              {day && (
                <>
                  <Text style={styles.dayNumber}>{day.getDate()}</Text>
                  <ScrollView 
                    style={styles.eventScrollView}
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                    scrollEnabled={true}
                  >
                    <View style={styles.eventsContainer}>
                      {events
                        .filter((event) => 
                          formatDate(event.datetime.toISOString()) === formatDate(day.toISOString()) 
                          && event.published === true
                        )
                        .sort((a, b) => a.datetime.getTime() - b.datetime.getTime())
                        .map((event) => (
                          <TouchableOpacity
                            key={event.id}
                            onPress={() =>
                              navigation.navigate("ViewEvent", {
                                eventId: event.id,
                              })
                            }
                          >
                            <View
                              style={[
                                styles.event,
                                {
                                  backgroundColor:
                                    identity?.type === "Caregiver"
                                      ? event.participants?.some(
                                          (participant) => participant.split(",")[0] === identity?.name
                                        )
                                        ? "lightblue"
                                        : "lightgreen"
                                      : identity?.type === "Volunteer"
                                      ? event.volunteers?.includes(identity?.name)
                                        ? "lightblue"
                                        : "lightgreen"
                                      : "lightgreen",
                                },
                              ]}
                            >
                              <Text style={styles.eventTitle} numberOfLines={1}>{event.name}</Text>
                              <Text style={styles.eventTime}>
                                {String(event.datetime.getHours()).padStart(2, "0")}:
                                {String(event.datetime.getMinutes()).padStart(2, "0")}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                    </View>
                  </ScrollView>
                </>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  const nextPeriod = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevPeriod = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const renderLegend = () => {
    return (
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'lightgreen' }]} />
          <Text>Available Events</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: 'lightblue' }]} />
          <Text>Joined Events</Text>
        </View>
      </View>
    );
  };

  return (
    <Block scroll showsVerticalScrollIndicator={false}>
      <Block row marginVertical={sizes.sm}>
        <Block card marginHorizontal={sizes.xs}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
              <View style={styles.header}>
                <View style={styles.navigationButtons}>
                  <Button gradient={gradients.primary} onPress={prevPeriod}>
                    <Text white bold transform="uppercase" marginHorizontal={sizes.sm}>
                      &lt;
                    </Text>
                  </Button>

                  <Text paddingHorizontal={sizes.xs}>{format(currentDate, "MMMM yyyy")}</Text>
                  <Button gradient={gradients.primary} onPress={nextPeriod}>
                    <Text white bold transform="uppercase" marginHorizontal={sizes.sm}>
                      &gt;
                    </Text>
                  </Button>
                </View>
              </View>
              {renderLegend()}
              {renderMonthView()}
              {/* Only show Add Event button for admin/organizer roles */}
              {/* {identity && ["Staff", "organizer"].includes(identity.type) && (
                <Button
                  flex={1}
                  gradient={gradients.primary}
                  marginVertical={sizes.base}
                  onPress={() => navigation.navigate("AddEvent")}
                >
                  <Text white bold transform="uppercase">
                    {t("caregivercalendar.addevent")}
                  </Text>
                </Button>
              )} */}
            </View>
          </SafeAreaView>
        </Block>
      </Block>
    </Block>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayHeader: {
    width: "14.28%",
    padding: 5,
    alignItems: "center",
  },
  dayHeaderText: {
    fontWeight: "bold",
  },
  dayCell: {
    width: "14.28%",
    height: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 2,
  },
  dayNumber: {
    fontWeight: "bold",
    marginBottom: 2,
    fontSize: 10,
  },
  eventScrollView: {
    flex: 1,
    height: 75,
  },
  eventsContainer: {
    flexGrow: 1,
  },
  event: {
    padding: 2,
    marginBottom: 1,
    borderRadius: 3,
    minHeight: 15,
  },
  eventTitle: {
    color: "black",
    fontSize: 8,
    fontWeight: '500',
    lineHeight: 10,
  },
  eventTime: {
    color: "black",
    fontSize: 7,
    lineHeight: 8,
  },
  buttons: {
    margin: 5,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
});

export default CaregiverCalendarView;
