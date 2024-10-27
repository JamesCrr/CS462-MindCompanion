import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    arrayUnion,
    arrayRemove,
  } from "firebase/firestore";
  import { db } from "../config/firebaseConfig";
  
  export async function fetchEvent(eventId = "") {
    try {
      const docRef = doc(db, "events", eventId);
      const docSnap = await getDoc(docRef);
  
      if (docSnap.exists()) {
        return docSnap.data();
      }
      // docSnap.data() will be undefined in this case
    } catch (e) {
      console.error("Error fetching documents: ", e.message);
      throw new Error("Failed to fetch event records");
    }
    return null;
  }
  
  export const fetchAllEvents = async () => {
    try {
      const eventsCollection = collection(db, "events");
      const querySnapshot = await getDocs(eventsCollection);
      const events = querySnapshot.docs.map((doc) => ({
        dateTime: doc.data().dateTime,
        eventId: doc.id,
        information: doc.data().information,
        itemsToBring: doc.data().itemsToBring,
        meetUpLocation: doc.data.meetUpLocation,
        name: doc.data().name,
        participants: doc.data().participants,
        volunteers: doc.data().volunteers,
      }));
      return events;
    } catch (e) {
      console.error("Error fetching documents: ", e.message);
      throw new Error("Failed to fetch event records");
    }
  };
  
  export const updateEvent = async (eventId = "", eventpayload) => {
    try {
      console.log(eventpayload);
      const docRef = doc(db, "events", eventId);
  
      await setDoc(docRef, eventpayload);
      return "doc updated";
    } catch (e) {
      console.error("Error fetching documents: ", e.message);
      throw new Error("Failed to fetch event records");
    }
  };
  
  export const InsertEvent = async (eventpayload) => {
    try {
      console.log(eventpayload);
      eventpayload.participants = [];
      eventpayload.volunteers = [];
      eventpayload.published = false;
      const collectionRef = collection(db, "events");
  
      await addDoc(collectionRef, eventpayload);
      return "doc added";
    } catch (e) {
      console.error("Error adding documents: ", e.message);
      throw new Error("Failed to add event records");
    }
  };
  export const fetchAllEventsOfUser = async (userId) => {
    try {
      const eventsCollection = collection(db, "events");
      const q = query(
        eventsCollection,
        where("participants", "array-contains", userId)
      );
      const querySnapshot = await getDocs(q);
      const events = querySnapshot.docs.map((doc) => ({
        dateTime: doc.data().dateTime,
        eventId: doc.id,
        information: doc.data().information,
        itemsToBring: doc.data().itemsToBring,
        meetUpLocation: doc.data().meetUpLocation,
        name: doc.data().name,
        participants: doc.data().participants,
        volunteers: doc.data().volunteers,
      }));
      return events;
    } catch (e) {
      console.error("Error fetching documents: ", e.message);
      throw new Error("Failed to fetch event records");
    }
  };
  
  export const userJoinEvent = async (eventId, userName, meetingLocation, comingWithCaregiver) => {
    try {
      const eventDoc = doc(db, "events", eventId);
      console.log("EventDOc", eventDoc)
      /**
       * If your document contains an array field, you can use arrayUnion() and arrayRemove() to add and remove elements.
       * arrayUnion() adds elements to an array but only elements not already present.
       * arrayRemove() removes all instances of each given element.
       */
      await updateDoc(eventDoc, {
        participants: arrayUnion(`${userName},${meetingLocation},${comingWithCaregiver}`),
      });
  
      return true;
    } catch (e) {
      console.error("Error fetching documents: ", e.message);
      throw new Error("Failed to fetch event records");
    }
  };
  
  // export async function updateEventRecord(docId, updatedPerformance, remarks) {
  //   try {
  //     const recordRef = doc(db, 'eventRecords', docId);
  //     await updateDoc(recordRef, {
  //       performance: updatedPerformance,
  //       remarks: remarks
  //     });
  //     console.log("Document successfully updated!");
  //   } catch (e) {
  //     console.error("Error updating document: ", e);
  //   }
  // }
  
  // export async function deleteEventRecord(docId) {
  //   try {
  //     await deleteDoc(doc(db, 'eventRecords', docId));
  //     console.log("Document successfully deleted!");
  //   } catch (e) {
  //     console.error("Error deleting document: ", e);
  //   }
  // }
  