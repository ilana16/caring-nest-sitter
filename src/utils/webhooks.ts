
/**
 * Zapier webhook URLs for form submissions
 * Note: These are placeholder URLs that should be replaced with actual Zapier webhook URLs
 * Once you create your Zaps in Zapier that connect to Google Drive and Email
 */
export const ZAPIER_WEBHOOKS = {
  contact: "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
  booking: "https://hooks.zapier.com/hooks/catch/123456/bookingxyz/"
};

/**
 * Helper function to send data to a Zapier webhook
 */
export const sendToZapier = async (webhookUrl: string, data: any) => {
  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Handle CORS issues
      body: JSON.stringify(data),
    });
    return true;
  } catch (error) {
    console.error("Error sending data to Zapier:", error);
    return false;
  }
};
