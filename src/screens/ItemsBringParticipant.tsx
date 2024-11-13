import React, { useContext, useEffect, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/core";

import { useTheme, useTranslation } from "../hooks";
import { Block, Button, Text } from "../components";
import { UserContext } from "../hooks/userContext";
import { findItemsForClient } from "../../api/subscribe";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchEvent } from "../../api/event";

const ItemsBringParticipant = () => {
  const { t } = useTranslation();
  const route = useRoute();
  const navigation = useNavigation();
  const { gradients, sizes } = useTheme();
  const [thingsToBring, setThingsToBring] = useState([]);
  const [itemsPresent, setItemsPresent] = useState([]);
  const [buttonProps, setButtonProps] = useState([]);

  // Retrieve from route parameters
  const { eventId, participantId } = route.params;
  // const { identity, retrieveIdentity } = useContext(UserContext);

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
    const fetchItemsToBring = async (eventId) => {
      try {
        const event = await fetchEvent(eventId);
        console.log("event:", event);
        setThingsToBring(event?.itemsToBring || []);
      } catch (error) {
        console.error("Error fetching event:", error);
      }
    };

    fetchItemsToBring(eventId);
  }, [eventId]);

  // useEffect(() => {
  //   console.log("thingsToBring", thingsToBring);
  //   const fetchItems = async () => {
  //     console.log("Id", participantId);
  //     try {
  //       const itemsBought = await findItemsForClient(participantId);
  //       console.log("Items bought", itemsBought);

  //       areItemsBrought(itemsBought);

  //       const intervalId = setInterval(() => areItemsBrought(itemsBought), 1000); // Runs every second
  //       // Cleanup function
  //       return () => {
  //         clearInterval(intervalId); // Clears the interval when the component unmounts
  //         console.log("Interval cleared");
  //       };
  //     } catch (error) {
  //       console.error("Error fetching items for client:", error);
  //     }
  //   };

  //   if (thingsToBring.length > 0) {
  //     console.log("Fetching items");
  //     fetchItems();
  //   }
  // }, [participantId, thingsToBring]);

  // useEffect(() => {
  //   console.log("EventId:", eventId);
  //   const fetchItemsToBring = async (eventId: string) => {
  //     try {
  //       const event = await fetchEvent(eventId);
  //       console.log("event:", event);
  //       setThingsToBring(event?.itemsToBring);
  //     } catch (error) {
  //       console.error("Error fetching event:", error);
  //     }
  //   };

  //   console.log("thingsToBring", thingsToBring);
  //   const fetchItems = async () => {
  //     console.log("Id", participantId);
  //     try {
  //       const itemsBought = await findItemsForClient(participantId);
  //       console.log("Items bought", itemsBought);

  //       areItemsBrought(itemsBought);

  //       const intervalId = setInterval(() => areItemsBrought(itemsBought), 1000); // Runs every second
  //       // Cleanup function
  //       return () => {
  //         clearInterval(intervalId); // Clears the interval when the component unmounts
  //         console.log("Interval cleared");
  //       };
  //     } catch (error) {
  //       console.error("Error fetching items for client:", error);
  //     }
  //   };

  //   fetchItemsToBring(eventId);
  //   fetchItems();
  // }, [thingsToBring]);


  useEffect(() => {
    console.log("thingsToBring", thingsToBring);

    const fetchItems = async () => {
      console.log("Id", participantId);
      try {
        const itemsBought = await findItemsForClient(participantId);
        console.log("Items bought", itemsBought);
        areItemsBrought(itemsBought);
      } catch (error) {
        console.error("Error fetching items for client:", error);
      }
    };

    // Only set up the interval if there are items to bring
    if (thingsToBring.length > 0) {
      console.log("Fetching items");

      // Immediately fetch items once
      fetchItems();

      // Set up interval to fetch items every 2 seconds
      const intervalId = setInterval(fetchItems, 2000); // Runs every 2 seconds

      // Cleanup function to clear the interval when the component unmounts
      return () => {
        clearInterval(intervalId);
        console.log("Interval cleared");
      };
    }
  }, [participantId, thingsToBring]);

  
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

export default ItemsBringParticipant;