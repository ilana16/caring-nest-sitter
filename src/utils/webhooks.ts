
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
    
    // Add a flag to the data to identify it was sent from this app
    data._source = "webhook_tester";
    data._timestamp = new Date().toISOString();
    
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
        details: responseText,
        zapierHelp: true
      };
    }
    
    return {
      success: true,
      details: responseText || "Request sent successfully"
    };
  } catch (error) {
    console.error("Error sending data to Zapier:", error);
    // If we get a network error, it's likely a CORS issue
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      // Try again with no-cors mode as a fallback
      try {
        console.log("Retrying with no-cors mode");
        await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          mode: "no-cors", // Use no-cors mode as fallback
          body: JSON.stringify(data),
        });
        
        return {
          success: true,
          error: "CORS issue detected",
          details: "Request sent in no-cors mode. Cannot verify if it was received by Zapier. Check your Zap history.",
          mode: "no-cors"
        };
      } catch (noCorsError) {
        return {
          success: false,
          error: "Network error even with no-cors mode",
          details: "The webhook URL might be invalid or there's a network issue.",
          zapierHelp: true
        };
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: "This might be a network error or CORS issue",
      zapierHelp: true
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
    
    // Validate webhook URL format
    if (!webhookUrl.startsWith('https://hooks.zapier.com/')) {
      return {
        success: false,
        status: 0,
        statusText: "Invalid URL",
        error: "The URL doesn't appear to be a valid Zapier webhook URL",
        details: "Zapier webhook URLs should start with 'https://hooks.zapier.com/'",
        zapierHelp: true
      };
    }
    
    // Add test identifiers to data
    testData._test = true;
    testData._source = "webhook_tester";
    testData._timestamp = new Date().toISOString();
    testData._browser = navigator.userAgent;
    
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
        mode: "standard",
        zapierNextSteps: "Your request was sent successfully. If you don't see it in Zapier, check if your Zap is turned ON."
      };
    }
    
    // If regular request fails with CORS or other issue, try with no-cors mode
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
          details: "Request sent in no-cors mode. Cannot verify if it was received by Zapier.",
          mode: "no-cors",
          zapierHelp: true,
          zapierNextSteps: "Check your Zap history to see if the request was received. Make sure your Zap is turned ON."
        };
      } catch (noCorsError) {
        console.error("Error in no-cors mode:", noCorsError);
        return {
          success: false,
          status: 0,
          statusText: "Failed (no-cors mode)",
          error: noCorsError instanceof Error ? noCorsError.message : "Unknown error in no-cors mode",
          details: "Failed even with no-cors mode. The webhook URL might be invalid.",
          mode: "no-cors",
          zapierHelp: true
        };
      }
    }
    
    return {
      success: false,
      status: response.status,
      statusText: response.statusText,
      error: `HTTP Error: ${response.status} ${response.statusText}`,
      details: responseBody || "No additional details available",
      mode: "standard",
      zapierHelp: true
    };
    
  } catch (error) {
    console.error("Error testing webhook:", error);
    
    // Special case for network errors to provide helpful guidance
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return {
        success: false,
        status: 0,
        statusText: "Network Error",
        error: "Could not connect to the webhook URL",
        details: "This could be due to the URL being invalid, a network issue, or CORS restrictions.",
        zapierHelp: true
      };
    }
    
    return {
      success: false,
      status: 0,
      statusText: "Exception",
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: "This might be a network error, CORS issue, or invalid webhook URL",
      zapierHelp: true
    };
  }
};

/**
 * Verify if a Zapier webhook is active by sending a simple ping
 */
export const pingZapierWebhook = async (webhookUrl: string) => {
  if (!webhookUrl) return { success: false, error: "No webhook URL provided" };
  
  try {
    const pingData = {
      _ping: true,
      _timestamp: new Date().toISOString(),
      source: "webhook_tester_ping"
    };
    
    console.log("Pinging Zapier webhook:", webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors", // Use no-cors for better compatibility
      body: JSON.stringify(pingData),
    });
    
    // Since we're using no-cors, we can't really check the response
    // We'll just assume it was sent and let the user check Zapier
    
    return {
      success: true,
      details: "Ping request sent. Check your Zap history to see if it was received."
    };
  } catch (error) {
    console.error("Error pinging webhook:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: "Failed to ping the webhook URL."
    };
  }
};

/**
 * Get Zapier troubleshooting tips for common issues
 */
export const getZapierTroubleshootingTips = () => {
  return {
    zapDisabled: "Make sure your Zap is turned ON in Zapier. This is the most common issue.",
    webhookExpired: "Webhook URLs can expire. Try recreating your webhook Zap.",
    webhookFormat: "Ensure you're sending JSON data that matches what your Zap expects.",
    checkHistory: "Check your Zap history in Zapier to see if any requests came through.",
    recreateZap: "If none of these work, try creating a new Zap from scratch.",
    zapierDocs: "https://help.zapier.com/hc/en-us/articles/8496293271053-Troubleshoot-webhook-triggers"
  };
};
