import { SNSClient, PublishCommand, SubscribeCommand } from '@aws-sdk/client-sns';

/**
 * Returns an initialized AWS SNS Client using environment credentials
 */
const getSNSClient = () => {
  const snsRegion = import.meta.env.VITE_AWS_REGION || 'us-east-1';
  const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
  const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    console.log("ℹ️ AWS credentials not set in .env. SMS/SNS calls skipped.");
    return null;
  }

  return new SNSClient({
    region: snsRegion,
    credentials: { accessKeyId, secretAccessKey }
  });
};

/**
 * Send a DIRECT SMS message to a specific user's mobile number from the portal
 * @param {string} phoneNumber - Target user's mobile phone number (e.g. 7075811971 or +917075811971)
 * @param {string} message - Dispatch SMS text content
 */
export const sendDirectSMS = async (phoneNumber, message) => {
  try {
    const client = getSNSClient();
    if (!client || !phoneNumber) return false;

    const cleanDigits = phoneNumber.replace(/\D/g, '');
    if (!cleanDigits) return false;

    // Standardize to E.164 international format (+91 for India)
    const formattedPhone = phoneNumber.trim().startsWith('+') ? phoneNumber.trim() : `+91${cleanDigits.slice(-10)}`;

    const command = new PublishCommand({
      PhoneNumber: formattedPhone,
      Message: message
    });

    await client.send(command);
    console.log(`📱 Direct SMS dispatched successfully to: ${formattedPhone}`);
    return true;
  } catch (err) {
    console.warn("AWS Direct SMS send error:", err);
    return false;
  }
};

/**
 * Subscribe a newly registered user's email & phone to the global AWS SNS Topic
 */
export const subscribeUserToSNS = async (userEmail, userPhone) => {
  try {
    const client = getSNSClient();
    if (!client) return false;

    const topicArn = "arn:aws:sns:us-east-1:306667525447:ApadhaSevaAlerts";

    // 1. Subscribe Email
    if (userEmail) {
      await client.send(new SubscribeCommand({
        TopicArn: topicArn,
        Protocol: "email",
        Endpoint: userEmail
      }));
    }

    // 2. Subscribe SMS (Phone Number)
    if (userPhone) {
      const cleanDigits = userPhone.replace(/\D/g, '');
      if (cleanDigits) {
        const formattedPhone = userPhone.trim().startsWith('+') ? userPhone.trim() : `+91${cleanDigits.slice(-10)}`;
        await client.send(new SubscribeCommand({
          TopicArn: topicArn,
          Protocol: "sms",
          Endpoint: formattedPhone
        }));
      }
    }

    console.log("✅ User auto-subscribed to AWS SNS Topic");
    return true;
  } catch (err) {
    console.warn("AWS SNS subscribe error:", err);
    return false;
  }
};

/**
 * Broadcast an emergency message to all subscribers of the AWS SNS Topic
 */
export const broadcastToSNSTopic = async (subject, message) => {
  try {
    const client = getSNSClient();
    if (!client) return false;

    const command = new PublishCommand({
      TopicArn: "arn:aws:sns:us-east-1:306667525447:ApadhaSevaAlerts",
      Subject: subject,
      Message: message
    });

    await client.send(command);
    console.log("📢 Broadcast message sent to SNS Topic");
    return true;
  } catch (err) {
    console.warn("AWS SNS Broadcast error:", err);
    return false;
  }
};
