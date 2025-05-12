import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookingFormSchema, BookingFormValues } from '@/schemas/bookingFormSchema';
import { fetchAndParseICS, getAvailableTimeSlots, TimeSlot } from '@/utils/availability'; // Updated import
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';
import DurationSelector from './DurationSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { ZAPIER_WEBHOOKS, sendToZapier } from '@/utils/webhooks';
import ICAL from 'ical.js'; // Import ICAL for type usage if needed

interface BookingFormProps {
  availableDays: Date[]; // This might become dynamic or less relevant if all days are initially open
  // availabilityByDate: Record<string, TimeSlot[]>; // This will be replaced by ICS logic
  onSubmitSuccess: () => void;
}

const CALENDAR_URL = 'https://calendar.google.com/calendar/ical/ilana.cunningham16%40gmail.com/public/basic.ics';

const BookingForm: React.FC<BookingFormProps> = ({
  availableDays, // Keep for now, might be used for initial calendar day enabling
  onSubmitSuccess
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [icsEvents, setIcsEvents] = useState<ICAL.Event[]>([]); // Store fetched ICS events
  const isMobile = useIsMobile();
  
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(BookingFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: undefined,
      startTime: "",
      duration: 2,
      children: "1",
      notes: "",
    },
  });

  // Fetch ICS events once on component mount
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingSlots(true);
      try {
        const events = await fetchAndParseICS(CALENDAR_URL);
        setIcsEvents(events);
      } catch (error) {
        console.error("Failed to load calendar events:", error);
        toast.error("Could not load availability. Please try again later.");
      }
      setIsLoadingSlots(false);
    };
    loadEvents();
  }, []);

  // Update available time slots when selectedDate or icsEvents change
  useEffect(() => {
    if (selectedDate && icsEvents.length > 0) {
      setIsLoadingSlots(true);
      const slots = getAvailableTimeSlots(selectedDate, icsEvents);
      setAvailableTimeSlots(slots);
      
      const currentTime = form.getValues('startTime');
      const isCurrentTimeAvailable = slots.some(slot => slot.time === currentTime && slot.available);
      
      if (currentTime && !isCurrentTimeAvailable) {
        form.setValue('startTime', ''); // Reset if current time is no longer available
      }
      setIsLoadingSlots(false);
    } else if (selectedDate && !icsEvents.length && !isLoadingSlots) {
        // If date is selected, but events are not loaded yet (and not currently loading them from initial fetch)
        // this case might indicate an issue or a state where we assume all slots are free until events load.
        // For now, let's provide all slots as available if ICS hasn't loaded, or show a loading state.
        // For simplicity, we'll show loading if selectedDate is present but icsEvents are empty.
        // The main loading is handled by the initial fetch.
        // If icsEvents is empty after fetch, getAvailableTimeSlots will correctly return all slots as available if no events overlap.
        const slots = getAvailableTimeSlots(selectedDate, []); // Pass empty events if none loaded
        setAvailableTimeSlots(slots);
    } else {
      setAvailableTimeSlots([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, icsEvents, form.getValues('startTime')]); // form needed for startTime dependency

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    form.setValue('date', date, { shouldValidate: true });
    form.setValue('startTime', ''); // Reset time when date changes
  };

  async function onSubmit(data: BookingFormValues) {
    setIsSubmitting(true);
    console.log("Form submitted:", data);
    
    try {
      const formattedDate = data.date ? format(data.date, 'PPPP') : 'No date selected';
      
      const bookingData = {
        type: 'booking',
        ...data,
        formattedDate,
        submissionTime: new Date().toISOString(),
        recipientEmail: 'ilana.cunningham16@gmail.com',
        subject: `Booking Request from ${data.name}`,
      };
      
      const success = await sendToZapier(ZAPIER_WEBHOOKS.booking, bookingData);
      
      if (success) {
        onSubmitSuccess();
      } else {
        toast.error("There was an error submitting your booking. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("There was an error submitting booking. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Your Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} className="text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} className="text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Your phone number" {...field} className="text-sm" />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="children"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm">Number of Children</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 child</SelectItem>
                    <SelectItem value="2">2 children</SelectItem>
                    <SelectItem value="3">3 children</SelectItem>
                    <SelectItem value="4+">4+ children</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <DateSelector 
            availableDays={availableDays} // This could be an array of all days if not pre-filtering
            onDateChange={handleDateChange}
            selectedDate={selectedDate} // Pass selectedDate to DateSelector
            name={form.control.name} // Pass name for FormField integration
            control={form.control} // Pass control for FormField integration
          />

          <TimeSlotSelector
            availableTimeSlots={availableTimeSlots}
            selectedDate={selectedDate}
            isLoading={isLoadingSlots} // Pass loading state
            name={form.control.name} // Pass name for FormField integration
            control={form.control} // Pass control for FormField integration
          />
        </div>

        <DurationSelector 
            name={form.control.name} // Pass name for FormField integration
            control={form.control} // Pass control for FormField integration
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm">Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Special requests, needs, or information"
                  {...field}
                  className="text-sm"
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <div className="flex items-start p-3 sm:p-4 bg-secondary/20 rounded-lg mt-4 sm:mt-6">
          <Info className="h-4 w-4 sm:h-5 sm:w-5 text-secondary-foreground mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-xs sm:text-sm text-foreground/80">
            <p className="mb-1 font-medium">Booking Information:</p>
            <ul className="list-disc pl-4 space-y-0.5 sm:space-y-1">
              <li>2 hour minimum booking required</li>
              <li>Base rate for 1 child - ₪50/hour</li>
              <li>Multiple children or special needs may have different rates</li>
              <li>Your booking is a request until confirmed by Ilana</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button 
            type="submit" 
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-6 sm:px-8 text-sm h-9 sm:h-10"
            disabled={!form.formState.isValid || isSubmitting || isLoadingSlots}
          >
            {isSubmitting ? "Submitting..." : (isLoadingSlots ? "Loading Availability..." : "Submit Booking Request")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BookingForm;

