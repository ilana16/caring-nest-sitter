
import { addMonths, eachDayOfInterval, format, getDay } from 'date-fns';

export interface TimeSlot {
  time: string;
  available: boolean;
}

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
  
  availableDays.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const timeSlots: TimeSlot[] = [];
    
    const startHour = 9;
    const startMinutes = 30;
    const endHour = 23;
    const endMinutes = 30;
    
    for (let hour = startHour; hour <= endHour; hour++) {
      if (hour === startHour) {
        // For 9:30 AM
        const timeString = hour < 12 
          ? `${hour}:${startMinutes.toString().padStart(2, '0')} AM` 
          : `${hour === 12 ? 12 : hour - 12}:${startMinutes.toString().padStart(2, '0')} PM`;
        
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
      
      // Add half-hour slots
      if (hour < endHour || (hour === endHour && endMinutes > 0)) {
        const halfHourString = hour < 12 
          ? `${hour}:30 AM` 
          : `${hour === 12 ? 12 : hour - 12}:30 PM`;
        
        timeSlots.push({
          time: halfHourString,
          available: true
        });
      }
    }
    
    if (endMinutes > 0) {
      const endTimeString = endHour < 12 
        ? `${endHour}:${endMinutes.toString().padStart(2, '0')} AM` 
        : `${endHour === 12 ? 12 : endHour - 12}:${endMinutes.toString().padStart(2, '0')} PM`;
      
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
