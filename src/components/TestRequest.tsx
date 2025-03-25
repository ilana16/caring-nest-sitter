
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { sendToZapier } from '@/utils/webhooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const TestRequest: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState('{\n  "name": "Test User",\n  "email": "test@example.com",\n  "message": "This is a test message"\n}');
  const [responseStatus, setResponseStatus] = useState<null | 'success' | 'error'>(null);
  const [responseInfo, setResponseInfo] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseStatus(null);
    setResponseInfo('');
    
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }
    
    try {
      setIsLoading(true);
      let data;
      
      try {
        data = JSON.parse(testData);
      } catch (error) {
        toast.error("Invalid JSON data. Please check your input.");
        setIsLoading(false);
        return;
      }
      
      // Use a direct fetch call for more detailed response handling
      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Don't use no-cors mode to get actual response information
          body: JSON.stringify(data),
        });

        // Create custom status message
        const statusText = `Status: ${response.status} ${response.statusText}`;
        console.log("Webhook response:", statusText);
        
        if (response.status >= 200 && response.status < 300) {
          setResponseStatus('success');
          setResponseInfo(statusText);
          toast.success("Test request sent successfully!");
        } else {
          setResponseStatus('error');
          setResponseInfo(`${statusText} - Make sure your Zap is turned ON and the webhook URL is correct.`);
          toast.error("Error sending test request. See details below.");
        }
      } catch (error) {
        console.error("Network error:", error);
        setResponseStatus('error');
        setResponseInfo("Network error: This might be due to CORS restrictions. Try using mode: 'no-cors' for production use.");
        toast.error("Network error occurred. See details below.");
      }
    } catch (error) {
      console.error("Error sending test request:", error);
      setResponseStatus('error');
      setResponseInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      toast.error("An error occurred while sending the test request.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUseExisting = (webhookType: 'contact' | 'booking') => {
    if (webhookType === 'contact') {
      import('@/utils/webhooks').then(module => {
        setWebhookUrl(module.ZAPIER_WEBHOOKS.contact);
        toast.info("Using contact form webhook URL");
      });
    } else if (webhookType === 'booking') {
      import('@/utils/webhooks').then(module => {
        setWebhookUrl(module.ZAPIER_WEBHOOKS.booking);
        toast.info("Using booking form webhook URL");
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Test Zapier Webhook</CardTitle>
        <CardDescription>
          Use this form to test your Zapier webhook integration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="webhook" className="text-sm font-medium">
              Webhook URL
            </label>
            <Input
              id="webhook"
              type="text"
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full"
            />
            
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => handleUseExisting('contact')}
              >
                Use Contact Webhook
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => handleUseExisting('booking')}
              >
                Use Booking Webhook
              </Button>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="testData" className="text-sm font-medium">
              Test Data (JSON)
            </label>
            <textarea
              id="testData"
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className="w-full h-48 px-3 py-2 border rounded-md text-sm font-mono"
            />
          </div>
          
          {responseStatus && (
            <div className={`p-4 rounded-md ${responseStatus === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex gap-2 items-start">
                {responseStatus === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div>
                  <h3 className={`text-sm font-medium ${responseStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                    {responseStatus === 'success' ? 'Request Successful' : 'Request Failed'}
                  </h3>
                  <p className={`text-sm mt-1 ${responseStatus === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {responseInfo}
                  </p>
                </div>
              </div>
              {responseStatus === 'error' && (
                <div className="mt-3 pl-7">
                  <p className="text-sm text-red-700 font-medium">Troubleshooting:</p>
                  <ul className="list-disc pl-5 text-sm text-red-700 mt-1 space-y-1">
                    <li>Make sure your Zap is turned ON in Zapier</li>
                    <li>Verify the webhook URL is correct</li>
                    <li>Check that your data format matches what Zapier expects</li>
                    <li>Try using a tool like Postman to test the webhook directly</li>
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <div className="flex gap-2 items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Zapier Webhook Tips</h3>
                <p className="text-sm mt-1 text-blue-700">
                  If you see "No request found" in Zapier, it means your Zap may be turned off or the webhook URL is incorrect. Make sure your Zap is active and the webhook URL is properly set up.
                </p>
              </div>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Sending..." : "Send Test Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TestRequest;
