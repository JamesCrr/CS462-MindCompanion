import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Linking, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import {
  useDrawerStatus,
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";

import Screens from "./Screens";
import { Block, Text, Switch, Button, Image } from "../components";
import { useData, useTheme, useTranslation } from "../hooks";

import { UserContext } from "../hooks/userContext";
import { useContext } from "react";

const Drawer = createDrawerNavigator();

/* drawer menu screens navigation */
const ScreensStack = () => {
  const { colors } = useTheme();
  const isDrawerOpen = useDrawerStatus() === "closed" ? false : true;
  const animation = useRef(new Animated.Value(0)).current;

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.88],
  });

  const borderRadius = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  const animatedStyle = {
    borderRadius: borderRadius,
    transform: [{ scale: scale }],
  };

  useEffect(() => {
    Animated.timing(animation, {
      duration: 200,
      useNativeDriver: true,
      toValue: isDrawerOpen ? 1 : 0,
    }).start();
  }, [isDrawerOpen, animation]);

  return (
    <Animated.View
      style={StyleSheet.flatten([
        animatedStyle,
        {
          flex: 1,
          overflow: "hidden",
          borderColor: colors.card,
          borderWidth: isDrawerOpen ? 1 : 0,
        },
      ])}
    >
      <Screens />
    </Animated.View>
  );
};

/* custom drawer menu */
const DrawerContent = (props: DrawerContentComponentProps) => {
  const { navigation } = props;
  const { isDark, handleIsDark } = useData();
  const { identity, logout, retrieveIdentity } = useContext(UserContext); // Use identity and logout from context
  const { t } = useTranslation();
  const [active, setActive] = useState("Home");
  const { assets, colors, gradients, sizes } = useTheme();
  const labelColor = isDark ? colors.white : colors.text;
  const isDrawerOpen = useDrawerStatus() === "open";

  const handleNavigation = useCallback(
    (to: string) => {
      setActive(to);
      navigation.navigate(to);

      if (to == "Login") {
        setActive((prev) => "Home");
      }
    },
    [navigation, setActive]
  );
  const handleWebLink = useCallback((url: string) => Linking.openURL(url), []);

  // async function logout() {
  //   try {
  //     await AsyncStorage.removeItem('user');
  //     handleNavigation('Login')
  //     setIdentity(null);
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  // const retrieveIdentity = async () => {
  //   try {
  //     const userData = await AsyncStorage.getItem("user");
  //     if (!userData) {
  //       return;
  //     }
  //     const parsed = JSON.parse(userData);
  //     if (parsed !== null) {
  //       setIdentity(parsed);
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   }
  // };

  const retrieveDrawerMenuItems = () => {
    //// screen list for Drawer menu
    // return [
    //   { name: t("screens.home"), to: "Home", icon: assets.home },
    //   { name: t("screens.components"), to: "Components", icon: assets.components },
    //   { name: t("screens.articles"), to: "Articles", icon: assets.document },
    //   { name: t("screens.event"), to: "Rentals", icon: assets.rental },
    //   { name: t("screens.profile"), to: "Profile", icon: assets.profile },
    //   { name: t("screens.settings"), to: "Settings", icon: assets.settings },
    //   // {name: t('screens.login'), to: 'Register', icon: assets.register},
    //   { name: t("screens.extra"), to: "Extra", icon: assets.extras },
    //   // {name: 'Bookings', to: 'Booking', icon: assets.register},
    // ];

    // Caregiver screen list for Drawer menu
    const screensCaregiver = [
      { name: t("screens.home"), to: "Home", icon: assets.home }, // Home is where you will render the calender
      { name: t("screens.profile"), to: "Profile", icon: assets.profile },
    ];
    // Volunteer screen list for Drawer menu
    const screensVolunteer = [
      { name: t("screens.home"), to: "Home", icon: assets.home }, // Home is where you will render the calender
      { name: t("screens.profile"), to: "Profile", icon: assets.profile },
    ];
    // Staff screen list for Drawer menu
    const screensStaff = [
      { name: t("screens.home"), to: "Home", icon: assets.home }, // Home is where you will render the calender
      { name: t("screens.profile"), to: "Profile", icon: assets.profile },
    ];

    if (identity == null) {
      return [];
    }
    if (identity["type"].toLowerCase() == "caregiver") {
      return screensCaregiver;
    }
    if (identity["type"].toLowerCase() == "volunteer") {
      return screensVolunteer;
    }
    if (identity["type"].toLowerCase() == "staff") {
      return screensStaff;
    }
    return [];
  };

  useEffect(() => {
    if (isDrawerOpen) {
      // console.log("Drawer is open");
      retrieveIdentity();
      console.log("identity", identity);
    }
  }, [isDrawerOpen]);

  return (
    <DrawerContentScrollView
      {...props}
      scrollEnabled
      renderToHardwareTextureAndroid
      contentContainerStyle={{ paddingBottom: sizes.padding }}
    >
      <Block paddingHorizontal={sizes.padding}>
        <Block flex={0} row align="center" marginBottom={sizes.l}>
          {/* <Image radius={0} width={33} height={33} color={colors.text} source={assets.logo} marginRight={sizes.sm} />
          <Block>
            <Text size={12} semibold>
              {t("app.name")}
            </Text>
            <Text size={12} semibold>
              {t("app.native")}
            </Text>
          </Block> */}
        </Block>

        {retrieveDrawerMenuItems()
          .filter((screen) => {
            // Replace 'Profile' with the screen name you want to conditionally exclude
            if (screen.to === "Profile" && !identity) {
              return false;
            }
            return true;
          })
          .map((screen, index) => {
            const isActive = active === screen.to;
            return (
              <Button
                row
                justify="flex-start"
                marginBottom={sizes.s}
                key={`menu-screen-${screen.name}-${index}`}
                onPress={() => handleNavigation(screen.to)}
              >
                <Block
                  flex={0}
                  radius={6}
                  align="center"
                  justify="center"
                  width={sizes.md}
                  height={sizes.md}
                  marginRight={sizes.s}
                  gradient={gradients[isActive ? "primary" : "white"]}
                >
                  <Image
                    radius={0}
                    width={14}
                    height={14}
                    source={screen.icon}
                    color={colors[isActive ? "white" : "black"]}
                  />
                </Block>
                <Text p semibold={isActive} color={labelColor}>
                  {screen.name}
                </Text>
              </Button>
            );
          })}

        <Block flex={0} height={1} marginRight={sizes.md} marginVertical={sizes.sm} gradient={gradients.menu} />

        {/* <Text semibold transform="uppercase" opacity={0.5}>
          {t('menu.documentation')}
        </Text> */}

        <Button
          row
          justify="flex-start"
          marginTop={sizes.sm}
          marginBottom={sizes.s}
          onPress={() => {
            if (identity) {
              logout(); // Call logout function from UserContext
              handleNavigation("Login");
            } else {
              handleNavigation("Login");
            }
          }}
        >
          <Block
            flex={0}
            radius={6}
            align="center"
            justify="center"
            width={sizes.md}
            height={sizes.md}
            marginRight={sizes.s}
            gradient={gradients.white}
          >
            <Image radius={0} width={14} height={14} color={colors.black} source={assets.register} />
          </Block>
          <Text p color={labelColor}>
            {identity ? t("menu.logout") : t("menu.login")}
          </Text>
        </Button>

        <Block row justify="space-between" marginTop={sizes.sm}>
          <Text color={labelColor}>{t("darkMode")}</Text>
          <Switch checked={isDark} onPress={(checked) => handleIsDark(checked)} />
        </Block>
      </Block>
    </DrawerContentScrollView>
  );
};

/* drawer menu navigation */
export default () => {
  const { isDark } = useData();
  const { gradients } = useTheme();

  return (
    <Block gradient={gradients[isDark ? "dark" : "light"]}>
      <Drawer.Navigator
        screenOptions={{
          drawerType: "slide",
          overlayColor: "transparent",
          sceneContainerStyle: { backgroundColor: "transparent" },
          drawerStyle: {
            flex: 1,
            width: "60%",
            borderRightWidth: 0,
            backgroundColor: "transparent",
          },
          headerShown: false,
        }}
        drawerContent={(props) => <DrawerContent {...props} />}
      >
        <Drawer.Screen name="Screens" component={ScreensStack} />
      </Drawer.Navigator>
    </Block>
  );
};
