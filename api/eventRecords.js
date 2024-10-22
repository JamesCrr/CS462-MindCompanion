import { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where} from "firebase/firestore"; 
import { db } from "../config/firebaseConfig";


// Function to fetch all event 



// Function to add a new event record
export async function addEventRecord(userId, eventId, achievements ,completion, rank, remarks) {
  try {
    const docRef = await addDoc(collection(db, 'eventRecords'), {
      userId: userId,
      eventId: eventId,
      achievements: achievements,
      completion: completion,
      rank: rank,
      remarks: remarks
    });
    console.log("Document successfully written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

export async function fetchEventRecord(eventId, userId) {
  try {
    const eventDocRef = doc(db, "eventRecords", eventId);
    const eventDoc = await getDoc(eventDocRef);

    if (eventDoc.exists()) {
      const eventData = eventDoc.data();
      console.log("UserRecords", eventData.records);
      console.log("UserId", userId);

      // Iterate through the records array to find the user record
      const userRecord = eventData.records.find(record => record[userId]);

      console.log("UserRecord", userRecord ? userRecord[userId] : null);
      return userRecord ? userRecord[userId] : null;

    } else {
      console.log("No such document!");
      return null;
    }
  } catch (e) {
    console.error("Error fetching document: ", e.message);
    throw new Error("Failed to fetch event record");
  }
}


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




