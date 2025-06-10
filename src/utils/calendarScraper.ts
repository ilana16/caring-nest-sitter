import { TimeSlot } from './availability';

export interface BusyEvent {
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  title: string;
}

/**
 * Scrapes Google Calendar embed page to extract busy events
 * @param calendarUrl The Google Calendar embed URL
 * @returns Promise<BusyEvent[]> Array of busy events
 */
export async function scrapeGoogleCalendar(calendarUrl: string): Promise<BusyEvent[]> {
  try {
    // For now, we'll use a proxy approach or direct fetch if CORS allows
    // In a real implementation, this might need a backend proxy
    const response = await fetch(calendarUrl);
    const html = await response.text();
    
    // Parse the HTML to extract busy events
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const busyEvents: BusyEvent[] = [];
    
    // Look for elements containing "busy" text
    const busyElements = doc.querySelectorAll('div[aria-label*="busy"], div[title*="busy"]');
    
    busyElements.forEach(element => {
      const text = element.textContent || '';
      const ariaLabel = element.getAttribute('aria-label') || '';
      
      // Extract time and date information from the text/aria-label
      const timeMatch = text.match(/(\d{1,2}):?(\d{0,2})(am|pm)?/gi);
      const dateMatch = ariaLabel.match(/(\w+\s+\d{1,2},\s+\d{4})/);
      
      if (timeMatch && dateMatch) {
        // Parse the extracted information
        const date = new Date(dateMatch[1]);
        const dateStr = date.toISOString().split('T')[0];
        
        // For now, we'll extract basic time info
        // This is a simplified version - real implementation would be more robust
        busyEvents.push({
          date: dateStr,
          startTime: timeMatch[0] || '00:00',
          endTime: timeMatch[1] || '01:00',
          title: 'busy'
        });
      }
    });
    
    return busyEvents;
  } catch (error) {
    console.error('Error scraping Google Calendar:', error);
    return [];
  }
}

/**
 * Business hours configuration for Israel timezone
 * Sunday-Thursday 7:30-23:30
 */
export const BUSINESS_HOURS = {
  // Days of week: 0=Sunday, 1=Monday, ..., 6=Saturday
  workingDays: [0, 1, 2, 3, 4], // Sunday through Thursday
  startHour: 7,
  startMinute: 30,
  endHour: 23,
  endMinute: 30
};

/**
 * Checks if a given date/time falls within business hours
 */
export function isWithinBusinessHours(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const hour = date.getHours();
  const minute = date.getMinutes();
  
  // Check if it's a working day
  if (!BUSINESS_HOURS.workingDays.includes(dayOfWeek)) {
    return false;
  }
  
  // Check if it's within working hours
  const timeInMinutes = hour * 60 + minute;
  const startTimeInMinutes = BUSINESS_HOURS.startHour * 60 + BUSINESS_HOURS.startMinute;
  const endTimeInMinutes = BUSINESS_HOURS.endHour * 60 + BUSINESS_HOURS.endMinute;
  
  return timeInMinutes >= startTimeInMinutes && timeInMinutes <= endTimeInMinutes;
}

/**
 * Adds buffer time around busy events
 * @param busyEvents Array of busy events
 * @param bufferMinutes Buffer time in minutes (default: 60)
 */
export function addBufferToBusyEvents(busyEvents: BusyEvent[], bufferMinutes: number = 60): BusyEvent[] {
  return busyEvents.map(event => {
    const startTime = parseTime(event.startTime);
    const endTime = parseTime(event.endTime);
    
    // Add buffer before and after
    const bufferedStart = new Date(startTime.getTime() - bufferMinutes * 60000);
    const bufferedEnd = new Date(endTime.getTime() + bufferMinutes * 60000);
    
    return {
      ...event,
      startTime: formatTime(bufferedStart),
      endTime: formatTime(bufferedEnd)
    };
  });
}

/**
 * Parse time string to Date object (using today's date)
 */
function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Format Date object to HH:MM string
 */
function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

/**
 * Generate available time slots for a specific date considering business hours,
 * busy events, and buffer times
 */
export function generateAvailableTimeSlots(
  selectedDate: Date,
  busyEvents: BusyEvent[],
  slotDurationMinutes: number = 15
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dateStr = selectedDate.toISOString().split('T')[0];
  
  // Filter busy events for the selected date
  const dayBusyEvents = busyEvents.filter(event => event.date === dateStr);
  
  // Generate time slots from business start to end
  const startTime = new Date(selectedDate);
  startTime.setHours(BUSINESS_HOURS.startHour, BUSINESS_HOURS.startMinute, 0, 0);
  
  const endTime = new Date(selectedDate);
  endTime.setHours(BUSINESS_HOURS.endHour, BUSINESS_HOURS.endMinute, 0, 0);
  
  const currentSlot = new Date(startTime);
  
  while (currentSlot < endTime) {
    const slotEnd = new Date(currentSlot.getTime() + slotDurationMinutes * 60000);
    
    // Check if this slot conflicts with any busy event
    const isAvailable = !dayBusyEvents.some(event => {
      const eventStart = parseTimeWithDate(event.startTime, selectedDate);
      const eventEnd = parseTimeWithDate(event.endTime, selectedDate);
      
      // Check for overlap
      return currentSlot < eventEnd && slotEnd > eventStart;
    });
    
    slots.push({
      time: formatTime(currentSlot),
      available: isAvailable && isWithinBusinessHours(currentSlot)
    });
    
    // Move to next slot
    currentSlot.setTime(currentSlot.getTime() + slotDurationMinutes * 60000);
  }
  
  return slots;
}

/**
 * Parse time string with specific date
 */
function parseTimeWithDate(timeStr: string, date: Date): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

