import React, { useState, useEffect, useContext } from "react";
import { View, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/core";
import { Block, Button, Text } from "../components/";
import { UserContext } from "../hooks/userContext";
import { format, addDays } from "date-fns";
import { collection, getDocs, DocumentData } from "firebase/firestore";
import { db } from "../../config/firebaseConfig";
import { useTheme, useTranslation } from "../hooks";
import EventNotification from "../components/EventNotification";

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

const Home = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { identity } = useContext(UserContext);
  const { gradients, sizes } = useTheme();

  // Calendar states
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todayDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week" | "day">("month");

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

  // Add this check for identity
  if (!identity) {
    return null;
  }

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
            <Text style={styles.dayHeaderText}>{day}</Text>
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
                      return formatDate(event.datetime.toISOString()) === formatDate(day.toISOString());
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
                            {String(event.datetime.getHours()).padStart(2, "0")}:
                            {String(event.datetime.getMinutes()).padStart(2, "0")}
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
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevPeriod = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  return (
    <Block
      scroll
      nestedScrollEnabled
      paddingVertical={sizes.padding}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: sizes.padding * 1.5 }}
    >
      <EventNotification />
      <Block center>
        {identity && (
          <Text h5={true} center>
            {t("home.welcome") + " "}
            <Text h5={true} center primary>
              {identity["name"]}
            </Text>
            !
          </Text>
        )}
      </Block>
      <View style={styles.container}>
        {/* <View style={styles.header}>
          <Text style={styles.title}>Calendar</Text>
          <View style={styles.navigationButtons}>
            <Button style={styles.buttons} onPress={prevPeriod}>
              <Text>&lt;</Text>
            </Button>
            <Text>{format(currentDate, "MMMM yyyy")}</Text>
            <Button style={styles.buttons} onPress={nextPeriod}>
              <Text>&gt;</Text>
            </Button>
          </View>
        </View>
        {renderMonthView()} */}

        {/* Only show stuff for admin/organizer roles */}
        {identity && ["Staff", "organizer"].includes(identity.type) && (
          <Block>
            <Button gradient={gradients.primary} marginTop={sizes.sm} onPress={() => navigation.navigate("AddEvent")}>
              <Text bold white>
                {t("staffhome.addevent")}
              </Text>
            </Button>
            <Button
              gradient={gradients.primary}
              marginTop={sizes.s}
              onPress={() => navigation.navigate("StaffCharts", { eventId: "test" })}
            >
              <Text bold white>
                {t("staffhome.statistics")}
              </Text>
            </Button>
            <Button
              gradient={gradients.primary}
              marginTop={sizes.s}
              onPress={() => navigation.navigate("AllClients")}
            >
              <Text bold white>
                {t("staffhome.allClients")}
              </Text>
            </Button>
          </Block>
        )}
      </View>
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
    backgroundColor: "green",
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

export default Home;
