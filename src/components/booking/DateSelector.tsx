
import React from 'react';
import { format, addHours, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
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
import { BUSINESS_HOURS } from '@/utils/availability';

interface DateSelectorProps {
  availableDays?: Date[];
  onDateChange: (date: Date | undefined) => void;
  selectedDate?: Date;
  name: string;
  control: any;
}

const DateSelector: React.FC<DateSelectorProps> = ({ 
  availableDays = [], 
  onDateChange, 
  selectedDate,
  name,
  control 
}) => {
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select a date';
    return format(date, 'PPP');
  };

  // Calculate the earliest available date (now + 42 hours)
  const now = new Date();
  const minBookingTime = addHours(now, 42);
  const minBookingDate = new Date(minBookingTime);
  minBookingDate.setHours(0, 0, 0, 0); // Set to start of day

  // Check if a date is a working day based on business hours
  const isWorkingDay = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    return BUSINESS_HOURS.workingDays.includes(dayOfWeek);
  };

  return (
    <FormField
      control={control}
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
                  <p className="max-w-xs">Bookings require at least 42 hours notice. Available Sunday-Thursday.</p>
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
                disabled={(date) => {
                  // Dates before the minimum booking date are disabled
                  const isBeforeMinBookingDate = date < minBookingDate;
                  
                  // Check if it's a working day
                  const isNotWorkingDay = !isWorkingDay(date);
                  
                  // If availableDays is provided and not empty, check against it
                  // Otherwise, allow all working days after the minimum date
                  let isNotInAvailableDays = false;
                  if (availableDays && availableDays.length > 0) {
                    isNotInAvailableDays = !availableDays.some(
                      availableDate => 
                        availableDate.getDate() === date.getDate() &&
                        availableDate.getMonth() === date.getMonth() &&
                        availableDate.getFullYear() === date.getFullYear()
                    );
                  }
                  
                  return isBeforeMinBookingDate || isNotWorkingDay || isNotInAvailableDays;
                }}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
          
          {/* Notice about 42 hour requirement */}
          <div className="text-xs text-muted-foreground mt-1">
            Bookings require at least 42 hours notice. Available Sunday-Thursday.
          </div>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateSelector;
