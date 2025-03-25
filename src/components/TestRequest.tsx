
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { sendToZapier } from '@/utils/webhooks';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TestRequest: React.FC = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testData, setTestData] = useState('{\n  "name": "Test User",\n  "email": "test@example.com",\n  "message": "This is a test message"\n}');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      
      const success = await sendToZapier(webhookUrl, data);
      
      if (success) {
        toast.success("Test request sent successfully!");
      } else {
        toast.error("Failed to send test request. Check console for details.");
      }
    } catch (error) {
      console.error("Error sending test request:", error);
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
