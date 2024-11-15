"use client";
import { useEffect, useState, useCallback } from "react";
import { getToken, isSupported, onMessage, MessagePayload } from "firebase/messaging";
import { messaging } from "@/firebase";
import { UnifiedError } from "./types";

const useUnifiedNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessagePayload[]>([]);
  const [error, setError] = useState<UnifiedError | null>(null);

  const requestPermission = useCallback(async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (err) {
      console.error(err);
      setError({
        code: 'PERMISSION_ERROR',
        message: 'Failed to request notification permission'
      });
      return 'denied' as NotificationPermission;
    }
  }, []);

  
  useEffect(() => {
    const handler = () => setPermission(Notification.permission);

    try {
      if (!("Notification" in window)) {
        setError({
          code: 'NO_NOTIFICATION_SUPPORT',
          message: 'Notifications are not supported in this browser'
        });
        return;
      }

      handler();

      if (!("permissions" in navigator)) {
        setError({
          code: 'NO_PERMISSION_SUPPORT',
          message: 'Permissions API is not supported in this browser'
        });
        return;
      }

      navigator.permissions
        .query({ name: "notifications" })
        .then((notificationPerm) => {
          notificationPerm.onchange = handler;
        })
        .catch((err) => {
          console.error(err);
          setError({
            code: 'PERMISSION_ERROR',
            message: 'Failed to query notification permissions'
          });
        });
    } catch (err) {
      console.error(err);
      setError({
        code: 'PERMISSION_ERROR',
        message: 'Unexpected error while setting up notification permissions'
      });
    }
  }, []);


  useEffect(() => {
    const setupFCM = async () => {
      try {
        if (typeof window === "undefined") return;

        if (!("serviceWorker" in navigator)) {
          setError({
            code: "NO_SERVICE_WORKER",
            message: "Service Workers are not supported in this browser",
          });
          return;
        }

        if (permission === "denied") {
          setError({
            code: "PERMISSION_DENIED",
            message: "Notification permission was denied",
          });
          return;
        }

        if (permission === "granted") {
          const isFCMSupported = await isSupported();
          if (!isFCMSupported) {
            setError({
              code: "FCM_NOT_SUPPORTED",
              message: "Firebase Cloud Messaging is not supported in this browser",
            });
            return;
          }

          try {
            const token = await getToken(messaging(), {
              vapidKey: process.env.NEXT_PUBLIC_FIREBASE_FCM_PUBLIC_VAPID_KEY,
            });
            setFcmToken(token);
            
            const fcmMessaging = messaging();
            const unsubscribe = onMessage(fcmMessaging, (payload) => {
              if (Notification.permission === "granted") {
                new Notification(payload.notification?.title || "New Message", {
                  body: payload.notification?.body,
                  icon: payload.notification?.icon,
                });
              }
              setMessages((prev) => [...prev, payload]);
            });

            return () => unsubscribe();
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

    setupFCM();
  }, [permission]);

  return {
    permission,
    requestPermission,
    fcmToken,
    messages,
    error
  };
};

export default useUnifiedNotifications;