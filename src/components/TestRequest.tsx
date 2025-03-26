
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { sendToZapier, testWebhook, pingZapierWebhook, ZAPIER_WEBHOOKS, getZapierTroubleshootingTips } from '@/utils/webhooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Info, Loader2, RefreshCw, ExternalLink, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TestRequest: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [testData, setTestData] = useState('{\n  "name": "Test User",\n  "email": "test@example.com",\n  "message": "This is a test message"\n}');
  const [responseStatus, setResponseStatus] = useState<null | 'success' | 'error'>(null);
  const [responseInfo, setResponseInfo] = useState('');
  const [responseDetails, setResponseDetails] = useState('');
  const [testMode, setTestMode] = useState<string | null>(null);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  
  const tips = getZapierTroubleshootingTips();
  
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
        
        // Show troubleshooting info if necessary
        if (result.zapierHelp) {
          setShowTroubleshooting(true);
        }
      } else {
        setResponseStatus('error');
        setTestMode(result.mode);
        setResponseInfo(`Error: ${result.error || `Status ${result.status} ${result.statusText}`}`);
        setResponseDetails(result.details || "Make sure your Zap is turned ON and the webhook URL is correct.");
        toast.error("Error sending test request. See details below.");
        
        // Always show troubleshooting for errors
        setShowTroubleshooting(true);
      }
    } catch (error) {
      console.error("Error sending test request:", error);
      setResponseStatus('error');
      setResponseInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResponseDetails("An unexpected error occurred while testing the webhook.");
      toast.error("An error occurred while sending the test request.");
      setShowTroubleshooting(true);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePing = async () => {
    if (!webhookUrl) {
      toast.error("Please enter a webhook URL");
      return;
    }
    
    setIsPinging(true);
    
    try {
      const result = await pingZapierWebhook(webhookUrl);
      
      if (result.success) {
        toast.success("Ping sent to Zapier webhook! Check your Zap history.");
      } else {
        toast.error(`Failed to ping webhook: ${result.error}`);
      }
    } catch (error) {
      console.error("Error pinging webhook:", error);
      toast.error("Error pinging webhook. Please check the URL and try again.");
    } finally {
      setIsPinging(false);
    }
  };
  
  const handleUseExisting = (webhookType: 'contact' | 'booking') => {
    setWebhookUrl(ZAPIER_WEBHOOKS[webhookType]);
    toast.info(`Using ${webhookType} form webhook URL`);
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
            <div className="flex items-center gap-2">
              <Input
                id="webhook"
                type="text"
                placeholder="https://hooks.zapier.com/hooks/catch/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="icon"
                disabled={isPinging}
                onClick={handlePing}
                title="Send a quick ping to test the webhook"
              >
                {isPinging ? <Loader2 className="animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
            
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
            </div>
          )}

          {(responseStatus === 'error' || showTroubleshooting) && (
            <div className="mt-2 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <div className="flex gap-2 items-start">
                <HelpCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800">Common causes of "No request found" in Zapier:</h3>
                  <ul className="list-disc pl-5 text-sm text-amber-700 mt-2 space-y-1.5">
                    <li className="font-medium">Your Zap is <strong>turned OFF</strong> in Zapier - this is the #1 most common issue!</li>
                    <li>The webhook URL is incorrect or has expired (URLs can expire after inactivity)</li>
                    <li>Your Zap's trigger step isn't configured correctly</li>
                    <li>You're sending data in a format Zapier doesn't expect</li>
                  </ul>
                  
                  <div className="mt-3 border-t border-amber-200 pt-3">
                    <h4 className="text-sm font-medium text-amber-800">How to fix:</h4>
                    <ol className="list-decimal pl-5 text-sm text-amber-700 mt-2 space-y-1.5">
                      <li><strong>Check if your Zap is ON</strong> - Go to your Zapier dashboard and make sure the toggle switch is enabled</li>
                      <li><strong>Recreate the webhook</strong> - Create a new Zap with a webhook trigger and get a fresh URL</li>
                      <li><strong>Test directly in Zapier</strong> - Use the "Test Trigger" button in Zapier's editor</li>
                    </ol>
                  </div>
                  
                  <div className="mt-4">
                    <a 
                      href={tips.zapierDocs} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-amber-800 hover:text-amber-900 font-medium"
                    >
                      Zapier Webhook Troubleshooting Guide <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
            <div className="flex gap-2 items-start">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">Zapier Webhook Tips</h3>
                <ul className="list-disc pl-5 text-sm text-blue-700 mt-2 space-y-1">
                  <li>Always check if your Zap is <strong>turned ON</strong> - look for the toggle in your Zapier dashboard</li>
                  <li>Use the "Ping" button to send a minimal test request to verify connectivity</li>
                  <li>Webhook URLs typically expire after a period of inactivity (usually 30 days)</li>
                  <li>Recreate your Zap if you suspect the webhook URL has expired</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Testing...
                </>
              ) : "Send Test Request"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TestRequest;
