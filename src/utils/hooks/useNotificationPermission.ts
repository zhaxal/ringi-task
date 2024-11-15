"use client";
import { useEffect, useState, useCallback } from "react";

type NotificationError = {
  code: 'NO_NOTIFICATION_SUPPORT' | 'NO_PERMISSION_SUPPORT' | 'PERMISSION_ERROR';
  message: string;
};

const useNotificationPermissionStatus = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [error, setError] = useState<NotificationError | null>(null);

  useEffect(() => {
    const handler = () => setPermission(Notification.permission);

    try {
      // Check if Notifications API is supported
      if (!("Notification" in window)) {
        setError({
          code: 'NO_NOTIFICATION_SUPPORT',
          message: 'Notifications are not supported in this browser'
        });
        return;
      }

      handler();

      // Check if Permissions API is supported
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

  return {
    permission,
    requestPermission,
    error
  };
};

export default useNotificationPermissionStatus;