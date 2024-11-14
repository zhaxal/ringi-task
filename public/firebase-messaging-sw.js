
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js");

const firebaseConfig = {
  apiKey: "AIzaSyD5edfj8USeeX3ikC3tnpme6LYzWL9JQHk",
  authDomain: "ringi-task.firebaseapp.com",
  projectId: "ringi-task",
  storageBucket: "ringi-task.firebasestorage.app",
  messagingSenderId: "748812161240",
  appId: "1:748812161240:web:e6a20f5186e40ca67047ad",
  measurementId: "G-ZDTNZNHSP4",
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "./logo.png",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});