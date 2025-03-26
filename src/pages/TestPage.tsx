
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ZAPIER_WEBHOOKS, sendToZapier, pingZapierWebhook } from '@/utils/webhooks';
import { Loader2 } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

const TestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  
  const testContactZapier = async () => {
    setLoading(true);
    setTestOutput(null);
    
    try {
      // Create test data
      const testData = {
        type: 'contact',
        name: 'Debug Test',
        email: 'debug@test.com',
        message: 'This is a debugging test message',
        date: new Date().toISOString(),
        recipientEmail: 'ilana.cunningham16@gmail.com',
        subject: 'Debug Test Submission',
        _debug: true
      };
      
      console.log("Testing contact Zapier webhook with:", ZAPIER_WEBHOOKS.contact);
      console.log("Test data:", testData);
      
      // Send to Zapier webhook
      const result = await sendToZapier(ZAPIER_WEBHOOKS.contact, testData);
      
      setTestOutput(JSON.stringify(result, null, 2));
      
      if (result.success) {
        toast.success("Test message sent to Zapier webhook.");
      } else {
        toast.error("Failed to send test message. Check the details below.");
      }
    } catch (error) {
      console.error("Test error:", error);
      setTestOutput(JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null
      }, null, 2));
      toast.error("An error occurred during testing.");
    } finally {
      setLoading(false);
    }
  };
  
  const pingContactZapier = async () => {
    setLoading(true);
    setTestOutput(null);
    
    try {
      console.log("Pinging contact Zapier webhook:", ZAPIER_WEBHOOKS.contact);
      
      // Ping the webhook
      const result = await pingZapierWebhook(ZAPIER_WEBHOOKS.contact);
      
      setTestOutput(JSON.stringify(result, null, 2));
      
      if (result.success) {
        toast.success("Ping sent to Zapier webhook. Check your Zap history.");
      } else {
        toast.error(`Failed to ping webhook: ${result.error}`);
      }
    } catch (error) {
      console.error("Ping error:", error);
      setTestOutput(JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null
      }, null, 2));
      toast.error("An error occurred while pinging the webhook.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <PageTransition>
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Debug Zapier Webhooks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="font-medium">Contact Webhook URL:</div>
              <Input 
                value={ZAPIER_WEBHOOKS.contact} 
                readOnly 
                className="font-mono text-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={testContactZapier}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : "Test Contact Webhook"}
              </Button>
              
              <Button
                variant="outline"
                onClick={pingContactZapier}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Pinging...
                  </>
                ) : "Ping Contact Webhook"}
              </Button>
            </div>
            
            {testOutput && (
              <div className="mt-6">
                <div className="font-medium mb-2">Test Results:</div>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto text-xs font-mono">
                  {testOutput}
                </pre>
              </div>
            )}
            
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <h3 className="text-sm font-medium text-amber-800 mb-2">Common Issues With Zapier Webhooks:</h3>
              <ul className="list-disc pl-5 text-sm text-amber-700 space-y-1">
                <li><strong>Zap is turned OFF</strong> in Zapier - This is the most common issue!</li>
                <li>The webhook URL is incorrect or has expired</li>
                <li>Browser CORS restrictions blocking the request</li>
                <li>Rate limiting from Zapier (too many requests)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};

export default TestPage;
