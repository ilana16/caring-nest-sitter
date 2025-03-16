import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, Info } from 'lucide-react';
import { format, addDays, isWeekend, startOfMonth, addMonths, eachDayOfInterval, isBefore, isAfter, isEqual, setHours, setMinutes, getHours, getMinutes, addHours, getDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import AnimatedButton from '@/components/AnimatedButton';
import PageTransition from '@/components/PageTransition';

interface TimeSlot {
  time: string;
  available: boolean;
}

const generateMockAvailability = () => {
  const today = new Date();
  const nextMonth = addMonths(today, 1);
  
  const allDays = eachDayOfInterval({
    start: today,
    end: nextMonth,
  });
  
  const availableDays = allDays.filter(day => {
    const dayOfWeek = getDay(day);
    return dayOfWeek >= 0 && dayOfWeek <= 4;
  });
  
  const availabilityByDate: Record<string, TimeSlot[]> = {};
  
  availableDays.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const timeSlots: TimeSlot[] = [];
    
    const startHour = 9;
    const startMinutes = 30;
    const endHour = 23;
    const endMinutes = 30;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      if (hour === startHour) {
        const timeString = hour < 12 
          ? `${hour}:${startMinutes} AM` 
          : `${hour === 12 ? 12 : hour - 12}:${startMinutes} PM`;
        
        timeSlots.push({
          time: timeString,
          available: true
        });
        continue;
      }
      
      if (hour === endHour && endMinutes === 0) {
        continue;
      }
      
      const timeString = hour < 12 
        ? `${hour}:00 AM` 
        : `${hour === 12 ? 12 : hour - 12}:00 PM`;
      
      timeSlots.push({
        time: timeString,
        available: true
      });
      
      if (hour < endHour || (hour === endHour && endMinutes > 30)) {
        const halfHourString = hour < 12 
          ? `${hour}:30 AM` 
          : `${hour === 12 ? 12 : hour - 12}:30 PM`;
        
        timeSlots.push({
          time: halfHourString,
          available: true
        });
      }
    }
    
    if (endMinutes === 30) {
      const endTimeString = endHour < 12 
        ? `${endHour}:${endMinutes} AM` 
        : `${endHour === 12 ? 12 : endHour - 12}:${endMinutes} PM`;
      
      timeSlots.push({
        time: endTimeString,
        available: true
      });
    }
    
    availabilityByDate[dateKey] = timeSlots;
  });
  
  return {
    availableDays,
    availabilityByDate
  };
};

const BookingFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phone: z.string().min(9, { message: "Please enter a valid phone number." }),
  date: z.date({
    required_error: "Please select a date for your booking.",
  }),
  startTime: z.string({
    required_error: "Please select a start time.",
  }),
  duration: z.number({
    required_error: "Please select a duration.",
  }).min(2).max(6),
  children: z.string().min(1, { message: "Please enter the number of children." }),
  notes: z.string().optional(),
});

type BookingFormValues = z.infer<typeof BookingFormSchema>;

const Booking = () => {
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [availability, setAvailability] = useState(() => generateMockAvailability());
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
      const slots = availability.availabilityByDate[dateKey] || [];
      setAvailableTimeSlots(slots);
      
      const currentTime = form.getValues('startTime');
      const isCurrentTimeAvailable = slots.some(slot => slot.time === currentTime && slot.available);
      
      if (currentTime && !isCurrentTimeAvailable) {
        form.setValue('startTime', '');
      }
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, availability, form]);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    form.setValue('date', date as Date);
  };

  const getAvailableTimes = () => {
    return availableTimeSlots.filter(slot => slot.available);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Select a date';
    return format(date, 'PPP');
  };

  function onSubmit(data: BookingFormValues) {
    console.log("Form submitted:", data);
    setBookingSuccess(true);
  }

  return (
    <PageTransition>
      <div className="min-h-screen py-12 md:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Availability & Booking</h1>
            <p className="text-lg text-center text-foreground/80 mb-12 max-w-2xl mx-auto">
              Fill out the form below to book a time slot for babysitting services
            </p>
            
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="glass-card p-6 md:p-8 mb-8"
              >
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <CalendarIcon className="h-6 w-6 text-accent" />
                  <h2 className="text-xl font-semibold">Book A Session</h2>
                </div>
                
                {bookingSuccess ? (
                  <Card className="bg-primary/20 border border-primary">
                    <CardHeader>
                      <CardTitle className="text-center">Booking Request Sent!</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-center mb-4">
                        Thank you for your booking request. Ilana will contact you shortly to confirm your booking.
                      </p>
                      <div className="flex justify-center">
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setBookingSuccess(false);
                            form.reset();
                            setSelectedDate(undefined);
                          }}
                        >
                          Make Another Booking
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
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
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Date</FormLabel>
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
                                    onSelect={(date) => handleDateChange(date)}
                                    availableDays={availability.availableDays}
                                    disabled={(date) => {
                                      const today = new Date();
                                      today.setHours(0, 0, 0, 0);
                                      
                                      const isAvailable = availability.availableDays.some(
                                        availableDate => 
                                          availableDate.getDate() === date.getDate() &&
                                          availableDate.getMonth() === date.getMonth() &&
                                          availableDate.getFullYear() === date.getFullYear()
                                      );
                                      
                                      return isBefore(date, today) || !isAvailable;
                                    }}
                                    initialFocus
                                    className={cn("p-3 pointer-events-auto")}
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="startTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Start Time</FormLabel>
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
                                    getAvailableTimes().map((slot) => (
                                      <SelectItem key={slot.time} value={slot.time}>
                                        {slot.time}
                                      </SelectItem>
                                    ))
                                  ) : (
                                    <SelectItem value="no-times-available" disabled>
                                      No available times for this date
                                    </SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
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
                )}
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-center"
              >
                <p className="text-lg mb-6 text-foreground/80">
                  After submitting your booking request, Ilana will contact you to confirm the details
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="border-primary text-primary-foreground">
                        <CalendarIcon className="mr-2 h-4 w-4" /> View Full Availability Calendar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Ilana's Full Availability Calendar</DialogTitle>
                        <DialogDescription>
                          This calendar shows all currently booked times
                        </DialogDescription>
                      </DialogHeader>
                      <div className="aspect-video w-full mb-4 overflow-hidden rounded-lg border border-border">
                        <iframe 
                          src="https://calendar.google.com/calendar/embed?src=65dc0af788aa48f5a2acdd219617f11f02f3b80a242461d49182cc68b3f98a09%40group.calendar.google.com&ctz=Asia%2FJerusalem" 
                          className="w-full h-full"
                          frameBorder="0"
                          scrolling="no"
                          title="Ilana's Availability Calendar"
                        ></iframe>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <AnimatedButton 
                    to="/contact" 
                    className="bg-muted hover:bg-muted/90 text-muted-foreground"
                  >
                    Have Questions? Contact Ilana
                  </AnimatedButton>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Booking;
