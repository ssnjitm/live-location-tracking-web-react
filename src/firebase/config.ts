// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// // Your Firebase config from Firebase Console
// const firebaseConfig = {
//   apiKey: "AIzaSyBBe7rS2wYWKS0m0Ivd3Yq_zuPY1FRi9VI",
//   authDomain: "location-tracking-app-5b336.firebaseapp.com",
//   projectId: "location-tracking-app-5b336",
//   storageBucket: "location-tracking-app-5b336.firebasestorage.app",
//   messagingSenderId: "953723709463",
//   appId: "1:953723709463:web:5de3efcad76e9a721ad452",
//   measurementId: "G-JW5CB6BJNS"
// };

// const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);
// export const auth = getAuth(app);

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyBBe7rS2wYWKS0m0Ivd3Yq_zuPY1FRi9VI",
  authDomain: "location-tracking-app-5b336.firebaseapp.com",
  projectId: "location-tracking-app-5b336",
  storageBucket: "location-tracking-app-5b336.firebasestorage.app",
  messagingSenderId: "953723709463",
  appId: "1:953723709463:web:5de3efcad76e9a721ad452",
  measurementId: "G-JW5CB6BJNS"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// // Admin emails - add emails that should have admin access
// export const ADMIN_EMAILS = [
//   'admin@example.com',
//   'your-email@gmail.com', // Add your email here
// ];

// Admin emails - add emails that should have admin access
export const ADMIN_EMAILS = [
  'admin@example.com',
  'ssnjitm6@gmail.com', // Add your email here
];