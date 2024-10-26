import React, { useState, useEffect, useContext } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/core";
import { Block, Button, Text } from ".";
import { UserContext } from "../hooks/userContext";
import { format, addDays } from "date-fns";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useTheme } from "../hooks/";

interface Event {
  name: string;
  location: string;
  information: string;
  datetime: Date;
  id?: string;
  meetUpLocations?: string[];
  itemsToBring?: string[];
  participants?: string[];
  volunteers?: string[];
}

const MainCalendar = () => {
  const navigation = useNavigation();
  const { identity } = useContext(UserContext);
  const { assets, colors, gradients, sizes } = useTheme();

  // Calendar states
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

  useEffect(() => {
    console.log("identity:", identity);
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
      };
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
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      ).getDay();

      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null);
      }

      for (let i = 1; i <= daysInMonth; i++) {
        days.push(
          new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
        );
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
        {monthDays.map((day, index) => (
          <View key={index} style={styles.dayCell}>
            {day && (
              <>
                <Text style={styles.dayNumber}>{day.getDate()}</Text>
                <ScrollView>
                  {events
                    .filter((event) => {
                      return (
                        formatDate(event.datetime.toISOString()) ===
                        formatDate(day.toISOString())
                      );
                    })
                    .map((event) => (
                      <TouchableOpacity
                        key={event.id}
                        // onPress={() =>
                        //   navigation.navigate("Event", { eventId: event.id })
                        // }
                      >
                        <View style={styles.event}>
                          <Text style={styles.eventTitle}>{event.name}</Text>
                          <Text style={styles.eventTime}>
                            {String(event.datetime.getHours()).padStart(2, "0")}
                            :
                            {String(event.datetime.getMinutes()).padStart(
                              2,
                              "0"
                            )}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                </ScrollView>
              </>
            )}
          </View>
        ))}
      </View>
    );
  };

  const nextPeriod = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const prevPeriod = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  return (
    <Block row marginVertical={sizes.sm}>
      <Block card marginHorizontal={sizes.xs}>
        {/* {identity && <Text h5={true}>Current role is {identity["type"]}</Text>} */}

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.header}>
              <Text h5>Calendar</Text>
              <View style={styles.navigationButtons}>
                <Button gradient={gradients.dark} onPress={prevPeriod}>
                  <Text
                    white
                    bold
                    transform="uppercase"
                    marginHorizontal={sizes.sm}
                  >
                    &lt;
                  </Text>
                </Button>

                <Text paddingHorizontal={sizes.xs}>
                  {format(currentDate, "MMMM yyyy")}
                </Text>
                <Button gradient={gradients.dark} onPress={nextPeriod}>
                  <Text
                    white
                    bold
                    transform="uppercase"
                    marginHorizontal={sizes.sm}
                  >
                    &gt;
                  </Text>
                </Button>
              </View>
            </View>
            {renderMonthView()}
            {/* Only show Add Event button for admin/organizer roles */}
            {identity && ["Staff", "organizer"].includes(identity.type) && (
              <Button
                flex={1}
                gradient={gradients.success}
                marginVertical={sizes.base}
              >
                <Text white bold transform="uppercase">
                  Add Event
                </Text>
              </Button>
              // <Button
              //   style={styles.buttons}
              //   //   onPress={() => navigation.navigate("AddEvent")}
              // >
              //   <Text>Add event</Text>
              // </Button>
            )}
          </View>
        </SafeAreaView>
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
    flexDirection: "row",
    alignItems: "center",
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
    padding: 5,
  },
  dayNumber: {
    fontWeight: "bold",
  },
  event: {
    backgroundColor: "lightgreen",
    padding: 2,
    marginBottom: 2,
    borderRadius: 3,
  },
  eventTitle: {
    color: "white",
    fontSize: 10,
  },
  eventTime: {
    color: "white",
    fontSize: 8,
  },
  buttons: {
    margin: 5,
  },
});

export default MainCalendar;
