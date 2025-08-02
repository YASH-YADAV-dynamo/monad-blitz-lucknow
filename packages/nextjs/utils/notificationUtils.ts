export interface Notification {
  id: string;
  type: 'split_request' | 'payment_received' | 'group_created';
  title: string;
  message: string;
  groupHash: string;
  amount: string;
  from: string;
  timestamp: number;
  isRead: boolean;
  isCompleted: boolean;
}

export class NotificationManager {
  private static getStorageKey(address: string): string {
    return `notifications_${address}`;
  }

  static getNotifications(address: string): Notification[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.getStorageKey(address));
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading notifications:', error);
      return [];
    }
  }

  static addNotification(address: string, notification: Omit<Notification, 'id' | 'timestamp' | 'isRead' | 'isCompleted'>): void {
    if (typeof window === 'undefined') return;

    try {
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        isRead: false,
        isCompleted: false,
      };

      const existing = this.getNotifications(address);
      existing.unshift(newNotification);
      localStorage.setItem(this.getStorageKey(address), JSON.stringify(existing));
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }

  static markAsRead(address: string, notificationId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const notifications = this.getNotifications(address);
      const updated = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      );
      localStorage.setItem(this.getStorageKey(address), JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  static markAsCompleted(address: string, notificationId: string): void {
    if (typeof window === 'undefined') return;

    try {
      const notifications = this.getNotifications(address);
      const updated = notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isCompleted: true } : notif
      );
      localStorage.setItem(this.getStorageKey(address), JSON.stringify(updated));
    } catch (error) {
      console.error('Error marking notification as completed:', error);
    }
  }

  static clearAll(address: string): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(this.getStorageKey(address));
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  }

  static getUnreadCount(address: string): number {
    const notifications = this.getNotifications(address);
    return notifications.filter(n => !n.isRead).length;
  }

  static getPendingSplitsCount(address: string): number {
    const notifications = this.getNotifications(address);
    return notifications.filter(n => !n.isCompleted && n.type === 'split_request').length;
  }

  static createSplitRequestNotification(
    friendAddress: string,
    groupHash: string,
    amount: string,
    fromAddress: string,
    recipientName: string,
    totalAmount: string
  ): void {
    this.addNotification(friendAddress, {
      type: 'split_request',
      title: 'New Split Request',
      message: `${recipientName} has added you to a split for ${totalAmount} MON. Your share is ${amount} MON.`,
      groupHash,
      amount,
      from: fromAddress,
    });
  }

  static createPaymentReceivedNotification(
    address: string,
    groupHash: string,
    amount: string,
    fromAddress: string
  ): void {
    this.addNotification(address, {
      type: 'payment_received',
      title: 'Payment Received',
      message: `You received ${amount} MON for a split payment.`,
      groupHash,
      amount,
      from: fromAddress,
    });
  }

  static createGroupCreatedNotification(
    address: string,
    groupHash: string,
    groupName: string,
    fromAddress: string
  ): void {
    this.addNotification(address, {
      type: 'group_created',
      title: 'Group Created',
      message: `A new split group "${groupName}" has been created and you've been added to it.`,
      groupHash,
      amount: '0',
      from: fromAddress,
    });
  }
} 