import { useEffect, useContext } from 'react';
import * as Notifications from 'expo-notifications';
import { UserContext } from '../hooks/userContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebaseConfig';
import { format } from 'date-fns';

console.log('🚀 EventNotification component loaded');

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log('📱 Notification handler triggered');
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    };
  },
});

const EventNotification = () => {
  const context = useContext(UserContext);

  useEffect(() => {
    const initializeNotifications = async () => {
      if (!context?.identity) {
        console.log('⏳ Waiting for identity...');
        return;
      }

      console.log('👤 User context loaded:', {
        name: context.identity.name,
        type: context.identity.type,
        uid: context.identity.uid
      });

      const permissionGranted = await requestPermissions();
      if (permissionGranted) {
        await checkUpcomingEvents();
      }
    };

    initializeNotifications();

    if (context?.identity) {
      console.log('⏰ Setting up interval check');
      const interval = setInterval(() => {
        console.log('🔄 Running periodic check for:', context.identity.name);
        checkUpcomingEvents();
      }, 60000);
      
      return () => clearInterval(interval);
    }
  }, [context?.identity]);

  const requestPermissions = async () => {
    console.log('📝 Requesting notification permissions...');
    const { status } = await Notifications.requestPermissionsAsync();
    console.log('📋 Permission status:', status);
    
    if (status !== 'granted') {
      console.log('❌ Notification permissions denied');
      return false;
    }
    console.log('✅ Notification permissions granted');
    return true;
  };

  const checkUpcomingEvents = async () => {
    if (!context?.identity) {
      console.log('⚠️ No user context available for checking events');
      return;
    }

    console.log('🔍 Starting event check for:', context.identity.name);
    const now = new Date();
    console.log('⏰ Current time:', format(now, 'yyyy-MM-dd HH:mm:ss'));
    
    const events = await getDocs(collection(db, "events"));
    console.log('📚 Total events found:', events.size);
    
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('🧹 Cleared existing notifications');
    
    let processedEvents = 0;
    let futureEvents = 0;
    let userEvents = 0;
    let scheduledNotifications = 0;

    events.forEach((doc) => {
      processedEvents++;
      const event = doc.data();
      const eventDate = event.datetime.toDate();
      
      console.log(`\n📅 Processing event ${processedEvents}/${events.size}:`, {
        name: event.name,
        date: format(eventDate, 'yyyy-MM-dd HH:mm'),
        isFuture: eventDate > now,
        published: event.published
      });
      
      if (eventDate > now) {
        futureEvents++;
        const isUserInEvent = 
          (context.identity.type === 'Caregiver' && event.participants?.some(
            (participant) => {
              const isParticipant = participant.split(',')[0] === context.identity.name;
              console.log('👥 Checking participant:', participant, isParticipant ? '✅' : '❌');
              return isParticipant;
            }
          )) ||
          (context.identity.type === 'Volunteer' && event.volunteers?.includes(context.identity.name));

        console.log('🎯 Participation check:', {
          eventName: event.name,
          isUserInEvent,
          userType: context.identity.type,
          published: event.published
        });

        if (isUserInEvent) {
          userEvents++;
          if (event.published) {
            console.log('🔔 Scheduling notification for:', event.name);
            scheduleNotification(event);
            scheduledNotifications++;
          } else {
            console.log('📝 Event not published, skipping notification');
          }
        }
      }
    });

    console.log('\n📊 Event Processing Summary:', {
      totalEvents: events.size,
      processedEvents,
      futureEvents,
      userEvents,
      scheduledNotifications
    });
  };

  const scheduleNotification = async (event) => {
    const eventTime = event.datetime.toDate();
    const notificationTime = new Date(eventTime.getTime() - (2 * 60 * 60 * 1000));
    const now = new Date();

    console.log('\n🔔 Scheduling notification:', {
      eventName: event.name,
      eventTime: format(eventTime, 'yyyy-MM-dd HH:mm'),
      notificationTime: format(notificationTime, 'yyyy-MM-dd HH:mm'),
      timeUntilNotification: Math.round((notificationTime.getTime() - now.getTime()) / 1000 / 60)
    });

    if (notificationTime > now) {
      try {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Event Reminder',
            body: `Your event "${event.name}" at ${event.location} starts in 2 hours!`,
            data: { eventId: event.id },
          },
          trigger: {
            date: notificationTime,
          },
        });
        console.log('✅ Notification scheduled successfully:', {
          id: notificationId,
          event: event.name,
          time: format(notificationTime, 'yyyy-MM-dd HH:mm')
        });
        
        const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
        console.log('📱 Current scheduled notifications:', {
          count: scheduledNotifications.length,
          notifications: scheduledNotifications.map(n => ({
            id: n.identifier,
            title: n.content.title,
            trigger: n.trigger
          }))
        });
      } catch (error) {
        console.error('❌ Failed to schedule notification:', {
          error,
          event: event.name,
          time: format(notificationTime, 'yyyy-MM-dd HH:mm')
        });
      }
    } else {
      console.log('⏭️ Notification time has passed, skipping:', {
        event: event.name,
        notificationTime: format(notificationTime, 'yyyy-MM-dd HH:mm')
      });
    }
  };

  return null;
};

export default EventNotification; 