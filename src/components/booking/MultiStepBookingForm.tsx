import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { fetchBusyEvents, getAvailableTimeSlots, TimeSlot, BUSINESS_HOURS } from '@/utils/availability';
import { BusyEvent } from '@/utils/calendarScraper';
import DateSelector from './DateSelector';
import TimeSlotSelector from './TimeSlotSelector';
import DurationSelector from './DurationSelector';
import { useIsMobile } from '@/hooks/use-mobile';
import { ZAPIER_WEBHOOKS, sendToZapier } from '@/utils/webhooks';

interface MultiStepBookingFormProps {
  onSubmitSuccess: () => void;
}

const CALENDAR_URL = 'https://calendar.google.com/calendar/embed?src=ilana.cunningham16%40gmail.com&ctz=Asia%2FJerusalem';

const MultiStepBookingForm: React.FC<MultiStepBookingFormProps> = ({ onSubmitSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [busyEvents, setBusyEvents] = useState<BusyEvent[]>([]);
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

  // Fetch busy events once on component mount
  useEffect(() => {
    const loadEvents = async () => {
      setIsLoadingSlots(true);
      try {
        const events = await fetchBusyEvents(CALENDAR_URL);
        setBusyEvents(events);
      } catch (error) {
        console.error("Failed to load calendar events:", error);
        toast.error("Could not load availability. Please try again later.");
      }
      setIsLoadingSlots(false);
    };
    loadEvents();
  }, []);

  // Update available time slots when selectedDate, busyEvents, or duration change
  useEffect(() => {
    if (selectedDate && busyEvents.length >= 0) {
      setIsLoadingSlots(true);
      const duration = form.getValues('duration');
      const slotDurationMinutes = duration * 60; // Convert hours to minutes
      const slots = getAvailableTimeSlots(selectedDate, busyEvents, 15); // 15-minute intervals
      
      // Filter slots to ensure enough consecutive time for the booking duration
      const filteredSlots = slots.filter((slot, index) => {
        if (!slot.available) return false;
        
        // Check if there are enough consecutive available slots for the duration
        const slotsNeeded = Math.ceil(slotDurationMinutes / 15);
        for (let i = 0; i < slotsNeeded; i++) {
          if (index + i >= slots.length || !slots[index + i].available) {
            return false;
          }
        }
        return true;
      });
      
      setAvailableTimeSlots(filteredSlots);
      
      const currentTime = form.getValues('startTime');
      const isCurrentTimeAvailable = filteredSlots.some(slot => slot.time === currentTime);
      
      if (currentTime && !isCurrentTimeAvailable) {
        form.setValue('startTime', '');
      }
      setIsLoadingSlots(false);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, busyEvents, form.watch('duration')]);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    form.setValue('date', date, { shouldValidate: true });
    form.setValue('startTime', ''); // Reset time when date changes
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToStep = (step: number): boolean => {
    switch (step) {
      case 2:
        return form.getValues('duration') >= 2;
      case 3:
        return !!form.getValues('date');
      case 4:
        return !!form.getValues('startTime');
      default:
        return true;
    }
  };

  async function onSubmit(data: BookingFormValues) {
    setIsSubmitting(true);
    console.log("Form submitted:", data);
    
    try {
      const formattedDate = data.date ? format(data.date, 'PPPP') : 'No date selected';
      
      const bookingData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        children: data.children,
        date: formattedDate,
        startTime: data.startTime,
        duration: data.duration,
        comments: data.comments || '',
      };
      
      // Submit to Flask backend
      const response = await fetch('https://nghki1c8818y.manus.space/api/submit-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        onSubmitSuccess();
        toast.success("Booking request submitted successfully! Confirmation emails have been sent.");
      } else {
        toast.error(result.error || "There was an error submitting your booking. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("There was an error submitting booking. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Step 1: Select Duration</h3>
              <p className="text-sm text-muted-foreground">Choose how long you need babysitting services</p>
            </div>
            <DurationSelector name="duration" control={form.control} />
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Step 2: Select Date</h3>
              <p className="text-sm text-muted-foreground">Choose your preferred date</p>
            </div>
            <DateSelector 
              onDateChange={handleDateChange}
              selectedDate={selectedDate}
              name="date"
              control={form.control}
            />
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Step 3: Select Time</h3>
              <p className="text-sm text-muted-foreground">Choose your preferred start time</p>
            </div>
            <TimeSlotSelector
              availableTimeSlots={availableTimeSlots}
              selectedDate={selectedDate}
              isLoading={isLoadingSlots}
              name="startTime"
              control={form.control}
            />
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Step 4: Personal Information</h3>
              <p className="text-sm text-muted-foreground">Tell us about yourself and your needs</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm">Full Name</FormLabel>
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
                    <FormLabel className="text-sm">Email</FormLabel>
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
                        <SelectItem value="4">4 children</SelectItem>
                        <SelectItem value="5+">5+ children</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm">Questions/Comments/Concerns</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any special requests, needs, or information you'd like to share..."
                      {...field}
                      className="text-sm min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  const getStepStatus = (step: number) => {
    if (step < currentStep) return 'completed';
    if (step === currentStep) return 'current';
    return 'upcoming';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3, 4].map((step) => {
            const status = getStepStatus(step);
            return (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    status === 'completed'
                      ? 'bg-green-500 text-white'
                      : status === 'current'
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {status === 'completed' ? <Check className="w-4 h-4" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-8 h-0.5 mx-2 transition-colors ${
                      step < currentStep ? 'bg-green-500' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          {currentStep < 4 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!canProceedToStep(currentStep + 1) || isLoadingSlots}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              disabled={!form.formState.isValid || isSubmitting || isLoadingSlots}
              className="flex items-center space-x-2"
            >
              {isSubmitting ? "Submitting..." : "Submit Booking Request"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default MultiStepBookingForm;

