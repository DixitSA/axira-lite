import "server-only";

/**
 * Twilio SMS Service for Axira Lite
 * 
 * Sends real SMS messages via Twilio's REST API.
 * Falls back to a "simulated" mode when credentials are not configured,
 * logging the message to the console instead.
 */

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const isTwilioConfigured = !!(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_PHONE_NUMBER);

export type SmsResult = {
  success: boolean;
  sid?: string;
  error?: string;
  simulated?: boolean;
};

/**
 * Normalizes a phone number to E.164 format for Twilio.
 * Assumes US numbers if no country code is present.
 */
function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return `+${digits}`;
}

/**
 * Sends an SMS message via Twilio.
 * If Twilio is not configured, simulates the send and returns a simulated result.
 */
export async function sendSms(to: string, body: string): Promise<SmsResult> {
  const normalizedTo = normalizePhone(to);

  if (!isTwilioConfigured) {
    console.log(`[SMS SIMULATED] To: ${normalizedTo}`);
    console.log(`[SMS SIMULATED] Body: ${body}`);
    return {
      success: true,
      sid: `SIM_${Date.now()}`,
      simulated: true,
    };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64"),
      },
      body: new URLSearchParams({
        From: TWILIO_PHONE_NUMBER!,
        To: normalizedTo,
        Body: body,
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[SMS ERROR]", data);
      return {
        success: false,
        error: data.message || `Twilio error: ${response.status}`,
      };
    }

    return {
      success: true,
      sid: data.sid,
    };
  } catch (error) {
    console.error("[SMS ERROR]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "SMS delivery failed",
    };
  }
}
