
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

const DurationSelector: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <FormField
      name="duration"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm">Duration (2-6 hours): {field.value} hours</FormLabel>
          <FormControl>
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
              <Slider
                min={2}
                max={6}
                step={1}
                defaultValue={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
                className="flex-1 touch-target"
              />
              <span className="w-8 sm:w-12 text-center text-sm">{field.value}h</span>
            </div>
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};

export default DurationSelector;
