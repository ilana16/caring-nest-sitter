
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

  function onSubmit(data: BookingFormValues) {
    console.log("Form submitted:", data);
    onSubmitSuccess();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Your phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="children"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Children</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
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
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <FormLabel>Additional Notes (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Special requests, needs, or information"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-start p-4 bg-secondary/20 rounded-lg mt-6">
          <Info className="h-5 w-5 text-secondary-foreground mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-foreground/80">
            <p className="mb-1 font-medium">Booking Information:</p>
            <ul className="list-disc pl-4 space-y-1">
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
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
            disabled={!form.formState.isValid}
          >
            Submit Booking Request
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BookingForm;
