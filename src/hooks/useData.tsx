import React, { useCallback, useContext, useEffect, useState } from "react";
import Storage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { db } from "../../config/firebaseConfig"; // Import db from your config file
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  IArticle,
  ICategory,
  IProduct,
  IUser,
  IUseData,
  IBasket,
  INotification,
  ITheme,
  IEvent, // Define your IEvent type
  IEvent2,
} from "../constants/types";

import {
  USERS,
  FOLLOWING,
  TRENDING,
  CATEGORIES,
  ARTICLES,
  BASKET,
  NOTIFICATIONS,
  RECOMMENDATIONS,
} from "../constants/mocks";
import { light, dark } from "../constants";

export const DataContext = React.createContext({});

export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(false);
  const [theme, setTheme] = useState<ITheme>(light);
  const [user, setUser] = useState<IUser>(USERS[0]);
  const [basket, setBasket] = useState<IBasket>(BASKET);
  const [users, setUsers] = useState<IUser[]>(USERS);
  const [following, setFollowing] = useState<IProduct[]>(FOLLOWING);
  const [trending, setTrending] = useState<IProduct[]>(TRENDING);
  const [categories, setCategories] = useState<ICategory[]>(CATEGORIES);
  const [recommendations, setRecommendations] = useState<IArticle[]>(RECOMMENDATIONS);
  const [events, setEvents] = useState<IEvent2[]>([]);
  const [articles, setArticles] = useState<IEvent2[]>(ARTICLES);
  const [article, setArticle] = useState<IEvent2>({});
  const [notifications, setNotifications] = useState<INotification[]>(NOTIFICATIONS);
  const [identity, setIdentity] = useState<IUser>();

  // get isDark mode from storage
  const getIsDark = useCallback(async () => {
    // get preference from storage
    const isDarkJSON = await Storage.getItem("isDark");

    if (isDarkJSON !== null) {
      // set isDark / compare if has updated
      setIsDark(JSON.parse(isDarkJSON));
    }
  }, [setIsDark]);

  // handle isDark mode
  const handleIsDark = useCallback(
    (payload: boolean) => {
      // set isDark / compare if has updated
      setIsDark(payload);
      // save preference to storage
      Storage.setItem("isDark", JSON.stringify(payload));
    },
    [setIsDark]
  );

  // handle users / profiles
  const handleUsers = useCallback(
    (payload: IUser[]) => {
      // set users / compare if has updated
      if (JSON.stringify(payload) !== JSON.stringify(users)) {
        setUsers({ ...users, ...payload });
      }
    },
    [users, setUsers]
  );

  // handle basket
  const handleBasket = useCallback(
    (payload: IBasket) => {
      // set basket items / compare if has updated
      if (JSON.stringify(payload) !== JSON.stringify(basket)) {
        const subtotal = payload?.items?.reduce((total, item) => {
          total += (item.price || 0) * (item.qty || 1);
          return total;
        }, 0);
        setBasket({ ...basket, ...payload, subtotal });
      }
    },
    [basket, setBasket]
  );

  // handle user
  const handleUser = useCallback(
    (payload: IUser) => {
      // set user / compare if has updated
      if (JSON.stringify(payload) !== JSON.stringify(user)) {
        setUser(payload);
      }
    },
    [user, setUser]
  );

  // handle Article
  const handleArticle = useCallback(
    (payload: IEvent2) => {
      // set article / compare if has updated
      if (JSON.stringify(payload) !== JSON.stringify(article)) {
        setArticle(payload);
      }
    },
    [article, setArticle]
  );

  // handle Notifications
  const handleNotifications = useCallback(
    (payload: INotification[]) => {
      // set notifications / compare if has updated
      if (JSON.stringify(payload) !== JSON.stringify(notifications)) {
        setNotifications(payload);
      }
    },
    [notifications, setNotifications]
  );

  // Fetch events from Firestore and map to articles
  // const fetchEvents = useCallback(async () => {
  //   console.log("Fetching events...");
  //   try {
  //     const eventsCollection = collection(db, "events");
  //     const eventsSnapshot = await getDocs(eventsCollection);
  //     // const eventsList = eventsSnapshot.docs.map(doc => doc.data() as IEvent);
  //     // const articlesList = eventsList.map(event => (
  //     //   {
  //     //     id: event.id ?? 0,
  //     //     title: event.title ?? "Untitled Event",
  //     //     description: event.description ?? "No description available",
  //     //     category: event.category ?? { id: 0, name: "Uncategorized" },
  //     //     image: event.image ?? "default_image_url",
  //     //     location: event.location ?? { address: "Unknown location" },
  //     //     rating: event.rating ?? 0,
  //     //     user: event.user ?? { id: 0, name: "Unknown user" },
  //     //     offers: event.offers ?? [],
  //     //     options: event.options ?? [],
  //     //     timestamp: event.timestamp ?? Date.now(),
  //     //     onPress: event.onPress ?? (() => {}),
  //     // } as IEvent));
  //     // console.log("Fetched events: ", articlesList);
  //     // setEvents(articlesList);

  //     const eventList = eventsSnapshot.docs.map((doc) => {
  //       const data = doc.data();
  //       // console.log("Event data:", data, "\n", "docId:", doc.id, "dateTime:", data.datetime);
  //       const date = new Date(data.datetime.seconds * 1000); // Convert seconds to milliseconds
  //       const formattedDate = date
  //         .toLocaleString("en-US", {
  //           day: "2-digit",
  //           month: "short",
  //           year: "numeric",
  //           hour: "numeric",
  //           minute: "numeric",
  //           hour12: true,
  //         })
  //         .replace(",", " -"); // Format the date and time
  //       // const event: IEvent = {
  //       //   id: doc.id,
  //       //   title: data.title ?? "Untitled Event",
  //       //   description: data.name ?? "No description available",
  //       //   category: data.category ?? { id: 0, name: "Uncategorized" },
  //       //   image: data.image ?? "default_image_url",
  //       //   location: data.location ?? "No location",
  //       //   rating: data.rating ?? 0,
  //       //   user: data.user ?? { id: 0, name: "Unknown user" },
  //       //   offers: data.offers ?? [],
  //       //   options: data.options ?? [],
  //       //   timestamp: data.timestamp ?? Date.now(),
  //       //   onPress: data.onPress ?? (() => {}),
  //       // };
  //       const event: IEvent2 = {
  //         id: doc.id,
  //         title: data.name ?? "Untitled Event",
  //         information: data.information ?? "No information available",
  //         category: data.category ?? { id: 0, name: "Uncategorized" },
  //         image: data.image ?? "default_image_url",
  //         location: data.location ?? "No location",
  //         dateTime: formattedDate ?? "No date available",
  //         thingsToBring: data.itemsToBring ?? [],
  //         meetUpLocations: data.meetUpLocations ?? [],
  //         participants: data.participants ?? [],
  //         volunteers: data.volunteers ?? [],
  //         timestamp: data.timestamp ?? Date.now(),
  //         onPress: data.onPress ?? (() => {}),
  //       };
  //       return event;
  //     });
  //     setEvents(eventList);
  //   } catch (error) {
  //     console.error("Error fetching events: ", error);
  //   }
  // }, [setEvents]);

  const fetchEvents = useCallback(async () => {
    console.log("Fetching events...");
    try {
      const eventsCollection = collection(db, "events");
      const eventsSnapshot = await getDocs(eventsCollection);
  
      const eventList = eventsSnapshot.docs.map((doc) => {
        try {
          const data = doc.data();
          // Check if datetime exists and is valid
          let formattedDate = "No date available";
          if (data.datetime && data.datetime.seconds) {
            const date = new Date(data.datetime.seconds * 1000); // Convert seconds to milliseconds
            formattedDate = date
              .toLocaleString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              })
              .replace(",", " -"); // Format the date and time
          }
  
          const event: IEvent2 = {
            id: doc.id,
            title: data.name ?? "Untitled Event",
            information: data.information ?? "No information available",
            category: data.category ?? { id: 0, name: "Uncategorized" },
            image: data.image ?? "default_image_url",
            location: data.location ?? "No location",
            dateTime: formattedDate,
            thingsToBring: data.itemsToBring ?? [],
            meetUpLocations: data.meetUpLocations ?? [],
            participants: data.participants ?? [],
            volunteers: data.volunteers ?? [],
            timestamp: data.timestamp ?? Date.now(),
            published: data.published ?? false,
            onPress: data.onPress ?? (() => {}),
          };
          return event;
        } catch (eventError) {
          console.error(`Error processing event with ID ${doc.id}:`, eventError);
          return null; // Return null if there is an error
        }
      }).filter(event => event !== null); // Filter out null values
  
      setEvents(eventList);
    } catch (error) {
      console.error("Error fetching events: ", error);
    }
  }, [setEvents]);

  // get initial data for: isDark & events
  useEffect(() => {
    getIsDark();
    fetchEvents(); // Fetch events from Firestore
  }, [getIsDark, fetchEvents]);

  // change theme based on isDark updates
  useEffect(() => {
    setTheme(isDark ? dark : light);
  }, [isDark]);

  const contextValue = {
    isDark,
    handleIsDark,
    theme,
    setTheme,
    user,
    users,
    handleUsers,
    handleUser,
    basket,
    handleBasket,
    following,
    setFollowing,
    trending,
    setTrending,
    categories,
    setCategories,
    events, // Replace recommendations with events
    setEvents, // Add setEvents to context
    fetchEvents, 
    recommendations,
    setRecommendations,
    articles,
    setArticles,
    article,
    handleArticle,
    notifications,
    handleNotifications,
    identity,
    setIdentity,
  };

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

export const useData = () => useContext(DataContext) as IUseData;
