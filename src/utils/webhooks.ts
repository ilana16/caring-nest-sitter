
/**
 * Zapier webhook URLs for form submissions
 * Note: Replace with actual Zapier webhook URLs for your Google Drive and Email integrations
 */
export const ZAPIER_WEBHOOKS = 
{
  contact: "https://hooks.zapier.com/hooks/catch/13870092/2eggyve/",
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
