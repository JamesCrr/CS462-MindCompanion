import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/core";

import { useTheme, useTranslation } from "../hooks";
import { Block, Button, Text } from "../components";
import { UserContext } from "../hooks/userContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ItemsPreCheck = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { gradients, sizes } = useTheme();
  const [buttonProps, setButtonProps] = useState([]);

  // Retrieve from route parameters
  const { eventId, thingsToBring } = route.params;
  const { identity, retrieveIdentity } = useContext(UserContext);

  /**
   * Check if the item has been brought
   */
  const areItemsBrought = async () => {
    let newProps = [];
    for (let _ of thingsToBring) {
      newProps.push({ success: true });
      // newProps.push({danger:true})
    }
    setButtonProps(newProps);
  };

  useEffect(() => {
    // console.log("eventId", eventId);
    // console.log("thingsToBring", thingsToBring);

    const intervalId = setInterval(areItemsBrought, 1000); // Runs every second
    // Cleanup function
    return () => {
      clearInterval(intervalId); // Clears the interval when the component unmounts
      console.log("Interval cleared");
    };
  }, []);

  const CARD_WIDTH = sizes.width - sizes.s;
  const hasSmallScreen = sizes.width < 414; // iPhone 11
  const SNAP_OFFSET = CARD_WIDTH - (hasSmallScreen ? 28 : 19) + sizes.s;

  return (
    <Block
      scroll
      nestedScrollEnabled
      padding={sizes.padding}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: sizes.padding * 1.5 }}
    >
      <Text h4 semibold>
        Things to Bring
      </Text>
      {Array.isArray(thingsToBring) && thingsToBring.length > 0 && (
        <Block justify="center" marginTop={sizes.s}>
          {thingsToBring.map((item, index) => {
            const btnprop = buttonProps[index] || { dark: true }; // Get the corresponding button prop
            return (
              <Button marginTop={sizes.s} key={index} rounded {...btnprop} disabled>
                <Text>{item}</Text>
              </Button>
            );
          })}
        </Block>
      )}
    </Block>
  );
};

export default ItemsPreCheck;
