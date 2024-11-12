import { collection, doc,setDoc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where} from "firebase/firestore"; 
import { db } from "../config/firebaseConfig";


// Function to fetch all event 


export async function fetchEventRecordUsingParticipantName(eventId, name) {
  try {
    const eventDocRef = doc(db, "eventRecords", eventId);
    const eventDoc = await getDoc(eventDocRef);

    if (eventDoc.exists()) {
      const eventData = eventDoc.data();
      const userRecord = eventData.records.find(record => record[name]);

      if (userRecord) {
        return userRecord[name];
      } else {
        console.log(`No record found for user: ${name}`);
        return null;
      }
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (e) {
    console.error("Error fetching document: ", e.message);
    throw new Error("Failed to fetch event record");
  }
}

// Function to add a new event record
export async function addNewEventRecord(eventId, name) {
  console.log("Adding new event record for user: ", name);
  try {
    const eventDocRef = doc(db, "eventRecords", eventId);
    const eventDoc = await getDoc(eventDocRef);

    if (eventDoc.exists()) {
      const eventData = eventDoc.data();
      const userRecord = eventData.records.find(record => record[name]);
      const eventStats = {
        achievements: [],
        completion: 0,
        rank: 0,
        score: 0,
        remarks: ""
      }
      if (!userRecord) {
        const updatedRecords = [...eventData.records, { [name]: eventStats }];
        await updateDoc(eventDocRef, {
          records: updatedRecords
        });
        console.log("Document successfully updated!");
      } else {
        console.log(`Record already exists for user: ${name}`);
      }
    } else {
      console.log("No such document!");
    }
  } catch (e) {
    console.error("Error adding document: ", e.message);
  }
}

export async function updateEventRecord(eventId, name, eventStats) {
  console.log("Updating new event record for user: ", name);
  try {
    const eventDocRef = doc(db, "eventRecords", eventId);
    const eventDoc = await getDoc(eventDocRef);

    if (eventDoc.exists()) {
      const eventData = eventDoc.data();
      const userRecord = eventData.records.find(record => record[name]);

      if (userRecord) {
        const updatedRecords = eventData.records.map(record => {
          if (record[name]) {
            return { [name]: eventStats };
          } else {
            return record;
          }
        });

        await updateDoc(eventDocRef, {
          records: updatedRecords
        });
        console.log("Document successfully updated!");
      } else {
        console.log(`No record found for user: ${name}`);
      }
    } else {
      console.log("No such document!");
    }
  } catch (e) {
    console.error("Error updating document: ", e.message);
  }
}


export async function deleteEventRecord(eventId, name) {
  console.log("Deleting new event record for user: ", name);
  try {
    const eventDocRef = doc(db, "eventRecords", eventId);
    const eventDoc = await getDoc(eventDocRef);

    if (eventDoc.exists()) {
      const eventData = eventDoc.data();
      const userRecord = eventData.records.find(record => record[name]);

      if (userRecord) {
        const updatedRecords = eventData.records.filter(record => !record[name]);
        await updateDoc(eventDocRef, {
          records: updatedRecords
        });
        console.log("Document successfully updated!");
      } else {
        console.log(`No record found for user: ${name}`);
      }
    } else {
      console.log("No such document!");
    }
  } catch (e) {
    console.error("Error deleting document: ", e.message);
  }
}

export async function fetchAllEventsAndRecordsForUser(name) {
  try {
    const eventsCollectionRef = collection(db, "eventRecords");
    const eventsSnapshot = await getDocs(eventsCollectionRef);

    const userEvents = [];

    for (const eventDoc of eventsSnapshot.docs) {
      if (eventDoc.exists()) {
        const eventData = eventDoc.data();
        console.log("Event Data and checking Id", eventDoc.id);
        const eventRef = doc(db, "events", eventDoc.id);
        const docSnap = await getDoc(eventRef);
        const data = docSnap.data();
        // Check if records array exists and is an array
        if (Array.isArray(eventData.records)) {
          // Iterate through the records array to find the user record
          const userRecord = eventData.records.find(record => record[name]);

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
          
          const eventDetails = {
            id: doc.id, 
            title: data.name ?? "Untitled Event",
            image: data.image ?? "default_image_url",
            location: data.location ?? "No location",
            dateTime: formattedDate,
            timestamp: data.timestamp ?? Date.now(),
            onPress: data.onPress ?? (() => {}),
          }

          if (userRecord) {
            userEvents.push({
              eventId: eventDoc.id,
              eventDetails: eventDetails,
              userRecord: userRecord[name]
            });
          } else {
            console.log(`No record found for user: ${name}`);
          }
        } else {
          console.log("No records array found or records is not an array");
        }
      } else {
        console.log("No such document!");
      }
    }

    return userEvents;

  } catch (e) {
    console.error("Error fetching documents: ", e.message);
    throw new Error("Failed to fetch events and records");
  }
}

export async function addEventIntoEventRecords(id) {
  try {
    const docRef = doc(db, "eventRecords", id);
    const res = await setDoc(docRef, { records: [] });
    console.log("Document written with ID: ", docRef.id);
    return res;
  } catch (e) {
    console.error("Error adding event into eventRecords: ", e);
  }
}

export async function deleteEventInEventRecords(id) {
  try {
    await deleteDoc(doc(db, "eventRecords", id));
    console.log("Document successfully deleted!");
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}

// export async function fetchEventRecordFromDB(eventId, userId) {
//   try {
//     const eventDocRef = doc(db, "eventRecords", eventId);
//     const eventDoc = await getDoc(eventDocRef);

//     if (eventDoc.exists()) {
//       const eventData = eventDoc.data();
//       console.log("UserRecords", eventData.records);
//       console.log("UserId", userId);

//       // Iterate through the records array to find the user record
//       const userRecord = eventData.records.find(record => record[userId]);

//       console.log("UserRecord", userRecord ? userRecord[userId] : null);
//       return userRecord ? userRecord[userId] : null;

//     } else {
//       console.log("No such document!");
//       return null;
//     }
//   } catch (e) {
//     console.error("Error fetching document: ", e.message);
//     throw new Error("Failed to fetch event record");
//   }
// }


export async function fetchAttendeesInEvent(eventId="") {
  try {
    const q = query(collection(db, "eventRecords"), eventId);
    const querySnapshot = await getDocs(q);
    let attendees = [];
    querySnapshot.forEach((doc) => {
      attendees.push(doc.data());
    });
    return attendees;
  } catch (e) {
    console.error("Error fetching documents: ", e.message);
    throw new Error("Failed to fetch event records");
  }
}


// export async function updateEventRecord(userId, eventId, achievements ,completion, rank, remarks) {
//   try {
//     const recordRef = doc(db, 'eventRecords', eventId);
//     await updateDoc(recordRef, {
      
//       remarks: remarks
//     });
//     console.log("Document successfully updated!");
//   } catch (e) {
//     console.error("Error updating document: ", e);
//   }
// }

export async function deleteEvent(docId) {
  try {
    await deleteDoc(doc(db, 'eventRecords', docId));
    console.log("Document successfully deleted!");
  } catch (e) {
    console.error("Error deleting document: ", e);
  }
}




