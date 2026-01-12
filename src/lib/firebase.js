// lib/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging'; // Correct import for Firebase Messaging
import { useEffect, useState } from 'react'; // Import useEffect and useState for client-side initialization

const firebaseConfig = {
  apiKey: 'AIzaSyBCUkKTniFHwAQDRd504EdpfEpOcgu4nNc',
  authDomain: 'pixelsbnb-1e394.firebaseapp.com',
  projectId: 'pixelsbnb-1e394',
  storageBucket: 'pixelsbnb-1e394.firebasestorage.app',
  messagingSenderId: '881709814092',
  appId: '1:881709814092:web:6458d890f47afb103dbfe9',
  measurementId: 'G-M1W7WCLBSK',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Messaging - Initialize Messaging only on client-side
const useFirebaseMessaging = () => {
  const [messaging, setMessaging] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          const messagingInstance = getMessaging(app);

          // Attach SW so background messages work
          getToken(messagingInstance, {
            vapidKey: 'BLvU-UD2TjbEvdvyiEMKhYVg4D4L9GWtvo-DAPnjTC5DYvNw9Ov2PdWiorcOZ9uEkfxfJ3U2lx6-gsQKbN7pvZs',
            serviceWorkerRegistration: registration,
          })
            .then(async (token) => {
              if (token) {
                console.log('FCM Token:', token);

                await fetch('/api/save-fcm-token', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ 'fcmToken':token }),
                });
              } else {
                console.warn('No FCM token received. Request permission first.');
              }
            })
            .catch((err) => {
              console.error('Error getting FCM token:', err);
            });

          setMessaging(messagingInstance);
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    }
  }, []);

  return messaging; // Return messaging instance
};

export { getAuth, getToken, onMessage, useFirebaseMessaging }; // Export the hook
