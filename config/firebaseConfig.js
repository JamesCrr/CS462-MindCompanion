// Import the Firebase modules
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCyE3z-9vy8gnbqJPmhA7SX8UWndqJUpNA",
  authDomain: "cs462-iot-86e52.firebaseapp.com",
  projectId: "cs462-iot-86e52",
  storageBucket: "cs462-iot-86e52.appspot.com",
  messagingSenderId: "23573947700",
  appId: "1:23573947700:web:331dec73c96e42b4ff7161",
}
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { db };
