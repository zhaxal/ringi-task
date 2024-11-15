import Link from "next/link";
import useNotificationPermissionStatus from "@/utils/hooks/useNotificationPermission";

export default function Dashboard() {

  const notificationPermission = useNotificationPermissionStatus();

  const logout = async () => {
    try {
      await fetch("/api/user/logout", {
        method: "DELETE",
      });
      
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const requestNotifications = async () => {
    try {
      await notificationPermission.requestPermission();
    } catch (error) {
      console.error("Notification permission error:", error);
    }
  };

  const notificationsSupported = typeof window !== 'undefined' && 'Notification' in window;

  return (
    <div className="flex items-center justify-center p-4 h-full">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/dashboard/products"
            className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Products
            </h2>
            <p className="text-gray-600">
              Manage your inventory and product listings
            </p>
          </Link>

          <Link
            href="/dashboard/orders"
            className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border hover:border-blue-500 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Orders</h2>
            <p className="text-gray-600">View and manage customer orders</p>
          </Link>

          {notificationsSupported && notificationPermission.permission !== "granted" && (
            <button
              onClick={requestNotifications}
              className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border hover:border-blue-500 transition-colors"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Enable Notifications
              </h2>
              <p className="text-gray-600">
                Get updates about your orders and products
              </p>
            </button>
          )}

          <button
            onClick={logout}
            className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm border hover:border-red-500 transition-colors"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Logout</h2>
            <p className="text-gray-600">Sign out of your account</p>
          </button>
        </div>
      </div>
    </div>
  );
}
