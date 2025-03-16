
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const AvailabilityCalendarDialog: React.FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-primary text-primary-foreground">
          <CalendarIcon className="mr-2 h-4 w-4" /> View Full Availability Calendar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Ilana's Full Availability Calendar</DialogTitle>
          <DialogDescription>
            This calendar shows all currently booked times
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video w-full mb-4 overflow-hidden rounded-lg border border-border">
          <iframe 
            src="https://calendar.google.com/calendar/embed?src=65dc0af788aa48f5a2acdd219617f11f02f3b80a242461d49182cc68b3f98a09%40group.calendar.google.com&ctz=Asia%2FJerusalem" 
            className="w-full h-full"
            frameBorder="0"
            scrolling="no"
            title="Ilana's Availability Calendar"
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AvailabilityCalendarDialog;
