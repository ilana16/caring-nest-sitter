
import React from 'react';
import {
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
import { TimeSlot } from '@/utils/availability';
import { Info } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TimeSlotSelectorProps {
  availableTimeSlots: TimeSlot[];
  selectedDate: Date | undefined;
  isLoading?: boolean;
  name: string;
  control: any;
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ 
  availableTimeSlots, 
  selectedDate, 
  isLoading = false,
  name,
  control 
}) => {
  const getAvailableTimes = () => {
    return availableTimeSlots.filter(slot => slot.available);
  };

  const getUnavailableTimes = () => {
    return availableTimeSlots.filter(slot => !slot.available);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel>Start Time</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">Times within 42 hours are unavailable</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select 
            onValueChange={field.onChange} 
            value={field.value}
            disabled={!selectedDate || isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={
                  isLoading ? "Loading times..." : 
                  selectedDate ? "Select a time" : 
                  "First select a date"
                } />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Loading available times...
                </SelectItem>
              ) : availableTimeSlots.length > 0 ? (
                <>
                  {/* Available times */}
                  {getAvailableTimes().length > 0 && (
                    <>
                      <SelectItem value="available-times-header" disabled className="font-semibold text-xs opacity-70 text-green-600">
                        ✓ Available Times
                      </SelectItem>
                      {getAvailableTimes().map((slot) => (
                        <SelectItem 
                          key={slot.time} 
                          value={slot.time}
                          className="font-medium text-green-700"
                        >
                          {slot.time}
                        </SelectItem>
                      ))}
                    </>
                  )}
                  
                  {/* Unavailable times */}
                  {getUnavailableTimes().length > 0 && (
                    <>
                      <SelectItem value="unavailable-times-header" disabled className="font-semibold text-xs opacity-70 mt-2 text-red-600">
                        ✗ Busy - Unavailable Times
                      </SelectItem>
                      {getUnavailableTimes().map((slot) => (
                        <SelectItem 
                          key={`unavailable-${slot.time}`} 
                          value={`unavailable-${slot.time}`} 
                          disabled 
                          className="text-gray-400 line-through opacity-60 bg-gray-50"
                        >
                          <span className="line-through text-red-400">{slot.time}</span>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <SelectItem value="no-times-available" disabled>
                  No available times for this date
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          
          {/* Notice about 42 hour requirement */}
          <div className="text-xs text-muted-foreground mt-1">
            Times within 42 hours from now are unavailable
          </div>
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TimeSlotSelector;
