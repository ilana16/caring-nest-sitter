
import React from 'react';
import { Clock } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useIsMobile } from '@/hooks/use-mobile';

interface DurationSelectorProps {
  name: string;
  control: any;
}

const DurationSelector: React.FC<DurationSelectorProps> = ({ name, control }) => {
  const isMobile = useIsMobile();
  
  // Convert hours to quarter-hour increments (15-minute intervals)
  // 2 hours = 8 quarters, 10 hours = 40 quarters
  const formatDuration = (quarters: number): string => {
    const hours = Math.floor(quarters / 4);
    const minutes = (quarters % 4) * 15;
    if (minutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    return `${hours}h ${minutes}m`;
  };
  
  const parseDuration = (durationValue: number): number => {
    // Convert from hours (with decimals) to quarter-hour increments
    return Math.round(durationValue * 4);
  };
  
  const quartersToDuration = (quarters: number): number => {
    // Convert from quarter-hour increments back to hours (with decimals)
    return quarters / 4;
  };
  
  return (
    <FormField
      control={control}
      name="duration"
      render={({ field }) => {
        const quarters = parseDuration(field.value);
        
        return (
          <FormItem>
            <FormLabel className="text-sm">
              Duration (2-10 hours): {formatDuration(quarters)}
            </FormLabel>
            <FormControl>
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                <Slider
                  min={8} // 2 hours = 8 quarters
                  max={40} // 10 hours = 40 quarters
                  step={1} // 1 quarter = 15 minutes
                  value={[quarters]}
                  onValueChange={(value) => {
                    const newDuration = quartersToDuration(value[0]);
                    field.onChange(newDuration);
                  }}
                  className="flex-1 touch-target"
                />
                <span className="w-16 sm:w-20 text-center text-sm">
                  {formatDuration(quarters)}
                </span>
              </div>
            </FormControl>
            <FormMessage className="text-xs" />
          </FormItem>
        );
      }}
    />
  );
};

export default DurationSelector;
