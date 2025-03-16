
import { addMonths, eachDayOfInterval, format, getDay, addHours, isAfter } from 'date-fns';

export interface TimeSlot {
  time: string;
  available: boolean;
}

// Helper function to generate busy times (in a real app, this would come from a calendar API)
const generateBusyTimes = (): Record<string, string[]> => {
  // Sample busy times for demonstration
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  
  // Next day
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');
  
  // Sample busy times for different days
  return {
    [todayStr]: ['10:00 AM', '2:30 PM', '5:00 PM'],
    [tomorrowStr]: ['9:30 AM', '1:00 PM', '4:30 PM'],
  };
};

// Helper function to check if a date and time combination is within the 42 hour notice period
const isWithin42HourNotice = (date: Date, timeStr: string): boolean => {
  // Parse the time string to get hours and minutes
  const isPM = timeStr.includes('PM');
  const is12Hour = timeStr.includes('12:') && isPM;
  
  let [hourMin] = timeStr.split(' ');
  let [hours, minutes] = hourMin.split(':').map(Number);
  
  // Convert to 24-hour format
  if (isPM && !is12Hour) {
    hours += 12;
  }
  
  // Create a new date object with the specified time
  const dateTime = new Date(date);
  dateTime.setHours(hours, minutes, 0, 0);
  
  // Calculate the minimum booking time (now + 42 hours)
  const now = new Date();
  const minBookingTime = addHours(now, 42);
  
  // Return true if the date/time is before the minimum booking time
  return !isAfter(dateTime, minBookingTime);
};

export const generateMockAvailability = () => {
  const today = new Date();
  const nextMonth = addMonths(today, 1);
  
  const allDays = eachDayOfInterval({
    start: today,
    end: nextMonth,
  });
  
  const availableDays = allDays.filter(day => {
    const dayOfWeek = getDay(day);
    // Sunday (0) to Thursday (4)
    return dayOfWeek >= 0 && dayOfWeek <= 4;
  });
  
  const availabilityByDate: Record<string, TimeSlot[]> = {};
  const busyTimes = generateBusyTimes();
  
  availableDays.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const timeSlots: TimeSlot[] = [];
    
    // Make sure these are treated as general numbers, not literal types
    const startHour: number = 9;
    const startMinutes: number = 30;
    const endHour: number = 23;
    const endMinutes: number = 30;
    
    // Get busy times for this date
    const busyTimesForDate = busyTimes[dateKey] || [];
    
    for (let hour = startHour; hour <= endHour; hour++) {
      if (hour === startHour) {
        // For 9:30 AM
        const timeString = hour < 12 
          ? `${hour}:${startMinutes.toString().padStart(2, '0')} AM` 
          : `${hour === 12 ? 12 : hour - 12}:${startMinutes.toString().padStart(2, '0')} PM`;
        
        timeSlots.push({
          time: timeString,
          available: !busyTimesForDate.includes(timeString) && !isWithin42HourNotice(day, timeString)
        });
        continue;
      }
      
      // Compare as numbers, not literal types
      if (hour === endHour && endMinutes === 0) {
        continue;
      }
      
      const timeString = hour < 12 
        ? `${hour}:00 AM` 
        : `${hour === 12 ? 12 : hour - 12}:00 PM`;
      
      timeSlots.push({
        time: timeString,
        available: !busyTimesForDate.includes(timeString) && !isWithin42HourNotice(day, timeString)
      });
      
      // Add half-hour slots
      if (hour < endHour || (hour === endHour && endMinutes > 0)) {
        const halfHourString = hour < 12 
          ? `${hour}:30 AM` 
          : `${hour === 12 ? 12 : hour - 12}:30 PM`;
        
        timeSlots.push({
          time: halfHourString,
          available: !busyTimesForDate.includes(halfHourString) && !isWithin42HourNotice(day, halfHourString)
        });
      }
    }
    
    if (endMinutes > 0) {
      const endTimeString = endHour < 12 
        ? `${endHour}:${endMinutes.toString().padStart(2, '0')} AM` 
        : `${endHour === 12 ? 12 : endHour - 12}:${endMinutes.toString().padStart(2, '0')} PM`;
      
      timeSlots.push({
        time: endTimeString,
        available: !busyTimesForDate.includes(endTimeString) && !isWithin42HourNotice(day, endTimeString)
      });
    }
    
    availabilityByDate[dateKey] = timeSlots;
  });
  
  return {
    availableDays,
    availabilityByDate
  };
};
