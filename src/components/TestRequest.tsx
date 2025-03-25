
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { sendToZapier, testWebhook, ZAPIER_WEBHOOKS } from '@/utils/webhooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TestRequest: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState('{\n  "name": "Test User",\n  "email": "test@example.com",\n  "message": "This is a test message"\n}');
  const [responseStatus, setResponseStatus] = useState<null | 'success' | 'error'>(null);
  const [responseInfo, setResponseInfo] = useState('');
  const [responseDetails, setResponseDetails] = useState('');
  const [testMode, setTestMode] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponseStatus(null);
    setResponseInfo('');
    setResponseDetails('');
    setTestMode(null);
    
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
      
      // Add timestamp to data to ensure it's not identical to previous tests
      data.timestamp = new Date().toISOString();
      data._test = true; // Add flag to indicate this is a test
      
      // Use our enhanced testWebhook function
      const result = await testWebhook(webhookUrl, data);
      console.log("Webhook test result:", result);
      
      if (result.success) {
        setResponseStatus('success');
        setTestMode(result.mode);
        
        if (result.mode === 'no-cors') {
          setResponseInfo("Request sent (no-cors mode)");
          setResponseDetails("Due to browser security restrictions, we can't verify if Zapier received the request. Please check your Zap's history to confirm. If you don't see any activity, make sure your Zap is turned ON.");
          toast.success("Test request sent in no-cors mode. Check Zapier!");
        } else {
          setResponseInfo(`Status: ${result.status} ${result.statusText}`);
          setResponseDetails(result.details || "Request processed successfully");
          toast.success("Test request sent successfully!");
        }
      } else {
        setResponseStatus('error');
        setTestMode(result.mode);
        setResponseInfo(`Error: ${result.error || `Status ${result.status} ${result.statusText}`}`);
        setResponseDetails(result.details || "Make sure your Zap is turned ON and the webhook URL is correct.");
        toast.error("Error sending test request. See details below.");
      }
    } catch (error) {
      console.error("Error sending test request:", error);
      setResponseStatus('error');
      setResponseInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResponseDetails("An unexpected error occurred while testing the webhook.");
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-medium ${responseStatus === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                      {responseStatus === 'success' ? 'Request Sent' : 'Request Failed'}
                    </h3>
                    {testMode && (
                      <Badge variant={testMode === 'no-cors' ? 'outline' : 'secondary'} className="text-xs">
                        {testMode === 'no-cors' ? 'No-CORS Mode' : 'Standard Mode'}
                      </Badge>
                    )}
                  </div>
                  <p className={`text-sm mt-1 ${responseStatus === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                    {responseInfo}
                  </p>
                  {responseDetails && (
                    <p className={`text-sm mt-2 ${responseStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {responseDetails}
                    </p>
                  )}
                </div>
              </div>
              
              {responseStatus === 'error' && (
                <div className="mt-3 pl-7">
                  <p className="text-sm text-red-700 font-medium">Common causes of "No request found" in Zapier:</p>
                  <ul className="list-disc pl-5 text-sm text-red-700 mt-1 space-y-1">
                    <li>Your Zap is <strong>turned OFF</strong> in Zapier - most common issue!</li>
                    <li>The webhook URL is incorrect or has expired</li>
                    <li>Your Zap's trigger step isn't configured correctly</li>
                    <li>You're sending data in a format Zapier doesn't expect</li>
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
                  If you see "No request found" in Zapier, first check if your Zap is turned ON. The toggle switch should be enabled in your Zapier dashboard. Also verify that your webhook URL hasn't expired - Zapier webhooks are only valid for a limited time.
                </p>
              </div>
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Testing...
              </>
            ) : "Send Test Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TestRequest;
