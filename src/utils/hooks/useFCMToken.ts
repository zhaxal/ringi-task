"use client";
import { useEffect, useState } from "react";
import { getToken, isSupported } from "firebase/messaging";
import { messaging } from "@/firebase";
import useNotificationPermission from "./useNotificationPermission";
import { FCMError } from "./types";

const useFCMToken = () => {
  const permission = useNotificationPermission();
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [error, setError] = useState<FCMError | null>(null);

  useEffect(() => {
    const retrieveToken = async () => {
      try {
        if (typeof window === "undefined") return;

        if (!("serviceWorker" in navigator)) {
          setError({
            code: "NO_SERVICE_WORKER",
            message: "Service Workers are not supported in this browser",
          });
          return;
        }

        if (permission.permission === "denied") {
          setError({
            code: "PERMISSION_DENIED",
            message: "Notification permission was denied",
          });
          return;
        }

        if (permission.permission === "granted") {
          const isFCMSupported = await isSupported();
          if (!isFCMSupported) {
            setError({
              code: "FCM_NOT_SUPPORTED",
              message:
                "Firebase Cloud Messaging is not supported in this browser",
            });
            return;
          }

          try {
            const token = await getToken(messaging(), {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_PUBLIC_VAPID_KEY,
            });
            setFcmToken(token);
            setError(null);
          } catch (err) {
            console.error(err);
            setError({
              code: "TOKEN_ERROR",
              message: "Failed to get FCM token",
            });
          }
        }
      } catch (err) {
        console.error(err);
        setError({
          code: "TOKEN_ERROR",
          message: "Unexpected error while setting up FCM",
        });
      }
    };

    retrieveToken();
  }, [permission]);

  return { fcmToken, error };
};

export default useFCMToken;
