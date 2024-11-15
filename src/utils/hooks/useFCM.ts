import { useEffect, useState } from "react";
import useFCMToken from "./useFCMToken";
import { messaging } from "@/firebase";
import { MessagePayload, onMessage } from "firebase/messaging";
import { FCMError } from "./types";

const useFCM = () => {
  const { fcmToken, error: tokenError } = useFCMToken();
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [error, setError] = useState<FCMError | null>(tokenError);

  useEffect(() => {
    if (tokenError) {
      setError(tokenError);
      return;
    }

    if (!fcmToken) return;

    try {
      if (!("serviceWorker" in navigator)) {
        setError({
          code: "NO_SERVICE_WORKER",
          message: "Service Workers are not supported in this browser",
        });
        return;
      }

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
    } catch (err) {
      console.error(err);
      setError({
        code: "FCM_NOT_SUPPORTED",
        message: "Failed to initialize FCM message listener",
      });
    }
  }, [fcmToken, tokenError]);

  return { fcmToken, messages, error };
};

export default useFCM;
