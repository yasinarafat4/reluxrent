// public/firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

// Firebase configuration (use your actual config here)
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
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background push notifications

// Handle background push notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  // Safely extract fields
  const notification = payload.notification || {};
  const data = payload.data || {};

  const title = notification.title || data.title || 'Background Notification';
  const body = notification.body || data.body || 'You have a new message.';
  const icon = notification.icon || data.icon || '/images/notification-icon.png';
  const link = data.link || '/';

  const notificationOptions = {
    body,
    icon,
    data: { link },
  };

  self.registration.showNotification(title, notificationOptions);
});

// Handle clicks on the notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const link = event.notification.data?.link || '/';
  event.waitUntil(clients.openWindow(link));
});
