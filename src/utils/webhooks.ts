
/**
 * Zapier webhook URLs for form submissions
 * Note: Replace with actual Zapier webhook URLs for your Google Drive and Email integrations
 */
export const ZAPIER_WEBHOOKS = 
{
  contact: "https://hooks.zapier.com/hooks/catch/13870092/2egepyu/",
  booking: "https://hooks.zapier.com/hooks/catch/123456/bookingxyz/"
};

/**
 * Helper function to send data to a Zapier webhook
 * @returns Object with status of the request and any error message
 */
export const sendToZapier = async (webhookUrl: string, data: any) => {
  try {
    // Log the webhook URL and data being sent (for debugging)
    console.log("Sending to webhook:", webhookUrl);
    console.log("Data being sent:", data);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    
    // Get detailed response information
    const statusInfo = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    };
    
    console.log("Zapier webhook response:", statusInfo);
    
    // Try to get response text if available
    let responseText = "";
    try {
      responseText = await response.text();
      if (responseText) {
        console.log("Response text:", responseText);
      }
    } catch (textError) {
      console.log("Couldn't read response text");
    }
    
    if (!response.ok) {
      console.error("Zapier webhook error:", statusInfo);
      return {
        success: false,
        error: `HTTP Error: ${response.status} ${response.statusText}`,
        details: responseText
      };
    }
    
    return {
      success: true,
      details: responseText || "Request sent successfully"
    };
  } catch (error) {
    console.error("Error sending data to Zapier:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: "This might be a network error or CORS issue"
    };
  }
};

/**
 * Test a webhook with a given URL and data
 * This function is specifically designed for testing webhooks
 * and provides more detailed information about the request
 */
export const testWebhook = async (webhookUrl: string, testData: any) => {
  try {
    // First try with regular fetch
    console.log("Testing webhook with standard mode:", webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });
    
    const statusInfo = {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    };
    
    console.log("Webhook test response:", statusInfo);
    
    // Try to get response body if available
    let responseBody = "";
    try {
      responseBody = await response.text();
      if (responseBody) {
        console.log("Response body:", responseBody);
      }
    } catch (bodyError) {
      console.log("Couldn't read response body");
    }
    
    if (response.ok) {
      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        details: responseBody || "Request sent successfully",
        mode: "standard"
      };
    }
    
    // If regular request fails with CORS, try with no-cors mode
    if (response.status === 0 || response.status === 403 || response.status === 429) {
      console.log("Retrying with no-cors mode due to possible CORS issue");
      
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors", // Use no-cors mode as fallback
          body: JSON.stringify(testData),
        });
        
        // Since no-cors doesn't provide response details, we assume it worked
        // but inform the user about the limitation
        return {
          success: true,
          status: 0,
          statusText: "Unknown (no-cors mode)",
          details: "Request sent in no-cors mode. Cannot verify if it was received by Zapier. Check your Zap history.",
          mode: "no-cors"
        };
      } catch (noCorsError) {
        console.error("Error in no-cors mode:", noCorsError);
        return {
          success: false,
          status: 0,
          statusText: "Failed (no-cors mode)",
          error: noCorsError instanceof Error ? noCorsError.message : "Unknown error in no-cors mode",
          details: "Failed even with no-cors mode. The webhook URL might be invalid.",
          mode: "no-cors"
        };
      }
    }
    
    return {
      success: false,
      status: response.status,
      statusText: response.statusText,
      error: `HTTP Error: ${response.status} ${response.statusText}`,
      details: responseBody || "No additional details available",
      mode: "standard"
    };
    
  } catch (error) {
    console.error("Error testing webhook:", error);
    return {
      success: false,
      status: 0,
      statusText: "Exception",
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: "This might be a network error, CORS issue, or invalid webhook URL",
      mode: "standard"
    };
  }
};
