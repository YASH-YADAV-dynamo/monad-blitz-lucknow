import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { NotificationManager, type Notification } from "~~/utils/notificationUtils";

export const useNotifications = () => {
  const { address: connectedAddress } = useAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);

  // Load notifications
  useEffect(() => {
    if (connectedAddress) {
      const loadNotifications = () => {
        const storedNotifications = NotificationManager.getNotifications(connectedAddress);
        setNotifications(storedNotifications);
        setUnreadCount(NotificationManager.getUnreadCount(connectedAddress));
        setPendingCount(NotificationManager.getPendingSplitsCount(connectedAddress));
      };

      loadNotifications();
      const interval = setInterval(loadNotifications, 2000); // Check every 2 seconds

      return () => clearInterval(interval);
    }
  }, [connectedAddress]);

  const markAsRead = (notificationId: string) => {
    if (connectedAddress) {
      NotificationManager.markAsRead(connectedAddress, notificationId);
      const updatedNotifications = NotificationManager.getNotifications(connectedAddress);
      setNotifications(updatedNotifications);
      setUnreadCount(NotificationManager.getUnreadCount(connectedAddress));
    }
  };

  const markAsCompleted = (notificationId: string) => {
    if (connectedAddress) {
      NotificationManager.markAsCompleted(connectedAddress, notificationId);
      const updatedNotifications = NotificationManager.getNotifications(connectedAddress);
      setNotifications(updatedNotifications);
      setPendingCount(NotificationManager.getPendingSplitsCount(connectedAddress));
    }
  };

  const clearAll = () => {
    if (connectedAddress) {
      NotificationManager.clearAll(connectedAddress);
      setNotifications([]);
      setUnreadCount(0);
      setPendingCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    pendingCount,
    markAsRead,
    markAsCompleted,
    clearAll,
  };
}; 