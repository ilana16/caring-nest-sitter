
import React, { useEffect, useState } from 'react';
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
import { TimeSlot } from '@/utils/availability';
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';
import DurationSelector from './DurationSelector';
import { useIsMobile } from '@/hooks/use-mobile';

interface BookingFormProps {
  availableDays: Date[];
  availabilityByDate: Record<string, TimeSlot[]>;
  onSubmitSuccess: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({
  availableDays,
  availabilityByDate,
  onSubmitSuccess
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  useEffect(() => {
    if (selectedDate) {
      const dateKey = format(selectedDate, 'yyyy-MM-dd');
      const slots = availabilityByDate[dateKey] || [];
      setAvailableTimeSlots(slots);
      
      const currentTime = form.getValues('startTime');
      const isCurrentTimeAvailable = slots.some(slot => slot.time === currentTime && slot.available);
      
      if (currentTime && !isCurrentTimeAvailable) {
        form.setValue('startTime', '');
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, availabilityByDate, form]);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  async function onSubmit(data: BookingFormValues) {
    setIsSubmitting(true);
    console.log("Form submitted:", data);
    
    try {
      // Format the date for better readability
      const formattedDate = data.date ? format(data.date, 'PPPP') : 'No date selected';
      
      // Prepare booking data for submission
      const bookingData = {
        type: 'booking',
        ...data,
        formattedDate,
        submissionTime: new Date().toISOString(),
      };
      
      // Send to Zapier webhook which will handle email and Google Drive integration
      await fetch('https://hooks.zapier.com/hooks/catch/123456/bookingxyz/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors', // Handle CORS issues
        body: JSON.stringify({
          ...bookingData,
          recipientEmail: 'ilana.cunningham16@gmail.com',
          subject: `Booking Request from ${data.name}`,
        }),
      });
      
      // Call the success callback to show success message
      onSubmitSuccess();
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("There was an error submitting your booking. Please try again later.");
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
            availableDays={availableDays}
            onDateChange={handleDateChange}
          />

          <TimeSlotSelector
            availableTimeSlots={availableTimeSlots}
            selectedDate={selectedDate}
          />
        </div>

        <DurationSelector />

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
            disabled={!form.formState.isValid || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Booking Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BookingForm;
