export interface INotificationService {
  sendAlert(message: string): Promise<void>;
}

export class NotificationService implements INotificationService {
  async sendAlert(message: string): Promise<void> {
    // Real implementation would send email/SMS
    console.log('Alert sent:', message);
  }
}

