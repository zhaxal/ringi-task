"use client";

import { type FirebaseOptions, initializeApp } from "firebase/app";
import { getMessaging } from "firebase/messaging";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyD5edfj8USeeX3ikC3tnpme6LYzWL9JQHk",
  authDomain: "ringi-task.firebaseapp.com",
  projectId: "ringi-task",
  storageBucket: "ringi-task.firebasestorage.app",
  messagingSenderId: "748812161240",
  appId: "1:748812161240:web:e6a20f5186e40ca67047ad",
  measurementId: "G-ZDTNZNHSP4",
};

const firebaseapp = initializeApp(firebaseConfig);

export const messaging = () => getMessaging(firebaseapp);

export default firebaseapp;
