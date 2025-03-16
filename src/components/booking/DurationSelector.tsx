
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

const DurationSelector: React.FC = () => {
  return (
    <FormField
      name="duration"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Duration (2-6 hours): {field.value} hours</FormLabel>
          <FormControl>
            <div className="flex items-center space-x-4">
              <Clock className="h-5 w-5 text-accent" />
              <Slider
                min={2}
                max={6}
                step={1}
                defaultValue={[field.value]}
                onValueChange={(value) => field.onChange(value[0])}
                className="flex-1"
              />
              <span className="w-12 text-center">{field.value}h</span>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DurationSelector;
