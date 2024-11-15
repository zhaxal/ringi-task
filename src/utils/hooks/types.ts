export type NotificationError = {
  code:
    | "NO_NOTIFICATION_SUPPORT"
    | "NO_PERMISSION_SUPPORT"
    | "PERMISSION_ERROR";
  message: string;
};

export type FCMError = {
  code:
    | "NO_SERVICE_WORKER"
    | "FCM_NOT_SUPPORTED"
    | "PERMISSION_DENIED"
    | "TOKEN_ERROR";
  message: string;
};

export type UnifiedError = NotificationError | FCMError;
