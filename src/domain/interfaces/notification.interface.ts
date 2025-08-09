
export type NotificationTheme = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface INotification {
  notificationId?: string; // MongoDB generated ID
  type: 'common' | 'order' | 'promo' | 'system' | 'reminder'; // frontend decides redirection based on this
  tags?: string[]; // e.g., ["order", "delivery"]
  targetRole: 'user' | 'restaurantAdmin';
  targetRoleId: string; // userId or restaurantId depending on targetRole
  message: string;
  emoji?: string; // optional emoji included in message
  theme?: NotificationTheme;
  read?: boolean;
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}
