import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  About,
  Agreement,
  Articles,
  Chat,
  Components,
  Extras,
  Home,
  Notifications,
  Privacy,
  Profile,
  Register,
  Login,
  Rental,
  Rentals,
  Booking,
  Settings,
  Shopping,
  NotificationsSettings,
  MyEvents,
  MyEvent,
} from "../screens";
import { useNavigation } from "@react-navigation/native";

import { useScreenOptions, useTranslation } from "../hooks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserContext } from "../hooks/userContext";
import { useContext } from "react";

const Stack = createStackNavigator();

export default () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { identity, retrieveIdentity } = useContext(UserContext);
  const screenOptions = useScreenOptions();
  // const [identity, setIdentity] = useState(null);

  // const retrieveIdentity = async () => {
  //   try {
  //     const userData = await AsyncStorage.getItem('user');
  //     if (userData) {
  //       const parsed = JSON.parse(userData);
  //       if (parsed) {
  //         setIdentity(parsed); // Set identity if the user data is found
  //       }
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  // Call retrieveIdentity when the component is mounted
  useEffect(() => {
    retrieveIdentity();
  }, []);

  return (
    <Stack.Navigator screenOptions={screenOptions.stack}>
      <Stack.Screen name="Home" component={Home} options={{ title: t("navigation.home") }} />

      <Stack.Screen name="Components" component={Components} options={screenOptions.components} />

      <Stack.Screen name="Articles" component={Articles} options={{ title: t("navigation.articles") }} />

      <Stack.Screen
        name="Rentals"
        component={Rentals}
        options={{
          title: t("navigation.events"),
          ...screenOptions.profile,
          headerRight: () =>
            identity ? (
              <TouchableOpacity onPress={() => navigation.navigate("MyEvents", { userId: identity.uid })}>
                <Text style={{ color: "blue", marginRight: 10 }}>My Events</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")} // Navigate to Login screen
              >
                <Text style={{ color: "blue", marginRight: 10 }}>Log In</Text>
              </TouchableOpacity>
            ),
        }}
      />

      <Stack.Screen
        name="MyEvents"
        component={MyEvents}
        options={{
          title: t("navigation.events"),
          ...screenOptions.profile,
          headerRight: () => (
            <TouchableOpacity onPress={() => navigation.navigate("Rentals")}>
              <Text style={{ color: "blue", marginRight: 10 }}>My Events</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <Stack.Screen
        name="Rental"
        component={Rental}
        options={{ title: t("navigation.eventDetails"), ...screenOptions.rental }}
      />
      <Stack.Screen
        name="MyEvent"
        component={MyEvent}
        options={{ title: t("navigation.eventDetails"), ...screenOptions.rental }}
      />
      <Stack.Screen
        name="Booking"
        component={Booking}
        options={{ title: t("navigation.booking"), ...screenOptions.rental }}
      />
      <Stack.Screen name="Chat" component={Chat} options={{ title: t("navigation.chat"), ...screenOptions.chat }} />

      <Stack.Screen name="Profile" component={Profile} options={{ headerShown: false }} />

      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{ title: t("navigation.settings"), ...screenOptions.profile }}
      />
      <Stack.Screen
        name="NotificationsSettings"
        component={NotificationsSettings}
        options={{ title: t("navigation.notifications"), ...screenOptions.back }}
      />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{ title: t("navigation.notifications"), ...screenOptions.back }}
      />
      <Stack.Screen
        name="Agreement"
        component={Agreement}
        options={{ title: t("navigation.agreement"), ...screenOptions.back }}
      />
      <Stack.Screen name="About" component={About} options={{ title: t("navigation.about"), ...screenOptions.back }} />
      <Stack.Screen
        name="Privacy"
        component={Privacy}
        options={{ title: t("navigation.privacy"), ...screenOptions.back }}
      />

      <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />

      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />

      <Stack.Screen
        name="Extra"
        component={Extras}
        options={{ title: t("navigation.extra"), headerRight: () => null }}
      />

      <Stack.Screen
        name="Shopping"
        component={Shopping}
        options={{ title: t("navigation.shopping"), ...screenOptions.back }}
      />
    </Stack.Navigator>
  );
};
