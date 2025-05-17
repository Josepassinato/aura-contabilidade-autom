
import { EmailData, ScheduleEmailResult } from './types';
import { sendEmail } from './sendEmail';

// Function to schedule an email for future delivery
export async function scheduleEmail(
  emailData: EmailData,
  scheduledDate: Date
): Promise<ScheduleEmailResult> {
  try {
    // For now, we'll implement a simple scheduling mechanism
    // In a real application, this would use a more robust solution like a queue or scheduled tasks
    const now = new Date();
    const delayMs = scheduledDate.getTime() - now.getTime();
    
    if (delayMs <= 0) {
      // If the scheduled time is in the past or now, send immediately
      const result = await sendEmail(emailData);
      return {
        ...result,
        scheduledDate: new Date().toISOString()
      };
    }
    
    // Schedule the email to be sent at the future time
    // In a real implementation, this would be handled by a backend queue system
    console.log(`Scheduling email to be sent in ${delayMs / 1000} seconds`);
    
    setTimeout(async () => {
      try {
        await sendEmail(emailData);
        console.log("Scheduled email sent successfully");
      } catch (err) {
        console.error("Error sending scheduled email:", err);
      }
    }, delayMs);
    
    return {
      success: true,
      message: `Email scheduled for ${scheduledDate.toISOString()}`,
      scheduledDate: scheduledDate.toISOString()
    };
  } catch (error: any) {
    console.error("Error scheduling email:", error);
    return { success: false, error };
  }
}
