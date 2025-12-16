import {
  NotificationMessage,
  NotificationProvider,
} from '../../../../../infrastructure/types/notification-service-types';

export class ResendEmailProvider implements NotificationProvider {
  constructor(private config: { apiKey: string; fromEmail: string; fromName?: string }) {}

  async send(message: NotificationMessage): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.config.fromName
            ? `${this.config.fromName} <${this.config.fromEmail}>`
            : this.config.fromEmail,
          to: message.recipient,
          subject: message.title,
          html: this.formatEmailBody(message.body),
          text: message.body,
        }),
      });
      if (!response.ok) {
        console.error('Resend API error:', await response.text());
        return false;
      }
      return true;
    } catch (error) {
      console.error('Failed to send email via Resend:', error);
      return false;
    }
  }
  isAvailable(): boolean {
    return !!this.config.apiKey;
  }
  private formatEmailBody(body: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Rentacamera.ru</h2>
            </div>
            <div class="content">
              ${body.replace(/\n/g, '<br>')}
            </div>
            <div class="footer">
              <p>Это автоматическое сообщение. Пожалуйста, не отвечайте на него.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
