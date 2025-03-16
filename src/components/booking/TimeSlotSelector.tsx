
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
}

const TimeSlotSelector: React.FC<TimeSlotSelectorProps> = ({ availableTimeSlots, selectedDate }) => {
  const getAvailableTimes = () => {
    return availableTimeSlots.filter(slot => slot.available);
  };

  const getUnavailableTimes = () => {
    return availableTimeSlots.filter(slot => !slot.available);
  };

  return (
    <FormField
      name="startTime"
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
            defaultValue={field.value}
            disabled={!selectedDate}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={selectedDate ? "Select a time" : "First select a date"} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {getAvailableTimes().length > 0 ? (
                <>
                  {/* Available times */}
                  <SelectItem value="available-times-header" disabled className="font-semibold text-xs opacity-70">
                    Available Times
                  </SelectItem>
                  {getAvailableTimes().map((slot) => (
                    <SelectItem key={slot.time} value={slot.time}>
                      {slot.time}
                    </SelectItem>
                  ))}
                  
                  {/* Unavailable times */}
                  {getUnavailableTimes().length > 0 && (
                    <>
                      <SelectItem value="unavailable-times-header" disabled className="font-semibold text-xs opacity-70 mt-2">
                        Busy - Unavailable Times
                      </SelectItem>
                      {getUnavailableTimes().map((slot) => (
                        <SelectItem 
                          key={slot.time} 
                          value={`unavailable-${slot.time}`} 
                          disabled 
                          className="text-gray-400 line-through"
                        >
                          {slot.time}
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
