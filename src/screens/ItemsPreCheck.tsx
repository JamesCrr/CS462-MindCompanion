import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/core";

import { useTheme, useTranslation } from "../hooks";
import { Block, Button, Text } from "../components";
import { UserContext } from "../hooks/userContext";
import { findItemsForClient } from "../../api/subscribe";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ItemsPreCheck = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { gradients, sizes } = useTheme();
  const [itemsPresent, setItemsPresent] = useState([]);
  const [buttonProps, setButtonProps] = useState([]);

  // Retrieve from route parameters
  const { eventId, thingsToBring } = route.params;
  const { identity, retrieveIdentity } = useContext(UserContext);

  /**
   * Check if the item has been brought
   */
  const areItemsBrought = async (itemsBought: any[]) => {
    let newProps = [];
    const itemOrder = ["card", "umbrella", "water bottle"];
    for (let item of thingsToBring) {
      const index = itemOrder.indexOf(item.toLowerCase());
      if (index !== -1 && itemsBought[index]) {
        newProps.push({ success: true });
      } else {
        newProps.push({ danger: true });
      }
    }
    setButtonProps(newProps);
  };

  useEffect(() => {
    console.log("EventId:", eventId);
    console.log("thingsToBring", thingsToBring);
    const fetchItems = async () => {
      console.log("Identity", identity);
      try {
        const itemsBought = await findItemsForClient(identity.id);
        console.log("Items bought", itemsBought);

        areItemsBrought(itemsBought);

        const intervalId = setInterval(() => areItemsBrought(itemsBought), 1000); // Runs every second
        // Cleanup function
        return () => {
          clearInterval(intervalId); // Clears the interval when the component unmounts
          console.log("Interval cleared");
        };
      } catch (error) {
        console.error("Error fetching items for client:", error);
      }
    };

    fetchItems();
  }, [identity, thingsToBring]);

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