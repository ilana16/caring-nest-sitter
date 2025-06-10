
import { z } from 'zod';

export const BookingFormSchema = z.object({
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
  }).min(2).max(10), // Updated to support 2-10 hours
  children: z.enum(["1", "2", "3", "4", "5+"], {
    required_error: "Please select the number of children.",
  }),
  notes: z.string().optional(),
});

export type BookingFormValues = z.infer<typeof BookingFormSchema>;
