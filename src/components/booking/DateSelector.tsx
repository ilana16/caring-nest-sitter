
import React from 'react';
import { format, addHours } from 'date-fns';
import { CalendarIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { useFormContext } from 'react-hook-form';
import { BookingFormValues } from '@/schemas/bookingFormSchema';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DateSelectorProps {
  availableDays: Date[];
  onDateChange: (date: Date | undefined) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ availableDays, onDateChange }) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select a date';
    return format(date, 'PPP');
  };

  // Calculate the earliest available date (now + 42 hours)
  const now = new Date();
  const minBookingTime = addHours(now, 42);
  const minBookingDate = new Date(minBookingTime);
  minBookingDate.setHours(0, 0, 0, 0); // Set to start of day

  return (
    <FormField
      name="date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <div className="flex items-center gap-2">
            <FormLabel>Date</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Bookings require at least 42 hours notice</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    formatDate(field.value)
                  ) : (
                    <span>Select a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  onDateChange(date);
                  field.onChange(date);
                }}
                availableDays={availableDays}
                disabled={(date) => {
                  // Dates before the minimum booking date are disabled
                  const isBeforeMinBookingDate = date < minBookingDate;
                  
                  const isAvailable = availableDays.some(
                    availableDate => 
                      availableDate.getDate() === date.getDate() &&
                      availableDate.getMonth() === date.getMonth() &&
                      availableDate.getFullYear() === date.getFullYear()
                  );
                  
                  return isBeforeMinBookingDate || !isAvailable;
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          {/* Notice about 42 hour requirement */}
          <div className="text-xs text-muted-foreground mt-1">
            Bookings require at least 42 hours notice
          </div>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateSelector;
