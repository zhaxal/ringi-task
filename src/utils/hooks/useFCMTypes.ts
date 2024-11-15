export type FCMError = {
  code:
    | "NO_SERVICE_WORKER"
    | "FCM_NOT_SUPPORTED"
    | "PERMISSION_DENIED"
    | "TOKEN_ERROR";
  message: string;
};
