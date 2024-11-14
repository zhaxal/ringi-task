import { useEffect, useState } from "react";
import useFCMToken from "./useFCMToken";
import { messaging } from "@/firebase";
import { MessagePayload, onMessage } from "firebase/messaging";

const useFCM = () => {
  const fcmToken = useFCMToken();
  const [messages, setMessages] = useState<MessagePayload[]>([]);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (Notification.permission !== "granted") {
        await Notification.requestPermission();
      }
    };

    if ("serviceWorker" in navigator) {
      requestNotificationPermission();
      const fcmmessaging = messaging();

      const unsubscribe = onMessage(fcmmessaging, (payload) => {
        if (Notification.permission === "granted") {
          new Notification(payload.notification?.title || "New Message", {
            body: payload.notification?.body,
            icon: payload.notification?.icon,
          });
        }

        setMessages((messages) => [...messages, payload]);
      });

      return () => unsubscribe();
    }
  }, [fcmToken]);

  return { fcmToken, messages };
};

export default useFCM;
