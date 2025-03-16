
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SuccessMessageProps {
  onReset: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ onReset }) => {
  return (
    <Card className="bg-primary/20 border border-primary">
      <CardHeader>
        <CardTitle className="text-center">Booking Request Sent!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center mb-4">
          Thank you for your booking request. Ilana will contact you shortly to confirm your booking.
        </p>
        <div className="flex justify-center">
          <Button 
            variant="outline"
            onClick={onReset}
          >
            Make Another Booking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuccessMessage;
